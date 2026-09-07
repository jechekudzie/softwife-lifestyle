<?php

namespace Database\Factories;

use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'colourway_id' => Colourway::factory(),
            'size' => 'M',
            'sku' => Str::upper(Str::random(12)),
            'stock' => 10,
            'price_cents' => null,
            'is_active' => true,
        ];
    }

    public function soldOut(): static
    {
        return $this->state(fn () => ['stock' => 0]);
    }
}
