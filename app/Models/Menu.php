<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Restaurant;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function restaurants(): BelongsToMany
    {
        return $this->belongsToMany(
            Restaurant::class,
            'menu_restaurant',
            'menu_id',
            'restaurant_id'
        );
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }
}
