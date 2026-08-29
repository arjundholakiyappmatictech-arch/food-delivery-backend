<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCartRequest;
use App\Http\Requests\UpdateCartRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Services\CartService;
use Exception;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService) {}

    public function index(): JsonResponse
    {
        $carts = $this->cartService->index();

        return $this->successResponse('Carts Fetched Successfully', CartResource::collection($carts), 200);
    }

    public function store(StoreCartRequest $request): JsonResponse
    {
        try {
            $cart = $this->cartService->store($request->validated());

            return $this->successResponse('Item added to cart successfully', new CartResource($cart), 201);
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }

    public function update(UpdateCartRequest $request, Cart $cart): JsonResponse
    {
        $cart = $this->cartService->update($cart, $request->validated());

        return $this->successResponse('Cart updated successfully', new CartResource($cart));
    }

    public function destroy(Cart $cart): JsonResponse
    {
        $this->cartService->destroy($cart);

        return $this->successResponse('Cart item removed successfully');
    }

    public function clear(): JsonResponse
    {
        $this->cartService->clearCart();

        return $this->successResponse('Cart cleared successfully');
    }
}
