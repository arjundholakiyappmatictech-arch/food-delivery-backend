<?php

namespace App\Services;

use Razorpay\Api\Api;

class RazorpayService
{
    protected Api $razorpay;

    public function __construct()
    {
        $this->razorpay = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));
    }

    public function createOrder(int $amount, int $orderId): array
    {
        $order = $this->razorpay->order->create([
            'amount' => $amount,
            'currency' => 'INR',
            'receipt' => 'order_' . $orderId,
        ]);

        return $order->toArray();
    }

    public function verifyPayment(string $razorpayOrderId, string $razorpayPaymentId, string $razorpaySignature): void
    {
        $this->razorpay->utility->verifyPaymentSignature([
            'razorpay_order_id' => $razorpayOrderId,
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_signature' => $razorpaySignature,
        ]);
    }

    public function verifyWebhookSignature(string $payload, string $signature): void
    {
        $this->razorpay->utility->verifyWebhookSignature(
            $payload,
            $signature,
            config('services.razorpay.webhook_secret'),
        );
    }
}
