<?php

namespace App\Services;

use App\Exceptions\Restaurant\DuplicateRestaurantException;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RestaurantService
{
    private const DUPLICATE_RADIUS_METERS = 8;

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

    public function nearby(array $data): LengthAwarePaginator
    {
        /** @var User $user */
        $user = Auth::user();

        [$latitude, $longitude] = $this->resolveCoordinates($data, $user);

        $include = $data['include'] ?? null;
        $search = $data['q'] ?? null;
        $menuName = $data['menu_name'] ?? null;
        $sortBy = $data['sort_by'] ?? null;
        $openNow = filter_var($data['open_now'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $radius = (float) ($data['radius'] ?? 500);
        $perPage = $data['per_page'] ?? 5;

        $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';
        $keywords = $search ? array_filter(preg_split('/\s+/', trim($search))) : [];

        $query = Restaurant::query()
            ->select(['id', 'name', 'address', 'status', 'latitude', 'longitude', 'image_path'])
            ->selectRaw($this->getDistanceSql(), [$latitude, $longitude, $latitude])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereRaw($this->getDistanceFilterSql(), [$latitude, $longitude, $latitude, $radius])
            ->when($menuName, function ($query) use ($menuName, $operator) {
                $query->whereHas('menus', function ($menuQuery) use ($menuName, $operator) {
                    $menuQuery->where('name', $operator, $menuName);
                });
            })
            ->when($openNow, function ($query) {
                $query->where('status', 'open');
            });

        $this->applyIncludes($query, $include, $menuName, $search, $operator);
        $this->applyKeywordSearch($query, $keywords, $operator);
        $this->applySorting($query, $sortBy);

        $restaurants = $query->paginate($perPage)->withQueryString();

        return $this->formatDistances($restaurants);
    }

    private function resolveCoordinates(array $data, User $user): array
    {
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

            return [(float) $address->latitude, (float) $address->longitude];
        }

        return [(float) $data['latitude'], (float) $data['longitude']];
    }

    private function getDistanceSql(): string
    {
        return <<<'SQL'
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
    }

    private function getDistanceFilterSql(): string
    {
        return <<<'SQL'
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
            ) <= ?
        SQL;
    }

    private function applyIncludes(Builder $query, ?string $include, ?string $menuName, ?string $search, string $operator): void
    {
        $query
            ->when($include === 'menus', function ($query) {
                $query->with('menus');
            })
            ->when($include === 'menus.menuItems', function ($query) use ($menuName, $search, $operator) {
                $query->with([
                    'menus' => function ($menuQuery) use ($menuName, $search, $operator) {
                        $menuQuery->when($menuName, function ($menuQuery) use ($menuName, $operator) {
                            $menuQuery->where('name', $operator, $menuName);
                        });
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
            });
    }

    private function applyKeywordSearch(Builder $query, array $keywords, string $operator): void
    {
        if (empty($keywords)) {
            return;
        }

        foreach ($keywords as $keyword) {
            $query->where(function ($query) use ($keyword, $operator) {
                $query
                    ->where('restaurants.name', $operator, "%{$keyword}%")
                    ->orWhere('restaurants.address', $operator, "%{$keyword}%")
                    ->orWhereHas('menus', function ($menuQuery) use ($keyword, $operator) {
                        $menuQuery->where('name', $operator, "%{$keyword}%");
                    })
                    ->orWhereHas('menus.menuItems', function ($itemQuery) use ($keyword, $operator) {
                        $itemQuery->where('name', $operator, "%{$keyword}%");
                    });
            });
        }
    }

    private function applySorting(Builder $query, ?string $sortBy): void
    {
        $query
            ->when($sortBy === 'nearest', function ($query) {
                $query->orderBy('distance');
            })
            ->when($sortBy === 'a-z', function ($query) {
                $query->orderBy('name');
            })
            ->when($sortBy === 'z-a', function ($query) {
                $query->orderByDesc('name');
            });
    }

    private function formatDistances(LengthAwarePaginator $restaurants): LengthAwarePaginator
    {
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

        // Haversine formula to calculate distance in km for geospatial duplicate checking
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
