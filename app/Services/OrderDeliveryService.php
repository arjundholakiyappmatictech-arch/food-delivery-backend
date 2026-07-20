<?php

namespace App\Services;

use App\Models\OrderDelivery;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderDeliveryService
{
    public function index(): LengthAwarePaginator
    {
        $user = $this->authUser();

        if ($user->type !== 'delivery_agent') {
            throw new HttpException(403, 'Only delivery agents can view deliveries.');
        }

        return OrderDelivery::query()
            ->with(['order', 'order.address', 'order.user'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(2);
    }

    public function assignDelivery(Order $order, array $data): OrderDelivery
    {
        $user = $this->authUser();

        $this->authorizeRestaurantOwner($user);
        $this->ensureDeliveryNotAssigned($order);

        $deliveryAgent = $this->findDeliveryAgent($data['user_id']);

        return $this->createDelivery($order, $deliveryAgent);
    }

    private function authUser(): User
    {
        $user = Auth::user();

        if (!$user) {
            throw new HttpException(401, 'Please login first.');
        }

        return $user;
    }

    private function authorizeRestaurantOwner(User $user): void
    {
        if ($user->type !== 'restaurant_owner') {
            throw new HttpException(403, 'Only restaurant owner can assign delivery agent.');
        }
    }

    private function ensureDeliveryNotAssigned(Order $order): void
    {
        if ($order->delivery) {
            throw new HttpException(409, 'Delivery agent already assigned to this order.');
        }
    }

    private function findDeliveryAgent(int $userId): User
    {
        $deliveryAgent = User::find($userId);

        if (!$deliveryAgent) {
            throw new HttpException(404, 'Delivery agent not found.');
        }

        if ($deliveryAgent->type !== 'delivery_agent') {
            throw new HttpException(403, 'Selected user is not a delivery agent.');
        }

        return $deliveryAgent;
    }

    private function createDelivery(Order $order, User $deliveryAgent): OrderDelivery
    {
        return OrderDelivery::create([
            'order_id' => $order->id,
            'user_id' => $deliveryAgent->id,
            'status' => 'assigned',
        ])->load(['order', 'deliveryAgent']);
    }
}
