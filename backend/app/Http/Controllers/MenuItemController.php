<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Services\MenuItemService;
use Exception;
use Illuminate\Http\JsonResponse;

class MenuItemController extends Controller
{
    public function __construct(protected MenuItemService $menuItemService) {}

    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        try {
            $menuItem = $this->menuItemService->store($request->validated());

            return $this->successResponse('MenuItem created successfully', new MenuItemResource($menuItem), 201);
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }
}
