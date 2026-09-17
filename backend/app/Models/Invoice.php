<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{

    protected $fillable = ['order_id', 'invoice_number', 'delivery_fee', 'total', 'generated_at'];

    protected $casts = [
        'generated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
