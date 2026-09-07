<?php

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

require __DIR__.'/settings.php';
