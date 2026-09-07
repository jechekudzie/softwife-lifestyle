<?php

namespace Database\Factories;

use App\Models\Colourway;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Colourway>
 */
class ColourwayFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->colorName();

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'cloth' => fake()->hexColor(),
            'ink' => fake()->hexColor(),
            'position' => 0,
        ];
    }
}
