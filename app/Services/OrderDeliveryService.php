<?php

namespace App\Services;

use App\Exceptions\deliveries\AssignOnlyPlacedOrder;
use App\Exceptions\deliveries\DeliveryAgentAlreadyAssignedExceptions;
use App\Exceptions\deliveries\PaymentNotFoundException;
use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderDeliveryService
{
    public function index(): LengthAwarePaginator
    {
        $user = Auth::user();

        if ($user->type !== 'delivery_agent') {
            throw new AuthorizationException('Only delivery agents can view deliveries');
        }

        return OrderDelivery::query()
            ->with(['order.address', 'order.user'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(2)
            ->withQueryString();
    }

    public function assignDelivery(Order $order, array $data): OrderDelivery
    {
        $user = Auth::user();

        $this->authorizeRestaurantOwner($user);
        $this->ensureOrderCanBeAssigned($order);
        $this->ensurePaymentCompleted($order);
        $this->ensureDeliveryNotAssigned($order);

        $deliveryAgent = $this->findDeliveryAgent($data['user_id']);

        return DB::transaction(function () use ($order, $deliveryAgent) {
            $delivery = OrderDelivery::create([
                'order_id' => $order->id,
                'user_id' => $deliveryAgent->id,
                'status' => 'assigned',
            ]);

            return $delivery->load(['order.address', 'order.user', 'deliveryAgent']);
        });
    }

    public function makeOutForDelivery(OrderDelivery $delivery): OrderDelivery
    {
        $user = Auth::user();

        $this->authorizeAssignedDeliveryAgent($delivery, $user);

        if ($delivery->status !== 'assigned') {
            throw new AuthorizationException('This delivery cannot be marked as picked');
        }

        return DB::transaction(function () use ($delivery) {
            $delivery->update([
                'status' => 'picked',
            ]);

            $delivery->order->update([
                'status' => 'out_for_delivery',
            ]);

            return $delivery->refresh()->load(['order.address', 'order.user', 'deliveryAgent']);
        });
    }

    public function makeDelivered(OrderDelivery $delivery): OrderDelivery
    {
        $user = Auth::user();

        $this->authorizeAssignedDeliveryAgent($delivery, $user);

        if ($delivery->status !== 'picked') {
            throw new AuthorizationException('This delivery cannot be marked as delivered');
        }

        return DB::transaction(function () use ($delivery) {
            $delivery->update([
                'status' => 'delivered',
            ]);

            $delivery->order->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);

            return $delivery->refresh()->load(['order.address', 'order.user', 'deliveryAgent']);
        });
    }

    private function authorizeRestaurantOwner(User $user): void
    {
        if ($user->type !== 'restaurant_owner') {
            throw new AuthorizationException('Only restaurant owners can assign delivery agents.');
        }
    }

    private function ensureOrderCanBeAssigned(Order $order): void
    {
        if (!in_array($order->status, ['placed', 'pending'], true)) {
            throw new AssignOnlyPlacedOrder();
        }
    }

    private function ensureDeliveryNotAssigned(Order $order): void
    {
        if ($order->delivery()->exists()) {
            throw new DeliveryAgentAlreadyAssignedExceptions();
        }
    }

    private function findDeliveryAgent(int $userId): User
    {
        $deliveryAgent = User::query()->find($userId);

        if (!$deliveryAgent) {
            throw new AuthorizationException('Delivery agent not found');
        }

        if ($deliveryAgent->type !== 'delivery_agent') {
            throw new AuthorizationException('The selected user is not a delivery agent');
        }

        return $deliveryAgent;
    }

    private function ensurePaymentCompleted(Order $order): void
    {
        $payment = $order->payment;

        if (!$payment) {
            throw new PaymentNotFoundException();
        }
    }

    private function authorizeAssignedDeliveryAgent(OrderDelivery $delivery, User $user): void
    {
        if ($user->type !== 'delivery_agent') {
            throw new AuthorizationException('Only delivery agents can update deliveries.');
        }

        if ($delivery->user_id !== $user->id) {
            throw new AuthorizationException('You are not assigned to this delivery.');
        }
    }
}
