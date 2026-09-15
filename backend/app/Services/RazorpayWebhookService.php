<?php

namespace App\Services;

use App\Jobs\AssignDeliveryJob;
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
            'refund.created' => $this->handleRefundCreated($payload, $eventId),
            'refund.processed' => $this->handleRefundProcessed($payload, $eventId),
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

        AssignDeliveryJob::dispatch($payment->order_id)->delay(now()->addMinute());
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

    private function handleRefundCreated(array $payload, ?string $eventId): void
    {
        $refundData = $payload['refund']['entity'] ?? [];

        $razorpayPaymentId = $refundData['payment_id'] ?? null;

        if (!$razorpayPaymentId) {
            return;
        }

        $payment = Payment::query()->where('razorpay_payment_id', $razorpayPaymentId)->first();

        if (!$payment) {
            return;
        }

        $payment->update([
            'razorpay_event_id' => $eventId,
        ]);
    }

    private function handleRefundProcessed(array $payload, ?string $eventId): void
    {
        $refundData = $payload['refund']['entity'] ?? [];

        $razorpayPaymentId = $refundData['payment_id'] ?? null;

        if (!$razorpayPaymentId) {
            return;
        }

        $payment = Payment::query()->where('razorpay_payment_id', $razorpayPaymentId)->first();

        if (!$payment) {
            return;
        }

        $payment->update([
            'payment_status' => 'refunded',
            'refunded_at' => now(),
            'razorpay_event_id' => $eventId,
        ]);
    }
}
