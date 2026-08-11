<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class DeliverJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $orderId,
    ) {}

    public function handle(): void
    {
        $order = Order::with(['delivery', 'payment'])
            ->findOrFail($this->orderId);

        DB::transaction(function () use ($order) {
            $delivery = $order->delivery;

            if (!$delivery) {
                return;
            }

            if ($delivery->status !== 'picked') {
                return;
            }

            $delivery->update([
                'status' => 'delivered',
            ]);

            $order->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);

            // COD is paid when the order is delivered.
            if ($order->payment?->payment_method === 'cod') {
                $order->payment->update([
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                ]);
            }
        });
    }
}
