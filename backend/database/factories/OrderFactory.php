<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
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

            'address_id' => Address::inRandomOrder()->value('id'),

            'status' => fake()->randomElement([
                'pending',
                'confirmed',
                'delivered',
            ]),

            'delivery_fee' => fake()->randomFloat(2, 20, 80),

            'total' => fake()->randomFloat(
                2,
                100,
                5000
            ),

            'delivery_instructions' => fake()->sentence(),
        ];
    }
}
