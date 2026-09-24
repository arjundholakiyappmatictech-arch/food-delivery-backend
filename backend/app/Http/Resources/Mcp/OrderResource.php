<?php

namespace App\Http\Resources\Mcp;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => $this->total,
            'delivery_fee' => $this->delivery_fee,
            'delivery_instructions' => $this->delivery_instructions,
            'created_at' => $this->created_at,
            'delivered_at' => $this->delivered_at,
            'cancelled_at' => $this->cancelled_at,

            'restaurant' => [
                'name' => $this->restaurant?->name,
                'address' => $this->restaurant?->address,
                'status' => $this->restaurant?->status,
            ],

            'delivery_address' => [
                'label' => $this->address?->label,
                'address_line' => $this->address?->address_line,
                'city' => $this->address?->city,
                'state' => $this->address?->state,
                'pincode' => $this->address?->pincode,
            ],

            'order_items' => $this->items
                ->map(
                    fn($item) => [
                        'name' => $item->menuItem?->name,
                        'quantity' => $item->quantity,
                        'price_at_purchase' => $item->price_at_purchase,
                    ],
                )
                ->values(),

            'order_payment' => [
                'method' => $this->payment?->payment_method,
                'status' => $this->payment?->payment_status,
                'currency' => 'INR',
                'paid_at' => $this->payment?->paid_at,
                'refunded_at' => $this->payment?->refunded_at,
            ],

            'order_review' => $this->orderReview
                ? [
                    'rating' => $this->orderReview->rating,
                    'comment' => $this->orderReview->comment,
                ]
                : null,

            'order_delivery' => [
                'status' => $this->delivery?->status,
            ],
        ];
    }
}
