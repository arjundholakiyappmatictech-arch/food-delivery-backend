<?php

namespace App\Services;

use App\Exceptions\Carts\MenuItemUnavailableException;
use App\Exceptions\Carts\RestaurantClosedException;
use App\Models\Cart;
use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class CartService
{
    public function index()
    {
        $user = $this->authorizeCustomer();

        return Cart::query()
            ->with(['menuItem', 'user'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    public function store(array $data): Cart
    {
        $user = $this->authorizeCustomer();

        $menuItem = MenuItem::query()->with('menu.restaurants')->findOrFail($data['menu_item_id']);

        $restaurant = $menuItem->menu->restaurants->firstWhere('id', $data['restaurant_id']);

        if (!$restaurant) {
            throw new RuntimeException('This menu item does not belong to the selected restaurant.', 409);
        }

        $this->ensureMenuItemIsAvailable($menuItem);
        $this->ensureRestaurantIsOpen($menuItem);

        $existingCart = Cart::query()->where('user_id', $user->id)->first();

        if ($existingCart && $existingCart->restaurant_id !== $restaurant->id) {
            throw new RuntimeException('Your cart contains items from another restaurant.', 409);
        }

        $cart = Cart::query()
            ->where('user_id', $user->id)
            ->where('restaurant_id', $restaurant->id)
            ->where('menu_item_id', $data['menu_item_id'])
            ->first();

        if ($cart) {
            $cart->increment('quantity', $data['quantity']);
        } else {
            $cart = Cart::create([
                'user_id' => $user->id,
                'restaurant_id' => $restaurant->id,
                'menu_item_id' => $data['menu_item_id'],
                'quantity' => $data['quantity'],
            ]);
        }

        return $cart->load('menuItem', 'restaurant');
    }

    public function update(Cart $cart, array $data): Cart
    {
        $this->authorizeCartOwner($cart);

        $cart->update([
            'quantity' => $data['quantity'],
        ]);

        return $cart->load('menuItem');
    }

    public function destroy(Cart $cart): void
    {
        $this->authorizeCartOwner($cart);

        $cart->delete();
    }

    public function clearCart(): void
    {
        $user = $this->authorizeCustomer();

        Cart::query()->where('user_id', $user->id)->delete();
    }

    private function authorizeCustomer(): User
    {
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new AuthorizationException('Only customers can access carts', 403);
        }

        return $user;
    }

    private function authorizeCartOwner(Cart $cart): void
    {
        $user = $this->authorizeCustomer();

        if ($cart->user_id !== $user->id) {
            throw new AuthorizationException('Unauthorized', 403);
        }
    }

    private function ensureMenuItemIsAvailable(MenuItem $menuItem): void
    {
        if ($menuItem->availability === false) {
            throw new MenuItemUnavailableException();
        }
    }

    private function ensureRestaurantIsOpen(MenuItem $menuItem): void
    {
        $hasOpenRestaurant = $menuItem->menu->restaurants->contains(
            fn(Restaurant $restaurant): bool => $restaurant->status === 'open',
        );

        /* dd($hasOpenRestaurant); */

        if (!$hasOpenRestaurant) {
            throw new RestaurantClosedException();
        }
    }
}
