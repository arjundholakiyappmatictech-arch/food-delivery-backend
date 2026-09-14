<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'method' => $this->payment_method,
            'status' => $this->payment_status,
            'razorpay_order_id' => $this->razorpay_order_id,
            'amount' => (int) round($this->order->total * 100),
            'currency' => 'INR',
            'paid_at' => $this->paid_at,
            'refunded_at' => $this->refunded_at,
        ];
    }
}
