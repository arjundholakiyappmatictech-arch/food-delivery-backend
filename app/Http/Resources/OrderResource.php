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
            'status' => $this->status,
            'total' => $this->total,
            'delivery_fee' => $this->delivery_fee,
            'delivery_instructions' => $this->delivery_instructions,
            'delivered_at' => $this->delivered_at,

            'user' => new UserResource($this->whenLoaded('user')),
            'address' => new AddressResource($this->whenLoaded('address')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'reviews' => new ReviewResource($this->whenLoaded('orderReview')),
            'deliveries' => new OrderDeliveryResource($this->whenLoaded('delivery')),
        ];
    }
}
