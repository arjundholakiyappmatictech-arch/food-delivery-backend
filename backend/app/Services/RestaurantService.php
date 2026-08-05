<?php

namespace App\Services;

use App\Exceptions\Restaurant\DuplicateRestaurantException;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class RestaurantService
{
    private const DUPLICATE_RADIUS_METERS = 10;

    public function store(array $data): Restaurant
    {
        $user = Auth::user();

        $this->ensureRestaurantOwner($user);

        $this->duplicateRestaurantCheck($data);

        return DB::transaction(function () use ($data, $user) {
            $restaurant = Restaurant::create([
                'restaurant_owner_id' => $user->id,
                'name' => $data['name'],
                'address' => $data['address'],
                'status' => $data['status'] ?? 'closed',
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
            ]);

            $imagePath = $data['image']->store("restaurants/{$restaurant->id}", 'public');

            $restaurant->update([
                'image_path' => $imagePath,
            ]);

            return $restaurant->refresh();
        });
    }

    public function getMenus(Restaurant $restaurant): Collection
    {
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new AuthorizationException('Only customers can view restaurant menus', 403);
        }

        return $restaurant
            ->menus()
            ->with([
                'menuItems' => function ($query) {
                    $query->where('availability', true)->latest('menu_items.created_at');
                },
            ])
            ->latest('menus.created_at')
            ->get();
    }

    public function nearby(array $data): Paginator
    {
        /** @var User $user */
        $user = Auth::user();

        if (isset($data['address_id'])) {
            $address = $user
                ->addresses()
                ->select(['id', 'latitude', 'longitude'])
                ->findOrFail($data['address_id']);

            if ($address->latitude === null || $address->longitude === null) {
                throw ValidationException::withMessages([
                    'address_id' => ['The selected address does not contain valid location coordinates.'],
                ]);
            }

            $latitude = (float) $address->latitude;
            $longitude = (float) $address->longitude;
        } else {
            $latitude = (float) $data['latitude'];
            $longitude = (float) $data['longitude'];
        }

        $include = $data['include'] ?? null;
        $search = $data['q'] ?? null;
        $perPage = $data['per_page'] ?? 10;

        $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';

        $distanceSql = <<<'SQL'
            (
                6371 * acos(
                    LEAST(
                        1,
                        GREATEST(
                            -1,
                            cos(radians(?))
                            * cos(radians(latitude))
                            * cos(radians(longitude) - radians(?))
                            + sin(radians(?))
                            * sin(radians(latitude))
                        )
                    )
                )
            ) AS distance
        SQL;

        $restaurants = Restaurant::query()
            ->select(['id', 'name', 'address', 'status', 'latitude', 'longitude'])
            ->selectRaw($distanceSql, [$latitude, $longitude, $latitude])
            ->when($include === 'menus', function ($query) {
                $query->with('menus');
            })
            ->when($include === 'menus.menuItems', function ($query) use ($search, $operator) {
                $query->with([
                    'menus' => function ($menuQuery) use ($search, $operator) {
                        $menuQuery
                            ->when($search, function ($menuQuery) use ($search, $operator) {
                                $menuQuery->whereHas('menuItems', function ($itemQuery) use ($search, $operator) {
                                    $itemQuery->where('name', $operator, "%{$search}%");
                                });
                            })
                            ->with([
                                'menuItems' => function ($itemQuery) use ($search, $operator) {
                                    $itemQuery->when($search, function ($itemQuery) use ($search, $operator) {
                                        $itemQuery->where('name', $operator, "%{$search}%");
                                    });
                                },
                            ]);
                    },
                ]);
            })
            ->when($search, function ($query) use ($search, $operator) {
                $query->whereHas('menus.menuItems', function ($itemQuery) use ($search, $operator) {
                    $itemQuery->where('name', $operator, "%{$search}%");
                });
            })
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->orderBy('distance')
            ->simplePaginate($perPage)
            ->withQueryString();

        $restaurants->setCollection(
            $restaurants->getCollection()->map(function (Restaurant $restaurant) {
                $distance = (float) $restaurant->distance;

                $restaurant->distance = $distance < 1 ? round($distance * 1000) . ' m' : round($distance, 1) . ' km';

                return $restaurant;
            }),
        );

        return $restaurants;
    }

    private function ensureRestaurantOwner(User $user): void
    {
        if ($user->type !== 'restaurant_owner') {
            throw new AuthorizationException('Only restaurant owners can manage restaurants.', 403);
        }
    }

    private function duplicateRestaurantCheck(array $data, ?Restaurant $currentRestaurant = null): void
    {
        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];

        $radiusInKm = self::DUPLICATE_RADIUS_METERS / 1000;

        // calculated distance using Nowdoc syntax
        $distanceSql = <<<'SQL'
            restaurants.*,
            (
                6371 * ACOS(
                    COS(RADIANS(?))
                    * COS(RADIANS(latitude))
                    * COS(RADIANS(longitude) - RADIANS(?))
                    + SIN(RADIANS(?))
                    * SIN(RADIANS(latitude))
                )
            ) AS distance
        SQL;

        $query = Restaurant::query()
            ->select(['id', 'name', 'address', 'status', 'latitude', 'longitude'])
            ->selectRaw($distanceSql, [$latitude, $longitude, $latitude])
            ->whereRaw('LOWER(TRIM(name)) = LOWER(TRIM(?))', [$data['name']]);

        if ($currentRestaurant) {
            $query->whereKeyNot($currentRestaurant->id);
        }

        $duplicateExists = DB::query()
            ->fromSub($query, 'restaurants_with_distance')
            ->where('distance', '<=', $radiusInKm)
            ->exists();

        if ($duplicateExists) {
            throw new DuplicateRestaurantException(self::DUPLICATE_RADIUS_METERS);
        }
    }
}
