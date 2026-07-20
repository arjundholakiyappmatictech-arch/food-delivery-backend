<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Models\Order;

class InvoiceService
{
    public function generate(Order $order): Invoice
    {
        $user = Auth::user();

        if (!$user) {
            throw new HttpException(401, 'Please login first.');
        }

        if ($user->type !== 'customer') {
            throw new HttpException(403, 'Only customers can generate invoices.');
        }

        if ($order->user_id !== $user->id) {
            throw new HttpException(403, 'You can only generate invoice for your own order.');
        }

        if ($order->invoice) {
            throw new HttpException(409, 'Invoice already generated for this order.');
        }

        return Invoice::create([
            'order_id' => $order->id,
            'invoice_number' => 'INV-' . now()->format('YmdHis') . '-' . $order->id,
            'delivery_fee' => $order->delivery_fee,
            'total' => $order->total,
            'generated_at' => now(),
        ])->load('order');
    }

    public function getOrder(Invoice $invoice)
    {
        $this->authorizeCustomerInvoice($invoice);

        return $invoice->load('order')->order;
    }

    private function authorizeCustomerInvoice(Invoice $invoice): void
    {
        $user = Auth::user();

        if (!$user) {
            throw new HttpException(401, 'Please login first.');
        }

        if ($user->type !== 'customer') {
            throw new HttpException(403, 'Only customers can access invoices.');
        }

        $invoice->loadMissing('order');

        if ($invoice->order->user_id !== $user->id) {
            throw new HttpException(403, 'You are not allowed to access this invoice.');
        }
    }
}
