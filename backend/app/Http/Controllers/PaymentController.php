<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Services\PaymentService;
use Exception;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    public function store(StorePaymentRequest $request, Order $order): JsonResponse
    {
        try {
            $payment = $this->paymentService->makePayment($order, $request->validated());

            return $this->successResponse('Payment created successfully.', new PaymentResource($payment), 201);
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }
}
