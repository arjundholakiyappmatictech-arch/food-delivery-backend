<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class OrderDeliveryService
{
    public function index(): LengthAwarePaginator
    {
        $user = $this->authUser();

        if ($user->type !== 'delivery_agent') {
            throw new HttpException(403, 'Only delivery agents can view deliveries.');
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
        $user = $this->authUser();

        $this->authorizeRestaurantOwner($user);
        $this->ensureOrderCanBeAssigned($order);
        $this->ensureDeliveryNotAssigned($order);

        $deliveryAgent = $this->findDeliveryAgent($data['user_id']);

        return DB::transaction(function () use ($order, $deliveryAgent) {
            $delivery = OrderDelivery::create([
                'order_id' => $order->id,
                'user_id' => $deliveryAgent->id,
                'status' => 'assigned',
            ]);

            $order->update([
                'status' => 'out_for_delivery',
            ]);

            return $delivery->load(['order.address', 'order.user', 'deliveryAgent']);
        });
    }

    private function authUser(): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        return $user;
    }

    private function authorizeRestaurantOwner(User $user): void
    {
        if ($user->type !== 'restaurant_owner') {
            throw new AuthorizationException('Only restaurant owners can assign delivery agents.');
        }
    }

    private function ensureOrderCanBeAssigned(Order $order): void
    {
        if ($order->status !== 'placed') {
            throw new HttpException(409, 'A delivery agent can only be assigned to a placed order.');
        }
    }

    private function ensureDeliveryNotAssigned(Order $order): void
    {
        if ($order->delivery()->exists()) {
            throw new HttpException(409, 'A delivery agent has already been assigned to this order.');
        }
    }

    private function findDeliveryAgent(int $userId): User
    {
        $deliveryAgent = User::query()->find($userId);

        if (! $deliveryAgent) {
            throw new HttpException(404, 'Delivery agent not found.');
        }

        if ($deliveryAgent->type !== 'delivery_agent') {
            throw new HttpException(422, 'The selected user is not a delivery agent.');
        }

        return $deliveryAgent;
    }
}
