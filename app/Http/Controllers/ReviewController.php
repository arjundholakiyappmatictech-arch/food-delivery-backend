<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\OrderReview;
use App\Services\ReviewService;
use Exception;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    protected ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    public function index(): JsonResponse
    {
        $reviews = $this->reviewService->index();

        return $this->successResponse(
            'Reviews Fetched Successfully',
            ReviewResource::collection($reviews),
            200,
            $this->pagination($reviews),
        );
    }

    public function store(StoreOrderReviewRequest $request, Order $order): JsonResponse
    {
        try {
            $review = $this->reviewService->store($order, $request->validated());

            return $this->successResponse('Reviews Added Successfully', new ReviewResource($review));
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }

    public function destroy(OrderReview $review): JsonResponse
    {
        $this->reviewService->destroy($review);

        return $this->successResponse('Reviews Deleted Successfully', new ReviewResource($review));
    }
}
