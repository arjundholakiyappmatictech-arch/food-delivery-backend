<?php

namespace App\Services;

use App\Exceptions\Order\OrderAlreadyCancelledException;
use App\Exceptions\Payment\OrderAlreadyDeliveredExceptions;
use App\Exceptions\Payment\PaymentAlreadyExistsExceptions;
use App\Jobs\AssignDeliveryJob;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Services\RazorpayService;
use RuntimeException;

class PaymentService
{
    public function __construct(protected RazorpayService $razorpayService) {}

    public function makePayment(Order $order, array $data): Payment
    {
        $this->authorizeOrderOwner($order);
        $this->ensureOrderCanBePaid($order);
        $this->ensurePaymentNotExists($order);

        $paymentMethod = $data['payment_method'];

        return DB::transaction(function () use ($order, $paymentMethod) {
            if ($paymentMethod === 'razorpay') {
                $amount = (int) round($order->total * 100);
                $razorpayOrder = $this->razorpayService->createOrder($amount, $order->id);

                return Payment::create([
                    'order_id' => $order->id,
                    'payment_method' => 'razorpay',
                    'payment_status' => 'pending',
                    'razorpay_order_id' => $razorpayOrder['id'],
                    'paid_at' => null,
                ])->load('order');
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => 'cod',
                'payment_status' => 'pending',
                'paid_at' => null,
            ]);

            AssignDeliveryJob::dispatch($order->id);

            return $payment->load('order');
        });
    }

    public function verifyPayment(Order $order, array $data): Payment
    {
        $this->authorizeOrderOwner($order);
        $this->ensureOrderCanBePaid($order);

        $payment = $order->payment;

        if (!$payment) {
            throw new RuntimeException('Payment not found.', 409);
        }

        if ($payment->payment_method !== 'razorpay') {
            throw new RuntimeException('This order does not use Razorpay.', 409);
        }

        if ($payment->razorpay_order_id !== $data['razorpay_order_id']) {
            throw new RuntimeException('Invalid Razorpay order ID.', 409);
        }

        $this->razorpayService->verifyPayment(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature'],
        );

        return DB::transaction(function () use ($payment, $data, $order) {
            $payment->update([
                'razorpay_payment_id' => $data['razorpay_payment_id'],
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);

            // dispatch job after successful payment
            AssignDeliveryJob::dispatch($order->id);

            return $payment->load('order');
        });
    }

    private function authorizeOrderOwner(Order $order): User
    {
        /** @var User|null $user */
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new AuthorizationException('Only customers can make payments', 403);
        }

        if ($order->user_id !== $user->id) {
            throw new AuthorizationException('You are not allowed to pay for this order', 403);
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
