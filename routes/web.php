<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\FulfilmentController;
use App\Http\Controllers\Admin\OrderController as AdminOrders;
use App\Http\Controllers\Admin\ProductController as AdminProducts;
use App\Http\Controllers\Web\CheckoutController;
use App\Http\Controllers\Web\OrderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home')->name('home');
Route::inertia('shop', 'shop/index')->name('shop');
Route::inertia('cart', 'cart')->name('cart');
Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout');
Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');

/*
 * Hero treatment previews, so the visual direction can be compared live.
 * Remove once a direction is chosen.
 */
foreach (['rose', 'wine', 'brown', 'plum', 'pale', 'photo'] as $variant) {
    Route::inertia("preview/{$variant}", 'home', ['variant' => $variant])
        ->name("preview.{$variant}");
}

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', AdminDashboard::class)->name('dashboard');

        Route::get('products', [AdminProducts::class, 'index'])->name('products.index');
        Route::get('products/{product}', [AdminProducts::class, 'edit'])->name('products.edit');
        Route::put('products/{product}', [AdminProducts::class, 'update'])->name('products.update');
        Route::put('products/{product}/stock', [AdminProducts::class, 'updateStock'])->name('products.stock');

        Route::get('orders', [AdminOrders::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [AdminOrders::class, 'show'])->name('orders.show');
        Route::put('orders/{order}', [AdminOrders::class, 'update'])->name('orders.update');

        Route::get('fulfilment', [FulfilmentController::class, 'edit'])->name('fulfilment.edit');
        Route::put('fulfilment', [FulfilmentController::class, 'update'])->name('fulfilment.update');
    });

require __DIR__.'/settings.php';
