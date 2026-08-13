<?php

namespace App\Services;

use App\Exceptions\MenuItem\DuplicateMenuItemException;
use App\Models\Menu;
use App\Models\MenuItem;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class MenuItemService
{
    public function store(array $data): MenuItem
    {
        $menu = Menu::query()->findOrFail($data['menu_id']);

        $this->authorizeMenuOwner($menu);

        $this->duplicateMenuItemCheck(menu: $menu, name: $data['name']);

        /** @var UploadedFile $image */
        $image = $data['image'];

        // Do not send the uploadfile object to MenuItem::create().
        unset($data['image']);

        $storedImagePath = null;

        try {
            return DB::transaction(function () use ($data, $menu, $image, &$storedImagePath): MenuItem {
                $menuItem = MenuItem::create([
                    'menu_id' => $menu->id,
                    'name' => $data['name'],
                    'price' => $data['price'],
                    'availability' => $data['availability'] ?? true,
                ]);

                $storedImagePath = $image->store("menu-items/{$menuItem->id}", 'public');

                if ($storedImagePath === false) {
                    throw new RuntimeException('The menu-item image could not be stored.', 409);
                }

                $menuItem->update([
                    'image_path' => $storedImagePath,
                ]);

                return $menuItem->refresh()->load('menu');
            });
        } catch (Exception $exception) {
            // to cleanup orphan file
            if ($storedImagePath !== null) {
                Storage::disk('public')->delete($storedImagePath);
            }

            throw $exception;
        }
    }

    private function authorizeMenuOwner(Menu $menu): void
    {
        $user = Auth::user();

        if ($user->type !== 'restaurant_owner') {
            throw new AuthorizationException('Only restaurant owners can manage menu items', 403);
        }

        $hasOtherOwnerRestaurant = $menu->restaurants()->where('restaurant_owner_id', '!=', $user->id)->exists();

        if ($hasOtherOwnerRestaurant) {
            throw new AuthorizationException('You are not allowed to manage this menu items', 403);
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
            throw new DuplicateMenuItemException();
        }
    }
}
