<?php

namespace Database\Factories;

use App\Models\OrderDelivery;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Order;
use App\Models\User;

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
