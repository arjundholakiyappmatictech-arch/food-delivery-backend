<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkStoreMenuRequest;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Resources\MenuResource;
use App\Models\Restaurant;
use App\Services\MenuService;
use Exception;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function __construct(protected MenuService $menuService) {}

    public function store(StoreMenuRequest $request): JsonResponse
    {
        try {
            $menu = $this->menuService->store($request->validated());

            return $this->successResponse('Menu created successfully', new MenuResource($menu), 201);
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }

    public function bulkStore(BulkStoreMenuRequest $request, Restaurant $restaurant): JsonResponse
    {
        $menus = $this->menuService->bulkStore($restaurant, $request->validated('menus'));

        return $this->successResponse(
            'Menus and menu items created successfully',
            MenuResource::collection($menus),
            201,
        );
    }
}
