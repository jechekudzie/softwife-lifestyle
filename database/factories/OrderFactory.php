<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'reference' => Order::newReference(),
            'status' => 'pending',
            'customer_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'fulfilment_method' => 'collection',
            'subtotal_cents' => 3500,
            'delivery_fee_cents' => 0,
            'total_cents' => 3500,
            'currency' => 'USD',
            'payment_status' => 'unpaid',
            'placed_at' => now(),
        ];
    }
}
