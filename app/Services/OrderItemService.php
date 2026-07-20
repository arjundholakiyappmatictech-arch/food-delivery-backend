<?php

namespace App\Services;

use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderItemService
{
    public function getOrder(OrderItem $orderItem): OrderItem
    {
        $this->authorizeOrderItemAccess($orderItem);

        return $orderItem->load('order');
    }

    public function getMenuItem(OrderItem $orderItem): OrderItem
    {
        $this->authorizeOrderItemAccess($orderItem);

        return $orderItem->load('menuItem');
    }

    private function authorizeOrderItemAccess(OrderItem $orderItem): void
    {
        $user = Auth::user();

        if (! $user) {
            throw new HttpException(401, 'Please login first.');
        }

        $orderItem->loadMissing('order.restaurants', 'order.delivery');

        $order = $orderItem->order;

        if ($user->type === 'customer' && $order->user_id === $user->id) {
            return;
        }

        if ($user->type === 'restaurant_owner' && $order->restaurant?->restaurant_owner_id === $user->id) {
            return;
        }

        throw new HttpException(403, 'You are not allowed to access this order item.');
    }
}
