<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Models\Order;
use App\Models\OrderReview;
use App\Models\Address;
use App\Models\Cart;
use App\Models\OrderDelivery;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['full_name', 'email', 'password', 'phone_number', 'password', 'type'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    public function reviews()
    {
        return $this->hasMany(OrderReview::class);
    }
    public function deliveries()
    {
        return $this->hasMany(OrderDelivery::class);
    }
    public function restaurants()
    {
        return $this->hasMany(Restaurant::class, 'restaurant_owner_id');
    }
}
