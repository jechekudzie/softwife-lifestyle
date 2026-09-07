<?php

namespace Tests\Feature\Admin;

use App\Actions\ReceiveStockBatch;
use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockBatchTest extends TestCase
{
    use RefreshDatabase;

    private Product $product;

    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->admin()->create());
        $this->product = Product::factory()->create();
        $this->variant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
            'colourway_id' => Colourway::factory(),
            'size' => 'M',
            'stock' => 4,
        ]);
    }

    public function test_receiving_a_batch_adds_to_stock_rather_than_replacing_it(): void
    {
        $this->post(route('admin.products.batches', $this->product), [
            'reference' => 'AUG-RUN-01',
            'received_on' => today()->toDateString(),
            'quantities' => [$this->variant->id => 20],
        ])->assertRedirect();

        $this->assertSame(24, $this->variant->refresh()->stock);
    }

    public function test_a_batch_writes_what_it_brought_in_to_the_ledger(): void
    {
        $supplier = Supplier::factory()->create();

        $this->post(route('admin.products.batches', $this->product), [
            'reference' => 'AUG-RUN-01',
            'received_on' => today()->toDateString(),
            'supplier_id' => $supplier->id,
            'quantities' => [$this->variant->id => 10],
        ]);

        $movement = StockMovement::sole();
        $this->assertSame(10, $movement->quantity);
        $this->assertSame(StockMovement::REASON_BATCH, $movement->reason);
        $this->assertSame($supplier->id, $movement->batch->supplier_id);
    }

    public function test_landed_cost_spreads_freight_and_duty_across_the_pieces(): void
    {
        $batch = app(ReceiveStockBatch::class)->handle($this->product, [
            'reference' => 'AUG-RUN-01',
            'received_on' => today()->toDateString(),
            // $8.00 each, plus $40 freight and $10 duty over 10 pieces.
            'unit_cost' => 8,
            'freight' => 40,
            'duty' => 10,
            'quantities' => [$this->variant->id => 10],
        ]);

        $this->assertSame(1300, $batch->landedUnitCostCents());
        $this->assertSame(13000, $batch->landedTotalCents());
    }

    public function test_a_batch_with_no_cost_reports_unknown_rather_than_free(): void
    {
        $batch = app(ReceiveStockBatch::class)->handle($this->product, [
            'reference' => 'NO-COST',
            'received_on' => today()->toDateString(),
            'quantities' => [$this->variant->id => 5],
        ]);

        $this->assertNull($batch->landedUnitCostCents());
    }

    public function test_a_batch_needs_a_quantity_somewhere(): void
    {
        $this->post(route('admin.products.batches', $this->product), [
            'reference' => 'EMPTY',
            'received_on' => today()->toDateString(),
            'quantities' => [$this->variant->id => 0],
        ])->assertSessionHasErrors('quantities');

        $this->assertSame(4, $this->variant->refresh()->stock);
    }

    public function test_correcting_a_count_records_the_difference(): void
    {
        $this->put(route('admin.products.stock', $this->product), [
            'variants' => [
                ['id' => $this->variant->id, 'stock' => 9, 'is_active' => true],
            ],
        ]);

        $movement = StockMovement::sole();
        $this->assertSame(5, $movement->quantity);
        $this->assertSame(StockMovement::REASON_ADJUSTMENT, $movement->reason);
    }
}
