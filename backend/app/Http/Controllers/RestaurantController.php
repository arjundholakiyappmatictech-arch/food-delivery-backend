<?php

namespace App\Http\Controllers;

use App\Http\Requests\NearByRestaurantRequest;
use App\Http\Requests\StoreRestaurantRequest;
use App\Http\Requests\UpdateRestaurantImageRequest;
use App\Http\Resources\MenuResource;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use App\Services\RestaurantService;
use Exception;
use Illuminate\Http\JsonResponse;

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
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }

    public function updateImage(UpdateRestaurantImageRequest $request, Restaurant $restaurant): JsonResponse
    {
        try {
            $restaurant = $this->restaurantService->updateImage($restaurant, $request->validated());

            return $this->successResponse('Restaurant image updated successfully', new RestaurantResource($restaurant));
        } catch (Exception $exception) {
            return $this->errorResponse(
                $exception->getMessage(),
                null,
                $exception->getCode() >= 400 && $exception->getCode() < 600 ? $exception->getCode() : 400
            );
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
