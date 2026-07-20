<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use App\Exceptions\carts\MenuItemUnavailableException;
use App\Exceptions\carts\RestaurantClosedException;
use App\Models\MenuItem;
use App\Models\Restaurant;

class CartService
{
    public function index(): LengthAwarePaginator
    {
        $user = $this->authorizeCustomer();

        return Cart::query()
            ->with(['menuItem', 'user'])
            ->where('user_id', '=', $user->id)
            ->latest()
            ->paginate(2);
    }

    public function store(array $data): Cart
    {
        $user = $this->authorizeCustomer();

        $menuItem = MenuItem::query()->with('menu.restaurants')->findOrFail($data['menu_item_id']);

        $this->ensureMenuItemIsAvailable($menuItem);
        $this->ensureRestaurantIsOpen($menuItem);

        $cart = Cart::query()->where('user_id', $user->id)->where('menu_item_id', $data['menu_item_id'])->first();

        if ($cart) {
            $cart->increment('quantity', $data['quantity']);
        } else {
            $cart = Cart::create([
                'user_id' => $user->id,
                'menu_item_id' => $data['menu_item_id'],
                'quantity' => $data['quantity'],
            ]);
        }

        /* Auth::user()->notify(new CartItemAddedNotification($cart)); */

        return $cart->load('menuItem');
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

    private function authorizeCustomer(): User
    {
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new AuthorizationException('Only customers can access carts');
        }

        return $user;
    }

    private function authorizeCartOwner(Cart $cart): void
    {
        $user = $this->authorizeCustomer();

        if ($cart->user_id !== $user->id) {
            throw new AuthorizationException('Unauthorized');
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
