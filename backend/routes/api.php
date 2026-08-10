<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderDeliveryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

// auth routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// address routes
Route::middleware('auth:sanctum')
    ->controller(AddressController::class)
    ->group(function () {
        Route::get('addresses', 'index');
        Route::post('addresses/store', 'store');
        Route::put('addresses/{address}/update', 'update');
        Route::delete('addresses/{address}/destroy', 'destroy');
    });

// restaurant routes
Route::middleware('auth:sanctum')
    ->controller(RestaurantController::class)
    ->group(function () {
        Route::post('restaurants/store', 'store');
        Route::get('restaurants/nearby', 'nearby');
        Route::get('restaurants/{restaurant}/menus', 'menus');
    });

// menu routes
Route::post('menus/store', [MenuController::class, 'store'])->middleware('auth:sanctum');

// menuItem routes
Route::post('menu-items/store', [MenuItemController::class, 'store'])->middleware('auth:sanctum');

// cart routes
Route::middleware('auth:sanctum')
    ->controller(CartController::class)
    ->group(function () {
        Route::get('cart', 'index');
        Route::post('carts/store', 'store');
        Route::put('carts/{cart}/update', 'update');
        Route::delete('carts/{cart}/destroy', 'destroy');
        Route::delete('cart', 'clear');
    });

// order routes
Route::middleware('auth:sanctum')
    ->controller(OrderController::class)
    ->group(function () {
        Route::get('orders', 'index');
        Route::get('orders/{order}', 'show');
        Route::post('orders/store', 'store');
        Route::get('orders/{order}/invoice', 'generateInvoice');
        Route::patch('orders/{order}/cancel', 'cancel');
    });

// payment routes
Route::post('orders/{order}/payment', [PaymentController::class, 'store'])->middleware('auth:sanctum');

// delivery routes
Route::middleware('auth:sanctum')
    ->controller(OrderDeliveryController::class)
    ->group(function () {
        Route::get('deliveries', 'index');
        Route::post('orders/{order}/delivery', 'store');
        Route::patch('deliveries/{delivery}/pickup', 'makeOutForDelivery');
        Route::patch('deliveries/{delivery}/delivered', 'markDelivered');
    });

// review routes
Route::middleware('auth:sanctum')
    ->controller(ReviewController::class)
    ->group(function () {
        Route::get('reviews', 'index');
        Route::post('orders/{order}/reviews', 'store');
        Route::delete('reviews/{review}/destroy', 'destroy');
    });
