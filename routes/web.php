<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home')->name('home');
Route::inertia('shop', 'shop/index')->name('shop');
Route::inertia('cart', 'cart')->name('cart');

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
