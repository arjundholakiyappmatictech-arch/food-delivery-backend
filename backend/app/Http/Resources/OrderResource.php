<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'address_id' => $this->address_id,
            'restaurant_id' => $this->restaurant_id,
            'status' => $this?->status,
            'total' => $this->total,
            'delivery_fee' => $this->delivery_fee,
            'delivery_instructions' => $this->delivery_instructions,
            'delivered_at' => $this->delivered_at,
            'cancelled_at' => $this->cancelled_at,

            'customer' => new UserResource($this->whenLoaded('user')),
            'restaurant' => new RestaurantResource($this->whenLoaded('restaurant')),
            'delivery_address' => new AddressResource($this->whenLoaded('address')),
            'order_items' => OrderItemResource::collection($this->whenLoaded('items')),
            'order_payment' => new PaymentResource($this->whenLoaded('payment')),
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'order_review' => new ReviewResource($this->whenLoaded('orderReview')),
            'order_delivery' => new OrderDeliveryResource($this->whenLoaded('delivery')),
        ];
    }
}
