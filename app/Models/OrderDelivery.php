<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderDelivery extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'user_id', 'status'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function deliveryAgent()
    {
        return $this->belongsTo(User::class);
    }
}
