<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'name' => 'Soft Wife',
            'colourway' => 'Butter',
            'size' => 'M',
            'custom_affirmation' => null,
            'custom_fee_cents' => 0,
            'unit_price_cents' => 3500,
            'quantity' => 1,
            'total_cents' => 3500,
        ];
    }
}
