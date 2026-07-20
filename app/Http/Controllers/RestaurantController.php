<?php

namespace App\Http\Controllers;

use App\Exceptions\Restaurant\DuplicateRestaurantException;
use App\Http\Requests\NearByRestaurantRequest;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use App\Services\RestaurantService;
use App\Http\Resources\MenuResource;
use App\Http\Resources\RestaurantResource;
use App\Http\Requests\StoreRestaurantRequest;

class RestaurantController extends Controller
{
    public function __construct(protected RestaurantService $restaurantService) {}

    public function menus(Restaurant $restaurant): JsonResponse
    {
        $menus = $this->restaurantService->getMenus($restaurant);

        return $this->successResponse('Restaurant menus fetched successfully', MenuResource::collection($menus));
    }

    public function store(StoreRestaurantRequest $request): JsonResponse
    {
        try {
            $restaurant = $this->restaurantService->store($request->validated());
            return $this->successResponse('Restaurant created successfully', new RestaurantResource($restaurant), 201);
        } catch (DuplicateRestaurantException $exception) {
            return $this->errorResponse($exception->getMessage(), null, 409);
        }
    }

    public function nearby(NearByRestaurantRequest $request): JsonResponse
    {
        $restaurants = $this->restaurantService->nearby($request->validated());

        return $this->successResponse(
            'Nearby restaurants fetched successfully',
            RestaurantResource::collection($restaurants),
            200,
            $this->pagination($restaurants),
        );
    }
}
