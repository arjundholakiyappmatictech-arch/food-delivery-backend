<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::factory(30)->create();
        // Addresses
        Address::factory(30)->create();

        // Restaurants
        $restaurants = Restaurant::factory(10)->create();

        // Menus
        $menus = Menu::factory(8)->create();

        // Restaurant <-> Menu
        foreach ($restaurants as $restaurant) {
            $restaurant->menus()->attach(
                $menus->random(3)->pluck('id')
            );
        }

        // Menu Items
        MenuItem::factory(50)->create();

        // Carts
        Cart::factory(15)->create();
        CartItem::factory(15)->create();

        // Orders
        $orders = Order::factory(20)->create();

        // Order <-> Restaurant
        foreach ($orders as $order) {
            $order->restaurants()->attach(
                $restaurants->random(2)->pluck('id')
            );
        }

        // Order Items
        OrderItem::factory(60)->create();

        // Payments
        Payment::factory(20)->create();

        // Deliveries
        OrderDelivery::factory(20)->create();

        // Reviews
        Review::factory(15)->create();
    }
}
