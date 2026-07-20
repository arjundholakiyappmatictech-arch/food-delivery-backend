<?php

namespace App\Http\Controllers;

use Exception;
use App\Services\MenuService;
use App\Http\Requests\StoreMenuRequest;
use App\Http\Resources\MenuResource;
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
}
