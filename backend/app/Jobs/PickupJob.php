<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class PickupJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $orderId) {}

    public function handle(): void
    {
        $order = Order::with('delivery')->findOrFail($this->orderId);

        if ($order->status === 'cancelled') {
            return;
        }

        DB::transaction(function () use ($order) {
            if ($order->status !== 'assigned') {
                return;
            }

            $delivery = $order->delivery;

            if (!$delivery) {
                return;
            }

            if ($delivery->status !== 'assigned') {
                return;
            }

            $delivery->update([
                'status' => 'picked',
            ]);

            $order->update([
                'status' => 'out_for_delivery',
            ]);
        });

        $order->refresh();

        if ($order->status !== 'out_for_delivery') {
            return;
        }

        DeliverJob::dispatch($this->orderId)->delay(now()->addSeconds(10));
    }
}
