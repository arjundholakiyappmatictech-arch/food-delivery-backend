<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Order;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_id' => Order::inRandomOrder()->value('id'),

            'invoice_number' => 'INV-' . fake()->unique()->numberBetween(1000, 9999),

            'delivery_fee' => fake()->randomFloat(2, 20, 80),

            'total' => fake()->randomFloat(2, 150, 1200),

            'generated_at' => now(),
        ];
    }
}
