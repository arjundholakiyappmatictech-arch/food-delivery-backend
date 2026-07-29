<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CancelUnpaidOrders extends Command
{
    protected $signature = 'orders:cancel-unpaid';

    protected $description = 'Cancel unpaid online orders after 1 minutes';

    public function handle(): int
    {
        $cancelledOrders = Order::where('status', 'placed')
            ->where('created_at', '<=', now()->subMinutes())
            ->where(function ($query) {
                $query->whereDoesntHave('payment')->orWhereHas('payment', function ($paymentQuery) {
                    $paymentQuery->where('payment_status', '!=', 'paid')->where('payment_method', '!=', 'cod');
                });
            })
            ->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

        $this->info("Cancelled {$cancelledOrders} unpaid orders.");

        Log::info('Unpaid orders cancelled by scheduler', [
            'cancelled_orders' => $cancelledOrders,
        ]);

        return Command::SUCCESS;
    }
}
