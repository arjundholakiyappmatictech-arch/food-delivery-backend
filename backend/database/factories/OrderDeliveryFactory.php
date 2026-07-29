<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderDelivery>
 */
class OrderDeliveryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::where('type', 'delivery_agent')->inRandomOrder()->value('id'),
            'order_id' => Order::inRandomOrder()->value('id'),

            'status' => fake()->randomElement([
                'assigned',
                'picked_up',
                'delivered',
            ]),
        ];
    }
}
