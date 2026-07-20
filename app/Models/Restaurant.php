<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Menu;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Restaurant extends Model
{
    use HasFactory;

    protected $fillable = ['restaurant_owner_id', 'name', 'address', 'status', 'latitude', 'longitude'];

    public function menus(): BelongsToMany
    {
        return $this->belongsToMany(Menu::class, 'menu_restaurant', 'restaurant_id', 'menu_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'restaurant_owner_id');
    }
}
