<?php

namespace App\Http\Controllers;

use App\Exceptions\carts\MenuItemUnavailableException;
use App\Exceptions\carts\RestaurantClosedException;
use App\Http\Requests\StoreCartRequest;
use App\Http\Requests\UpdateCartRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use Illuminate\Http\JsonResponse;
use App\Services\CartService;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService) {}

    public function index(): JsonResponse
    {
        $carts = $this->cartService->index();

        return $this->successResponse(
            'Carts Fetched Successfully',
            CartResource::collection($carts),
            200,
            $this->pagination($carts),
        );
    }

    public function store(StoreCartRequest $request): JsonResponse
    {
        try {
            $cart = $this->cartService->store($request->validated());
            return $this->successResponse('Item added to cart successfully', new CartResource($cart), 201);
        } catch (MenuItemUnavailableException | RestaurantClosedException $exception) {
            return $this->errorResponse($exception->getMessage(), null, 409);
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
}
