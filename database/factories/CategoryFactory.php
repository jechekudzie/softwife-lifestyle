<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'blurb' => fake()->sentence(),
            'silhouette' => 'tee',
            'is_available' => true,
            'position' => 0,
        ];
    }

    public function comingSoon(): static
    {
        return $this->state(fn () => ['is_available' => false]);
    }
}
