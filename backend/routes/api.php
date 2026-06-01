<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public catalog - 60 req/min
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('products', [CatalogController::class, 'products']);
        Route::get('products/{slug}', [CatalogController::class, 'product']);
        Route::get('categories', [CatalogController::class, 'categories']);
        Route::get('brands', [CatalogController::class, 'brands']);
        Route::get('settings/public', [CatalogController::class, 'publicSettings']);
    });

    // Auth - 10 req/min
    Route::middleware('throttle:10,1')->prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Cart - 30 req/min
    Route::middleware('throttle:30,1')->prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'show']);
        Route::post('items', [CartController::class, 'addItem']);
        Route::put('items/{id}', [CartController::class, 'updateItem']);
        Route::delete('items/{id}', [CartController::class, 'removeItem']);
        Route::delete('/', [CartController::class, 'clearCart']);
        Route::post('coupon', [CartController::class, 'applyCoupon']);
        Route::delete('coupon', [CartController::class, 'removeCoupon']);
        Route::middleware('auth:sanctum')->post('merge', [CartController::class, 'mergeCart']);
    });

    // Checkout - 5 req/min
    Route::middleware('throttle:5,1')->post('checkout', [CheckoutController::class, 'checkout']);

    // Orders
    Route::prefix('orders')->group(function () {
        Route::middleware('throttle:60,1')->group(function () {
            Route::get('{orderNumber}', [OrderController::class, 'lookup']);
            Route::post('{orderNumber}/proof', [OrderController::class, 'uploadProof']);
        });
        Route::middleware(['auth:sanctum', 'throttle:60,1'])->get('/', [OrderController::class, 'index']);
    });
});
