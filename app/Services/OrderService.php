<?php

namespace App\Services;

use App\Exceptions\Carts\CartMenuItemMissingException;
use App\Exceptions\Carts\MenuItemUnavailableException;
use App\Exceptions\Order\EmptyCartException;
use App\Exceptions\Order\OrderAlreadyCancelledException;
use App\Exceptions\Order\OrderCannotBeCancelledException;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderService
{
    private const COMMON_RELATIONS = ['address', 'items.menuItem', 'payment', 'user', 'invoice', 'orderReview'];

    public function index(): CursorPaginator
    {
        $user = $this->authorizeCustomer();

        return Order::query()
            ->with(self::COMMON_RELATIONS)
            ->where('user_id', $user->id)
            ->orderByDesc('orders.created_at')
            ->orderByDesc('orders.id')
            ->cursorPaginate(4)
            ->withQueryString();
    }

    public function store(array $data): Order
    {
        $user = $this->authorizeCustomer();

        $address = Address::query()->whereKey($data['address_id'])->where('user_id', $user->id)->first();

        if (!$address) {
            throw new AuthorizationException('This address does not belong to you');
        }

        $cartItems = Cart::query()->with('menuItem')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            throw new EmptyCartException();
        }

        $subtotal = 0;

        // simple version
        foreach ($cartItems as $cart) {
            $menuItem = $cart->menuItem;

            if ($menuItem === null) {
                throw new CartMenuItemMissingException();
            }

            if (!$menuItem->availability) {
                throw new MenuItemUnavailableException();
            }

            $subtotal += (float) $menuItem->price * $cart->quantity;
        }

        $deliveryFee = 40;

        return DB::transaction(function () use ($data, $user, $address, $cartItems, $subtotal, $deliveryFee) {
            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $address->id,
                'status' => 'placed',
                'total' => $subtotal + $deliveryFee,
                'delivery_fee' => $deliveryFee,
                'delivery_instructions' => $data['delivery_instructions'] ?? null,
                'delivered_at' => null,
            ]);

            foreach ($cartItems as $cart) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $cart->menu_item_id,
                    'quantity' => $cart->quantity,
                    'price_at_purchase' => $cart->menuItem->price,
                ]);
            }

            Cart::query()->where('user_id', $user->id)->delete();

            return $order->load(['items.menuItem', 'address', 'user']);
        });
    }

    public function show(Order $order): Order
    {
        $this->authorizeOrderOwner($order);

        return $order->load(self::COMMON_RELATIONS);
    }

    public function generateInvoice(Order $order): array
    {
        $this->authorizeOrderOwner($order);

        $order->load(['address', 'items.menuItem', 'payment', 'user', 'invoice']);

        return [
            'id' => $order->invoice?->id,
            'order_id' => $order->id,
            'invoice_number' => $order->invoice?->invoice_number ?? 'INV-' . $order->id,
            'delivery_fee' => $order->delivery_fee,
            'subtotal' => $order->items->sum(fn(OrderItem $item) => $item->quantity * $item->price_at_purchase),
            'total' => $order->total,
            'generated_at' => now()->toDateTimeString(),

            'user' => $order->user,
            'address' => $order->address,
            'items' => $order->items,
            'payment' => $order->payment,
        ];
    }

    public function cancel(Order $order): Order
    {
        $this->authorizeOrderOwner($order);

        if ($order->status === 'cancelled') {
            throw new OrderAlreadyCancelledException();
        }

        if ($order->status !== 'placed') {
            throw new OrderCannotBeCancelledException();
        }

        return DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            return $order->refresh()->load(['address', 'items.menuItem', 'payment']);
        });
    }

    private function authorizeCustomer(): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new AuthorizationException('Only customers can access orders.');
        }

        return $user;
    }

    private function authorizeOrderOwner(Order $order): void
    {
        $user = $this->authorizeCustomer();

        if ($order->user_id !== $user->id) {
            throw new AuthorizationException('This order does not belong to you.');
        }
    }
}
