<?php

namespace App\Console\Commands;

use App\Services\PaymentService;
use Illuminate\Console\Command;

class RefundCancelledOrders extends Command
{
    protected $signature = 'payments:refund-cancelled';

    protected $description = 'Refund paid cancelled orders after 5 minutes';

    public function __construct(protected PaymentService $paymentService)
    {
        return parent::__construct();
    }

    public function handle()
    {
        $refundedPayments = $this->paymentService->refundCancelledOrders();

        $this->info("Refunded {$refundedPayments} cancelled order payments");

        return Command::SUCCESS;
    }
}
