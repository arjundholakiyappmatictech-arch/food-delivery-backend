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
        $this->authorize($order);
        $this->ensurePaymentNotExists($order);

        $paymentStatus = $data['payment_method'] === 'cod' ? 'pending' : 'paid';

        return DB::transaction(function () use ($order, $data, $paymentStatus) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => $data['payment_method'],
                'payment_status' => $paymentStatus,
                'paid_at' => $paymentStatus === 'paid' ? now() : null,
            ]);

            $order->update([
                'payment_method' => $data['payment_method'],
                'payment_status' => $paymentStatus,
            ]);

            return $payment->load('order');
        });
    }

    private function authorize(Order $order): User
    {
        $user = Auth::user();

        if (! $user) {
            throw new HttpException(401, 'Please login first.');
        }

        if ($user->type !== 'customer') {
            throw new HttpException(403, 'Only customers can make payment.');
        }

        if ($order->user_id !== $user->id) {
            throw new HttpException(403, 'You are not allowed to pay for this order.');
        }

        return $user;
    }

    private function ensurePaymentNotExists(Order $order): void
    {
        if ($order->payment) {
            throw new HttpException(409, 'Payment already exists for this order.');
        }
    }
}
