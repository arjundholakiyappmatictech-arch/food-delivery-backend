<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /* dd(get_debug_type($this->resource), $this->resource); */

        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'menu_item_id' => $this->menu_item_id,
            'quantity' => $this->quantity,
            'price_at_purchase' => $this->price_at_purchase,

            'menu_item' => new MenuItemResource($this->whenLoaded('menuItem')),
        ];
    }
}
