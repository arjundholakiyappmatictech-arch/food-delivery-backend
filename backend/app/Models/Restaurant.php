<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = ['restaurant_owner_id', 'name', 'image_path', 'address', 'status', 'latitude', 'longitude'];

    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'menu_restaurant', 'restaurant_id', 'menu_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'restaurant_owner_id');
    }

    public function carts()
    {
        return $this->belongsToMany(Cart::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
