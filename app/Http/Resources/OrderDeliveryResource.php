<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'delivery_agent_id' => $this->user_id,
            'status' => $this->status,

            'order' => new OrderResource($this->whenLoaded('order')),
            'customer' => new UserResource($this->whenLoaded('user')),
            'delivery_address' => new AddressResource($this->whenLoaded('addresses')),
        ];
    }
}
