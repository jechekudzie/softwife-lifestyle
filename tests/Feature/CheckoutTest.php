<?php

namespace Tests\Feature;

use App\Models\CollectionPoint;
use App\Models\Colourway;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private Product $product;

    private Colourway $colourway;

    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->product = Product::factory()->create(['price_cents' => 3500]);
        $this->colourway = Colourway::factory()->create(['name' => 'Butter']);
        $this->variant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
            'colourway_id' => $this->colourway->id,
            'size' => 'M',
            'stock' => 5,
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Tendai Moyo',
            'email' => 'tendai@example.com',
            'phone' => '+263770000000',
            'fulfilment_method' => 'collection',
            'collection_point' => null,
            'items' => [[
                'product' => $this->product->slug,
                'colourway' => 'Butter',
                'size' => 'M',
                'quantity' => 1,
            ]],
        ], $overrides);
    }

    public function test_the_checkout_page_loads(): void
    {
        $this->get(route('checkout'))->assertOk();
    }

    public function test_placing_an_order_stores_it_with_its_items(): void
    {
        $point = CollectionPoint::factory()->create();

        $response = $this->post(route('checkout.store'), $this->payload([
            'collection_point' => $point->slug,
        ]));

        $order = Order::sole();

        $response->assertRedirect(route('orders.show', $order));
        $this->assertSame('Tendai Moyo', $order->customer_name);
        $this->assertSame('collection', $order->fulfilment_method);
        $this->assertSame($point->id, $order->collection_point_id);
        $this->assertSame(3500, $order->subtotal_cents);
        $this->assertSame(0, $order->delivery_fee_cents);
        $this->assertSame(3500, $order->total_cents);
        $this->assertSame('unpaid', $order->payment_status);
        $this->assertNotNull($order->placed_at);

        $item = $order->items()->sole();
        $this->assertSame($this->product->name, $item->name);
        $this->assertSame('Butter', $item->colourway);
        $this->assertSame('M', $item->size);
        $this->assertSame(3500, $item->unit_price_cents);
        $this->assertSame(1, $item->quantity);
    }

    public function test_placing_an_order_reduces_the_stock_of_the_variant_bought(): void
    {
        $point = CollectionPoint::factory()->create();

        $this->post(route('checkout.store'), $this->payload([
            'collection_point' => $point->slug,
            'items' => [[
                'product' => $this->product->slug,
                'colourway' => 'Butter',
                'size' => 'M',
                'quantity' => 3,
            ]],
        ]));

        $this->assertSame(2, $this->variant->refresh()->stock);
    }

    public function test_an_order_cannot_take_more_than_the_remaining_stock(): void
    {
        $point = CollectionPoint::factory()->create();

        $response = $this->post(route('checkout.store'), $this->payload([
            'collection_point' => $point->slug,
            'items' => [[
                'product' => $this->product->slug,
                'colourway' => 'Butter',
                'size' => 'M',
                'quantity' => 6,
            ]],
        ]));

        $response->assertSessionHasErrors('items.0');
        $this->assertSame(0, Order::count());
        $this->assertSame(5, $this->variant->refresh()->stock);
    }

    public function test_delivery_adds_the_fee_of_the_chosen_zone(): void
    {
        $zone = DeliveryZone::factory()->create(['fee_cents' => 800]);

        $this->post(route('checkout.store'), $this->payload([
            'fulfilment_method' => 'delivery',
            'collection_point' => null,
            'delivery_zone' => $zone->slug,
            'address_line' => '12 Josiah Chinamano Ave',
            'city' => 'Harare',
        ]));

        $order = Order::sole();
        $this->assertSame(800, $order->delivery_fee_cents);
        $this->assertSame(4300, $order->total_cents);
    }

    public function test_delivery_is_free_once_the_subtotal_reaches_the_threshold(): void
    {
        config(['shop.free_delivery_from_cents' => 7000]);
        $zone = DeliveryZone::factory()->create(['fee_cents' => 800]);

        $this->post(route('checkout.store'), $this->payload([
            'fulfilment_method' => 'delivery',
            'collection_point' => null,
            'delivery_zone' => $zone->slug,
            'address_line' => '12 Josiah Chinamano Ave',
            'city' => 'Harare',
            'items' => [[
                'product' => $this->product->slug,
                'colourway' => 'Butter',
                'size' => 'M',
                'quantity' => 2,
            ]],
        ]));

        $order = Order::sole();
        $this->assertSame(7000, $order->subtotal_cents);
        $this->assertSame(0, $order->delivery_fee_cents);
        $this->assertSame(7000, $order->total_cents);
    }

    public function test_a_custom_affirmation_adds_its_fee_and_is_stored_with_the_line(): void
    {
        config(['shop.custom_affirmation_fee_cents' => 1200]);
        $point = CollectionPoint::factory()->create();

        $this->post(route('checkout.store'), $this->payload([
            'collection_point' => $point->slug,
            'items' => [[
                'product' => $this->product->slug,
                'colourway' => 'Butter',
                'size' => 'M',
                'quantity' => 1,
                'custom' => 'In my soft era because God already wrote the best plot twist.',
            ]],
        ]));

        $item = Order::sole()->items()->sole();
        $this->assertSame(1200, $item->custom_fee_cents);
        $this->assertSame(4700, $item->unit_price_cents);
        $this->assertSame(
            'In my soft era because God already wrote the best plot twist.',
            $item->custom_affirmation,
        );
    }

    public function test_prices_come_from_the_database_rather_than_the_request(): void
    {
        $point = CollectionPoint::factory()->create();

        $this->post(route('checkout.store'), $this->payload([
            'collection_point' => $point->slug,
            'items' => [[
                'product' => $this->product->slug,
                'colourway' => 'Butter',
                'size' => 'M',
                'quantity' => 1,
                'price_cents' => 1,
                'unit_price_cents' => 1,
            ]],
            'subtotal_cents' => 1,
            'total_cents' => 1,
        ]));

        $order = Order::sole();
        $this->assertSame(3500, $order->subtotal_cents);
        $this->assertSame(3500, $order->total_cents);
    }

    public function test_an_empty_submission_reports_the_fields_it_needs(): void
    {
        $this->post(route('checkout.store'), [])->assertSessionHasErrors([
            'customer_name',
            'email',
            'phone',
            'fulfilment_method',
            'items',
        ]);
    }

    public function test_a_delivery_order_must_say_where_it_is_going(): void
    {
        $response = $this->post(route('checkout.store'), $this->payload([
            'fulfilment_method' => 'delivery',
            'collection_point' => null,
        ]));

        $response->assertSessionHasErrors([
            'delivery_zone' => 'Choose where we are delivering to.',
        ]);
        $response->assertSessionHasErrors(['address_line', 'city']);
    }

    public function test_an_inactive_product_cannot_be_ordered(): void
    {
        $this->product->update(['is_active' => false]);
        $point = CollectionPoint::factory()->create();

        $this->post(route('checkout.store'), $this->payload([
            'collection_point' => $point->slug,
        ]))->assertSessionHasErrors('items.0.product');

        $this->assertSame(0, Order::count());
    }

    public function test_the_confirmation_page_shows_the_order(): void
    {
        $point = CollectionPoint::factory()->create();

        $this->post(route('checkout.store'), $this->payload([
            'collection_point' => $point->slug,
        ]));

        $order = Order::sole();

        $this->get(route('orders.show', $order))
            ->assertOk()
            ->assertSee($order->reference);
    }
}
