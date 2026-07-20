<?php

namespace Database\Factories;

use App\Models\CartItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Cart;
use App\Models\MenuItem;

/**
 * @extends Factory<CartItem>
 */
class CartItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'cart_id' => Cart::inRandomOrder()->value('id'),

            'menu_item_id' => MenuItem::inRandomOrder()->value('id'),

            'quantity' => fake()->numberBetween(1, 5),
        ];
    }
}
