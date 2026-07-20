<?php

namespace App\Services;

use App\Exceptions\MenuItem\DuplicateMenuItemException;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;

class MenuItemService
{
    public function store(array $data): MenuItem
    {
        $menu = Menu::query()->findOrFail($data['menu_id']);

        $this->authorizeMenuOwner($menu);

        $this->duplicateMenuItemCheck(menu: $menu, name: $data['name']);

        return MenuItem::create($data);
    }

    private function authorizeMenuOwner(Menu $menu): void
    {
        $user = Auth::user();

        if ($user->type !== 'restaurant_owner') {
            throw new AuthorizationException(403, 'Only restaurant owners can manage menu items');
        }

        $hasOtherOwnerRestaurant = $menu->restaurants()->where('restaurant_owner_id', '!=', $user->id)->exists();

        if ($hasOtherOwnerRestaurant) {
            throw new AuthorizationException(403, 'You are not allowed to manage this menu items');
        }
    }

    private function duplicateMenuItemCheck(Menu $menu, string $name, ?MenuItem $currentMenuItem = null): void
    {
        $query = MenuItem::query()
            ->where('menu_id', $menu->id)
            ->whereRaw('LOWER(TRIM(name)) = LOWER(TRIM(?))', [$name]);

        if ($currentMenuItem !== null) {
            $query->whereKeyNot($currentMenuItem->id);
        }

        if ($query->exists()) {
            throw new DuplicateMenuItemException;
        }
    }
}
