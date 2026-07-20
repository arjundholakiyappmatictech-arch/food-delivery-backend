<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Order;
use App\Models\MenuItem;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
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

            'menu_item_id' => MenuItem::inRandomOrder()->value('id'),

            'quantity' => fake()->numberBetween(1, 5),

            'price_at_purchase' => fake()->randomFloat(
                2,
                50,
                1000
            ),
        ];
    }
}
