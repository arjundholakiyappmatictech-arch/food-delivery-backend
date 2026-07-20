<?php

namespace App\Services;

use App\Exceptions\Restaurant\DuplicateRestaurantException;
use App\Models\Address;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RestaurantService
{
    private const DUPLICATE_RADIUS_METERS = 10;

    public function store(array $data): Restaurant
    {
        $user = Auth::user();

        $this->ensureRestaurantOwner($user);

        $this->duplicateRestaurantCheck($data);

        return Restaurant::create([
            'restaurant_owner_id' => $user->id,
            'name' => $data['name'],
            'address' => $data['address'],
            'status' => $data['status'] ?? 'closed',
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
        ]);
    }

    public function getMenus(Restaurant $restaurant): Collection
    {
        $user = Auth::user();

        if ($user->type !== 'customer') {
            throw new HttpException(403, 'Only customers can view restaurant menus');
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
        $address = Address::query()
            ->where('id', '=', $data['address_id'])
            ->where('user_id', '=', Auth::id())
            ->firstOrFail();

        $this->authorizeAddressOwner($address);

        $include = $data['include'] ?? null;
        $search = $data['q'] ?? null;
        $perPage = $data['per_page'] ?? 2;

        $latitude = $address->latitude;
        $longitude = $address->longitude;

        $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';

        $restaurants = Restaurant::query()
            ->select(['id', 'name', 'address', 'status', 'latitude', 'longitude'])
            ->selectRaw(
                "
            (
                6371 * acos(
                    LEAST(1, GREATEST(-1,
                        cos(radians(?))
                        * cos(radians(latitude))
                        * cos(radians(longitude) - radians(?))
                        + sin(radians(?))
                        * sin(radians(latitude))
                    ))
                )
            ) AS distance
        ",
                [$latitude, $longitude, $latitude],
            )
            ->when($include === 'menus', function ($query) {
                $query->with('menus');
            })
            ->when($include === 'menus.menuItems', function ($query) use ($search, $operator) {
                $query->with([
                    'menus' => function ($menuQuery) use ($search, $operator) {
                        if ($search) {
                            $menuQuery->whereHas('menuItems', function ($itemQuery) use ($search, $operator) {
                                $itemQuery->where('name', $operator, "%{$search}%");
                            });
                        }

                        $menuQuery->with([
                            'menuItems' => function ($itemQuery) use ($search, $operator) {
                                if ($search) {
                                    $itemQuery->where('name', $operator, "%{$search}%");
                                }
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
            ->simplePaginate($perPage);

        $restaurants->setCollection(
            $restaurants->getCollection()->transform(function ($restaurant) {
                $distance = (float) $restaurant->distance;

                $restaurant->distance = $distance < 1 ? round($distance * 1000) . ' m' : round($distance, 1) . ' km';

                return $restaurant;
            }),
        );

        return $restaurants;
    }

    private function authorizeAddressOwner(Address $address): void
    {
        $user = Auth::user();

        if ($address->user_id !== $user->id) {
            throw new AuthorizationException('You are not allowed to use this address.');
        }
    }

    private function ensureRestaurantOwner(User $user): void
    {
        if ($user->type !== 'restaurant_owner') {
            throw new AuthorizationException('Only restaurant owners can manage restaurants.');
        }
    }

    private function duplicateRestaurantCheck(array $data, ?Restaurant $currentRestaurant = null): void
    {
        $latitude = (float) $data['latitude'];
        $longitude = (float) $data['longitude'];

        $radiusInKm = self::DUPLICATE_RADIUS_METERS / 1000;

        $query = Restaurant::query()
            ->select(['id', 'name', 'address', 'status', 'latitude', 'longitude'])
            ->selectRaw(
                '
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
            ',
                [$latitude, $longitude, $latitude],
            )
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
