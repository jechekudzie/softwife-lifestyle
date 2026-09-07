<?php

namespace Tests\Feature\Admin;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->actingAs(User::factory()->admin()->create());
    }

    public function test_an_admin_can_move_an_order_along_and_mark_it_paid(): void
    {
        $order = Order::factory()->create([
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $this->put(route('admin.orders.update', $order), [
            'status' => 'shipped',
            'payment_status' => 'paid',
            'payment_reference' => 'ECO-88213',
        ])->assertRedirect();

        $order->refresh();
        $this->assertSame('shipped', $order->status);
        $this->assertSame('paid', $order->payment_status);
        $this->assertSame('ECO-88213', $order->payment_reference);
    }

    public function test_an_unknown_status_is_refused(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $this->put(route('admin.orders.update', $order), [
            'status' => 'teleported',
            'payment_status' => 'paid',
        ])->assertSessionHasErrors('status');

        $this->assertSame('pending', $order->refresh()->status);
    }

    public function test_orders_can_be_filtered_by_status(): void
    {
        Order::factory()->create(['status' => 'pending', 'customer_name' => 'Tendai Moyo']);
        Order::factory()->create(['status' => 'shipped', 'customer_name' => 'Naledi Khumalo']);

        $this->get(route('admin.orders.index', ['status' => 'shipped']))
            ->assertOk()
            ->assertSee('Naledi Khumalo')
            ->assertDontSee('Tendai Moyo');
    }

    public function test_searching_ignores_case(): void
    {
        Order::factory()->create(['customer_name' => 'Tendai Moyo']);
        Order::factory()->create(['customer_name' => 'Someone Else']);

        $this->get(route('admin.orders.index', ['search' => 'tendai']))
            ->assertOk()
            ->assertSee('Tendai Moyo')
            ->assertDontSee('Someone Else');
    }

    public function test_orders_can_be_searched_by_reference(): void
    {
        $found = Order::factory()->create(['customer_name' => 'Chiedza Rusike']);
        Order::factory()->create(['customer_name' => 'Someone Else']);

        $this->get(route('admin.orders.index', ['search' => $found->reference]))
            ->assertOk()
            ->assertSee('Chiedza Rusike')
            ->assertDontSee('Someone Else');
    }
}
