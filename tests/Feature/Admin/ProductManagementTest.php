<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->admin()->create());
        $this->product = Product::factory()->create(['price_cents' => 3500]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => $this->product->name,
            'category_id' => $this->product->category_id,
            'era' => 'Wife',
            'phrase' => 'in my soft wife era',
            'affirmation' => 'I attract rather than chase.',
            'price' => 42.5,
            'hero_ground' => 'wine',
            'is_active' => true,
        ], $overrides);
    }

    public function test_an_admin_can_change_a_price_and_it_is_stored_in_minor_units(): void
    {
        $this->put(route('admin.products.update', $this->product), $this->payload())
            ->assertRedirect();

        $this->assertSame(4250, $this->product->refresh()->price_cents);
    }

    public function test_a_was_price_must_beat_the_price_it_is_compared_against(): void
    {
        $this->put(
            route('admin.products.update', $this->product),
            $this->payload(['compare_at' => 20]),
        )->assertSessionHasErrors('compare_at');

        $this->assertNull($this->product->refresh()->compare_at_cents);
    }

    public function test_hiding_a_product_takes_it_out_of_the_shop(): void
    {
        $this->put(
            route('admin.products.update', $this->product),
            $this->payload(['is_active' => false]),
        );

        $this->assertFalse($this->product->refresh()->is_active);
        $this->assertSame(0, Product::active()->count());
    }

    public function test_an_admin_can_set_stock_for_each_variant(): void
    {
        $colourway = Colourway::factory()->create();
        $variant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
            'colourway_id' => $colourway->id,
            'stock' => 4,
        ]);

        $this->put(route('admin.products.stock', $this->product), [
            'variants' => [
                ['id' => $variant->id, 'stock' => 25, 'is_active' => true],
            ],
        ])->assertRedirect();

        $this->assertSame(25, $variant->refresh()->stock);
    }

    public function test_stock_cannot_be_pushed_below_zero(): void
    {
        $variant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
            'stock' => 4,
        ]);

        $this->put(route('admin.products.stock', $this->product), [
            'variants' => [
                ['id' => $variant->id, 'stock' => -3, 'is_active' => true],
            ],
        ])->assertSessionHasErrors('variants.0.stock');

        $this->assertSame(4, $variant->refresh()->stock);
    }

    public function test_stock_of_another_product_cannot_be_edited_through_this_one(): void
    {
        $other = Product::factory()->create(['category_id' => Category::factory()]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $other->id,
            'stock' => 7,
        ]);

        $this->put(route('admin.products.stock', $this->product), [
            'variants' => [
                ['id' => $variant->id, 'stock' => 999, 'is_active' => true],
            ],
        ]);

        $this->assertSame(7, $variant->refresh()->stock);
    }
}
