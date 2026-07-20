<?php

namespace App\Http\Controllers;

use App\Http\Requests\PlaceOrderRequest;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Exception;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    public function index(): JsonResponse
    {
        $orders = $this->orderService->index();

        return $this->successResponse(
            'Orders fetched successfully',
            OrderResource::collection($orders),
            200,
            $this->pagination($orders),
        );
    }

    public function store(PlaceOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->orderService->store($request->validated());

            return $this->successResponse('Order placed successfully', new OrderResource($order), 201);
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }

    public function show(Order $order): JsonResponse
    {
        $order = $this->orderService->show($order);

        /* dd($order->relationsToArray()); */

        return $this->successResponse('Order fetched successfully.', new OrderResource($order));
    }

    public function generateInvoice(Order $order): JsonResponse
    {
        $invoice = $this->orderService->generateInvoice($order);

        return $this->successResponse('Invoice generated successfully', new InvoiceResource($invoice));
    }

    public function cancel(Order $order): JsonResponse
    {
        try {
            $order = $this->orderService->cancel($order);

            return $this->successResponse('Order cancelled successfully', new OrderResource($order));
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }
}
