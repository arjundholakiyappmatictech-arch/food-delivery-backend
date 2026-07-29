<?php

namespace App\Console\Commands;

use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RefundCancelledOrders extends Command
{
    protected $signature = 'payments:refund-cancelled';

    protected $description = 'Refund paid cancelled orders after 5 minutes';

    public function handle()
    {
        $refundedPayments = Payment::query()
            ->where('payment_status', 'paid')
            ->whereHas('order', function ($query): void {
                $query->where('status', 'cancelled')->where('cancelled_at', '<=', now()->subMinutes(2));
            })
            ->update([
                'payment_status' => 'refunded',
            ]);

        dump($refundedPayments);

        $this->info("Refunded {$refundedPayments} cancelled order payments");
        Log::info('pc');

        return Command::SUCCESS;
    }
}
