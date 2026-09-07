<?php

namespace Database\Factories;

use App\Models\CollectionPoint;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CollectionPoint>
 */
class CollectionPointFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'address' => fake()->address(),
            'hours' => 'Mon–Fri, 9am–5pm',
            'is_active' => true,
            'position' => 0,
        ];
    }
}
