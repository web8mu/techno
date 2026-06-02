<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\CmsController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\NewsletterController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ReviewController;
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
        Route::put('items/{cartItem}', [CartController::class, 'updateItem']);
        Route::delete('items/{cartItem}', [CartController::class, 'removeItem']);
        Route::delete('/', [CartController::class, 'clear']);
        Route::post('coupon', [CartController::class, 'applyCoupon']);
        Route::delete('coupon', [CartController::class, 'removeCoupon']);
        Route::post('merge', [CartController::class, 'mergeGuestCart']);
    });

    // Checkout - 5 req/min
    Route::middleware('throttle:5,1')->post('checkout', [CheckoutController::class, 'placeOrder']);

    // Orders
    Route::prefix('orders')->group(function () {
        Route::get('{orderNumber}', [OrderController::class, 'show']);
        Route::middleware('auth:sanctum')->post('{orderNumber}/proof', [OrderController::class, 'uploadProof'])->middleware('throttle:10,1');
        Route::middleware('auth:sanctum')->get('/', [OrderController::class, 'index']);
    });

    // Dashboard (authenticated customer) - all scoped to auth user
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('me')->group(function () {
        Route::get('/', [DashboardController::class, 'profile'])->name('me');
        Route::patch('/', [DashboardController::class, 'updateProfile']);
        Route::post('password', [DashboardController::class, 'changePassword']);
        Route::get('orders', [DashboardController::class, 'orders']);
        Route::get('orders/{orderNumber}', [DashboardController::class, 'order']);
        Route::get('orders/{orderNumber}/invoice', [DashboardController::class, 'downloadInvoice']);
        Route::post('orders/{orderNumber}/reorder', [DashboardController::class, 'reorder']);
        Route::get('addresses', [DashboardController::class, 'addresses']);
        Route::post('addresses', [DashboardController::class, 'storeAddress']);
        Route::put('addresses/{address}', [DashboardController::class, 'updateAddress']);
        Route::delete('addresses/{address}', [DashboardController::class, 'deleteAddress']);
    });

    // Reviews
    Route::get('products/{slug}/reviews', [ReviewController::class, 'index'])->middleware('throttle:60,1');
    Route::middleware(['auth:sanctum', 'throttle:5,1'])->post('products/{slug}/reviews', [ReviewController::class, 'store']);

    // Newsletter
    Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:5,1');
    Route::get('newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe']);

    // CMS
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('cms/homepage', [CmsController::class, 'homepageData']);
        Route::get('cms/pages/{slug}', [CmsController::class, 'page']);
        Route::get('cms/services', [CmsController::class, 'services']);
        Route::get('cms/faqs', [CmsController::class, 'faqs']);
        Route::post('cms/contact', [CmsController::class, 'contact'])->middleware('throttle:3,1');
    });
});
