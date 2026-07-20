<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PaymentService
{
    public function makePayment(Order $order, array $data): Payment
    {
        $this->authorizeOrderOwner($order);
        $this->ensureOrderCanBePaid($order);
        $this->ensurePaymentNotExists($order);

        $paymentMethod = $data['payment_method'];

        $paymentStatus = $paymentMethod === 'cod' ? 'pending' : 'paid';

        return DB::transaction(function () use ($order, $paymentMethod, $paymentStatus) {
            return Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'paid_at' => $paymentStatus === 'paid' ? now() : null,
            ])->load('order');
        });
    }

    private function authorizeOrderOwner(Order $order): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new HttpException(403, 'Only customers can make payments.');
        }

        if ($order->user_id !== $user->id) {
            throw new HttpException(403, 'You are not allowed to pay for this order.');
        }

        return $user;
    }

    private function ensureOrderCanBePaid(Order $order): void
    {
        if ($order->status === 'cancelled') {
            throw new HttpException(409, 'A cancelled order cannot be paid.');
        }

        if ($order->status === 'delivered') {
            throw new HttpException(409, 'This order has already been delivered.');
        }
    }

    private function ensurePaymentNotExists(Order $order): void
    {
        if ($order->payment()->exists()) {
            throw new HttpException(409, 'Payment already exists for this order.');
        }
    }
}
