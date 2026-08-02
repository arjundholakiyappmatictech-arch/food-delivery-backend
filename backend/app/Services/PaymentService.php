<?php

namespace App\Services;

use App\Exceptions\Order\OrderAlreadyCancelledException;
use App\Exceptions\Payment\OrderAlreadyDeliveredExceptions;
use App\Exceptions\Payment\PaymentAlreadyExistsExceptions;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

    public function refundCancelledOrders(): int
    {
        return Payment::query()
            ->where('payment_status', 'paid')
            ->whereHas('order', function ($query) {
                $query->where('status', 'cancelled')->where('cancelled_at', '<=', now()->subMinutes(2));
            })
            ->update([
                'payment_status' => 'refunded',
            ]);
    }

    private function authorizeOrderOwner(Order $order): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new AuthorizationException('Only customers can make payments');
        }

        if ($order->user_id !== $user->id) {
            throw new AuthorizationException('You are not allowed to pay for this order');
        }

        return $user;
    }

    private function ensureOrderCanBePaid(Order $order): void
    {
        if ($order->status === 'cancelled') {
            throw new OrderAlreadyCancelledException();
        }

        if ($order->status === 'delivered') {
            throw new OrderAlreadyDeliveredExceptions();
        }
    }

    private function ensurePaymentNotExists(Order $order): void
    {
        if ($order->payment()->exists()) {
            throw new PaymentAlreadyExistsExceptions();
        }
    }
}
