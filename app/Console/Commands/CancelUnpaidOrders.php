<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Order;

class CancelUnpaidOrders extends Command
{
    protected $signature = 'orders:cancel-unpaid';

    protected $description = 'Cancel unpaid online orders after 5 minutes';

    public function handle(): int
    {
        $cancelledOrders = Order::where('status', 'pending')
            ->where('created_at', '<=', now()->subMinutes(1))
            ->update([
                'status' => 'cancelled',
            ]);

        $this->info("Cancelled {$cancelledOrders} unpaid orders.");

        Log::info('Unpaid orders cancelled by scheduler', [
            'cancelled_orders' => $cancelledOrders,
        ]);

        return Command::SUCCESS;
    }
}
