<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Services\OrderItemService;
use Illuminate\Http\JsonResponse;

class OrderItemController extends Controller
{
    protected OrderItemService $orderItemService;

    public function __construct(OrderItemService $orderItemService)
    {
        $this->orderItemService = $orderItemService;
    }

    public function order(OrderItem $orderItem): JsonResponse
    {
        $order = $this->orderItemService->getOrder($orderItem);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function menuItem(OrderItem $orderItem): JsonResponse
    {
        $menuItem = $this->orderItemService->getMenuItem($orderItem);

        return response()->json([
            'success' => true,
            'data' => $menuItem,
        ]);
    }
}
