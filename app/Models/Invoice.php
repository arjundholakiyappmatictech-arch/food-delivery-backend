<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Order;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'invoice_number', 'delivery_fee', 'total', 'generated_at'];

    protected $casts = [
        'generated_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
