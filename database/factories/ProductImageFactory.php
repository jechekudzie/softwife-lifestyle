<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductImage>
 */
class ProductImageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'colourway_id' => null,
            'path' => '/media/'.fake()->slug(3).'.jpg',
            'alt' => fake()->sentence(4),
            'position' => 0,
        ];
    }
}
