<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WithdrawalController;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return response()->json(['message' => 'STUMA Backend API is running. Please access endpoints under /api.']);
});

Route::prefix('api')->group(function () {
    // Products Catalog
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Orders & Checkout
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{id}/resolve', [OrderController::class, 'resolveAnomaly']);

    // Blockchain Webhook (Chainstack RPC integration)
    Route::post('/webhooks/blockchain', [OrderController::class, 'blockchainWebhook']);

    // Withdrawals & Batching
    Route::get('/withdrawals', [WithdrawalController::class, 'index']);
    Route::post('/withdrawals', [WithdrawalController::class, 'store']);

    // Merchant Dashboard Analytics
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

