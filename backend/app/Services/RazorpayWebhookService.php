<?php

namespace App\Services;

use App\Models\Payment;

class RazorpayWebhookService
{
    public function handle(string $event, array $payload, ?string $eventId = null): void
    {
        if ($eventId && Payment::query()->where('razorpay_event_id', $eventId)->exists()) {
            return;
        }

        match ($event) {
            'payment.captured' => $this->handlePaymentCaptured($payload, $eventId),
            'payment.failed' => $this->handlePaymentFailed($payload, $eventId),
            'order.paid' => $this->handleOrderPaid($payload, $eventId),
            default => null,
        };
    }

    private function handlePaymentCaptured(array $payload, ?string $eventId): void
    {
        $paymentData = $payload['payment']['entity'] ?? [];

        $razorpayOrderId = $paymentData['order_id'] ?? null;
        $razorpayPaymentId = $paymentData['id'] ?? null;

        if (!$razorpayOrderId || !$razorpayPaymentId) {
            return;
        }

        $payment = Payment::query()->where('razorpay_order_id', $razorpayOrderId)->first();

        if (!$payment) {
            return;
        }

        $payment->update([
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_event_id' => $eventId,
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    private function handlePaymentFailed(array $payload, ?string $eventId): void
    {
        $paymentData = $payload['payment']['entity'] ?? [];

        $razorpayOrderId = $paymentData['order_id'] ?? null;
        $razorpayPaymentId = $paymentData['id'] ?? null;

        if (!$razorpayOrderId) {
            return;
        }

        $payment = Payment::query()->where('razorpay_order_id', $razorpayOrderId)->first();

        if (!$payment) {
            return;
        }

        if ($payment->payment_status === 'paid') {
            return;
        }

        $payment->update([
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_event_id' => $eventId,
            'payment_status' => 'failed',
        ]);
    }

    private function handleOrderPaid(array $payload, ?string $eventId): void
    {
        $orderData = $payload['order']['entity'] ?? [];

        $razorpayOrderId = $orderData['id'] ?? null;

        if (!$razorpayOrderId) {
            return;
        }

        $payment = Payment::query()->where('razorpay_order_id', $razorpayOrderId)->first();

        if (!$payment) {
            return;
        }

        $payment->update([
            'razorpay_event_id' => $eventId,
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
