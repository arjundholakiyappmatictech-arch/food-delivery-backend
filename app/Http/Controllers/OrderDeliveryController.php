<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderDeliveryRequest;
use App\Http\Resources\OrderDeliveryResource;
use App\Models\Order;
use App\Services\OrderDeliveryService;
use Illuminate\Http\JsonResponse;

class OrderDeliveryController extends Controller
{
    protected OrderDeliveryService $deliveryService;

    public function __construct(OrderDeliveryService $deliveryService)
    {
        $this->deliveryService = $deliveryService;
    }

    public function index(): JsonResponse
    {
        $deliveries = $this->deliveryService->index();

        return $this->successResponse(
            'Deliveries Fetched Successfully',
            OrderDeliveryResource::collection($deliveries),
            200,
            $this->pagination($deliveries),
        );
    }

    public function store(StoreOrderDeliveryRequest $request, Order $order): JsonResponse
    {
        $delivery = $this->deliveryService->assignDelivery($order, $request->validated());

        return $this->successResponse('Deliveries Assigned Successfully', new OrderDeliveryResource($delivery), 201);
    }
}
