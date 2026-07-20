<?php

namespace App\Http\Controllers;

use App\Exceptions\MenuItem\DuplicateMenuItemException;
use App\Http\Requests\StoreMenuItemRequest;
use App\Http\Resources\MenuItemResource;
use App\Services\MenuItemService;
use Illuminate\Http\JsonResponse;

class MenuItemController extends Controller
{
    public function __construct(protected MenuItemService $menuItemService) {}

    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        try {
            $menuItem = $this->menuItemService->store($request->validated());

            return $this->successResponse('MenuItem created successfully', new MenuItemResource($menuItem), 201);
        } catch (DuplicateMenuItemException $exception) {
            return $this->errorResponse($exception->getMessage(), null, 409);
        }
    }
}
