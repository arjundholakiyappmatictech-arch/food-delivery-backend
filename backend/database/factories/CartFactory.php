<?php

namespace Database\Factories;

use App\Models\Cart;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cart>
 */
class CartFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::where('type', 'customer')->inRandomOrder()->value('id'),
            'restaurant_id' => Restaurant::inRandomOrder()->value('id'),
        ];
    }
}
