<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect('/admin'));
Route::get('/sitemap.xml', [SitemapController::class, 'sitemap']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);
Route::get('/llms.txt', [SitemapController::class, 'llms']);
Route::get('/orders/{orderNumber}/proof', [App\Http\Controllers\Api\V1\OrderController::class, 'serveProof'])
    ->middleware('auth:sanctum')
    ->name('orders.proof');
