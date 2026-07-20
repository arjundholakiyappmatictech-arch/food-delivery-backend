<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MenuItem>
 */
class MenuItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'menu_id' => Menu::inRandomOrder()->value('id'),

            'name' => fake()->words(2, true),

            'price' => fake()->randomFloat(
                2,
                50,
                1000
            ),

            'availability' => true,
        ];
    }
}
