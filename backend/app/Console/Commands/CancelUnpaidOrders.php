<?php

namespace App\Console\Commands;

use App\Services\OrderService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CancelUnpaidOrders extends Command
{
    protected $signature = 'orders:cancel-unpaid';

    protected $description = 'Cancel unpaid online orders after 1 minutes';

    public function __construct(private OrderService $orderService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $cancelledOrders = $this->orderService->cancelExpiredUnpaidOrders();

        $this->info("Cancelled {$cancelledOrders} unpaid orders.");

        Log::info('Unpaid orders cancelled by scheduler', [
            'cancelled_orders' => $cancelledOrders,
        ]);

        return Command::SUCCESS;
    }
}
