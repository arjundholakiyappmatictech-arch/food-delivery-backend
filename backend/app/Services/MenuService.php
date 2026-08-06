<?php

namespace App\Services;

use App\Exceptions\Menu\DuplicateMenuException;
use App\Models\Menu;
use App\Models\Restaurant;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MenuService
{
    public function store(array $data): Menu
    {
        $restaurantIds = collect($data['restaurant_ids'])->map(fn($id): int => (int) $id)->unique()->sort()->values();

        $restaurants = Restaurant::query()->whereIn('id', $restaurantIds)->get();

        if ($restaurants->count() !== $restaurantIds->count()) {
            throw new AuthorizationException('One or more selected restaurants are invalid', 403);
        }

        foreach ($restaurants as $restaurant) {
            $this->authorizeRestaurantOwner($restaurant);
        }

        $this->duplicateMenuCheck($data['name'], $restaurantIds->all());

        return DB::transaction(function () use ($data, $restaurantIds): Menu {
            $menu = Menu::create([
                'name' => trim($data['name']),
            ]);

            $menu->restaurants()->attach($restaurantIds->all());

            return $menu->load('restaurants');
        });
    }

    public function bulkStore(Restaurant $restaurant, array $menusData): Collection
    {
        $user = Auth::user();

        if ($restaurant->restaurant_owner_id !== $user->id) {
            throw new AuthorizationException('You can only add menus to your own restaurant.');
        }

        return DB::transaction(function () use ($restaurant, $menusData) {
            $createdMenus = new Collection();

            foreach ($menusData as $menuData) {
                // Create menu
                $menu = $restaurant->menus()->create([
                    'name' => $menuData['name'],
                ]);

                // Create menu items
                foreach ($menuData['items'] as $itemData) {
                    $imagePath = $itemData['image']->store('menu-items', 'public');

                    $menu->menuItems()->create([
                        'name' => $itemData['name'],
                        'price' => $itemData['price'],
                        'availability' => $itemData['availability'] ?? true,
                        'image' => $imagePath,
                    ]);
                }

                $createdMenus->push($menu->load('menuItems'));
            }

            return $createdMenus;
        });
    }

    private function authorizeRestaurantOwner(Restaurant $restaurant): void
    {
        $user = Auth::user();

        if ($user->type !== 'restaurant_owner') {
            throw new AuthorizationException('Only restaurant owners can manage menus', 403);
        }

        if ($restaurant->restaurant_owner_id !== $user->id) {
            throw new AuthorizationException('You are not allowed to manage this restaurant menu', 403);
        }
    }

    private function duplicateMenuCheck(string $name, array $restaurantIds, ?Menu $currentMenu = null): void
    {
        sort($restaurantIds);

        $query = Menu::query()
            ->with('restaurants:id')
            ->WhereRaw('LOWER(TRIM(name)) = LOWER(TRIM(?))', [$name]);

        if ($currentMenu !== null) {
            $query->whereKeyNot($currentMenu->id);
        }

        $duplicateExists = $query->get()->contains(function (Menu $menu) use ($restaurantIds): bool {
            $existingRestaurantIds = $menu->restaurants
                ->pluck('id')
                ->map(fn($id): int => (int) $id)
                ->sort()
                ->values()
                ->all();

            return $existingRestaurantIds === $restaurantIds;
        });

        if ($duplicateExists) {
            throw new DuplicateMenuException();
        }
    }
}
