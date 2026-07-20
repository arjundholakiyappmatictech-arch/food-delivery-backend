<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Order;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::inRandomOrder()->value('id'),

            'payment_method' => fake()->randomElement([
                'card',
                'upi',
                'cash',
            ]),

            'payment_status' => fake()->randomElement([
                'pending',
                'paid',
                'failed',
            ]),

            'paid_at' => now(),
        ];
    }
}
