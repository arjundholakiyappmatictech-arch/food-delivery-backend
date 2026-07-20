<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Notifications\OrderPlacedNotification;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderService
{
    private const COMMON_RELATIONS = ['address', 'items.menuItem', 'payment', 'user', 'invoice', 'orderReview'];

    public function index(): CursorPaginator
    {
        $user = $this->authorizeCustomer();

        $order = Order::query()
            ->with(self::COMMON_RELATIONS)
            ->where('user_id', $user->id)
            ->orderByDesc('orders.created_at')
            ->orderByDesc('id')
            ->cursorPaginate(4)
            ->withQueryString();

        return $order;
    }

    public function store(array $data): Order
    {
        $user = $this->authorizeCustomer();

        return DB::transaction(function () use ($data, $user) {
            $address = Address::where('id', $data['address_id'])->where('user_id', $user->id)->first();

            if (! $address) {
                throw new HttpException(403, 'This address does not belong to you.');
            }

            $cartItems = Cart::with('menuItem')->where('user_id', $user->id)->get();

            if ($cartItems->isEmpty()) {
                throw new HttpException(400, 'Cart is empty.');
            }

            $subtotal = $cartItems->sum(fn ($cart) => (float) $cart->menuItem->price * $cart->quantity);

            $deliveryFee = 40;

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $address->id,
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

            /** @var User $user */
            $user = Auth::user();

            $user->notify(new OrderPlacedNotification($order));

            Cart::query()->where('user_id', $user->id)->delete();

            return $order->load('items.menuItem', 'address', 'user');
        });
    }

    public function show(Order $order): Order
    {
        $this->authorizeOrderOwner($order);

        /* dd($order); */

        return $order->load(self::COMMON_RELATIONS);
    }

    public function generateInvoice(Order $order): array
    {
        $this->authorizeOrderOwner($order);

        $order->load(['address', 'items.menuItem', 'payment', 'user']);

        /* dd(collect($order->getRelations())->map(fn($relation) => get_debug_type($relation))); */

        $subtotal = $order->items->sum(function ($item) {
            return $item->quantity * $item->price_at_purchase;
        });

        return [
            'id' => $order->invoice?->id,
            'order_id' => $order->id,
            'invoice_number' => $order->invoice?->invoice_number ?? 'INV-'.$order->id,
            'delivery_fee' => $order->delivery_fee,
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

        if (! in_array($order->status, ['placed', 'confirmed'])) {
            throw new HttpException(400, 'This order cannot be cancelled now.');
        }

        return DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'cancelled',
                'payment_status' => $order->payment_status === 'paid' ? 'refunded' : $order->payment_status,
            ]);

            if ($order->payment && $order->payment->status === 'paid') {
                $order->payment->update([
                    'status' => 'refunded',
                ]);
            }

            return $order->load(['address', 'items.menuItem', 'payment']);
        });
    }

    private function authorizeCustomer(): User
    {
        $user = Auth::user();

        if (! $user) {
            throw new HttpException(401, 'Please login first.');
        }

        if ($user->type !== 'customer') {
            throw new HttpException(403, 'Only customers can access orders.');
        }

        return $user;
    }

    private function authorizeOrderOwner(Order $order): void
    {
        $user = $this->authorizeCustomer();

        if ($order->user_id !== $user->id) {
            throw new HttpException(403, 'This order does not belong to you.');
        }
    }
}
