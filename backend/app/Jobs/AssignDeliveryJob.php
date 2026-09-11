<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderDelivery;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class AssignDeliveryJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $orderId) {}

    public function handle(): void
    {
        $order = Order::with('payment')->findOrFail($this->orderId);

        if ($order->status === 'cancelled') {
            return;
        }

        if (
            $order->payment === null ||
            ($order->payment->payment_method === 'razorpay' && $order->payment->payment_status !== 'paid')
        ) {
            return;
        }

        DB::transaction(function () use ($order) {
            if ($order->status !== 'placed') {
                return;
            }

            if ($order->delivery) {
                return;
            }

            $deliveryAgent = User::query()->where('type', 'delivery_agent')->first();

            if (!$deliveryAgent) {
                return;
            }

            OrderDelivery::create([
                'order_id' => $order->id,
                'user_id' => $deliveryAgent->id,
                'status' => 'assigned',
            ]);

            $order->update([
                'status' => 'assigned',
            ]);

            $order->refresh();

            if ($order->status !== 'assigned') {
                return;
            }
        });

        PickupJob::dispatch($this->orderId)->delay(now()->addSeconds(10));
    }
}
