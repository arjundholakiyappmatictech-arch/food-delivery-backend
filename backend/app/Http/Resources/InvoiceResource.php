<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'order_id' => $this->resource['order_id'],
            'invoice_number' => $this->resource['invoice_number'],
            'delivery_fee' => $this->resource['delivery_fee'],
            'total' => $this->resource['total'],
            'generated_at' => $this->resource['generated_at'],

            'user' => new UserResource($this->resource['user']),
            'address' => new AddressResource($this->resource['address']),
            'payment' => new PaymentResource($this->resource['payment']),
        ];
    }
}
