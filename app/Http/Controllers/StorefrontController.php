<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Support\Catalogue;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function home(?string $hero = null): Response
    {
        return Inertia::render('home', [
            'hero' => $hero,
            'lines' => Catalogue::lines(),
            'categories' => Catalogue::categories(),
        ]);
    }

    public function shop(): Response
    {
        return Inertia::render('shop/index', [
            'lines' => Catalogue::lines(),
            'categories' => Catalogue::categories(),
        ]);
    }

    public function product(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        return Inertia::render('shop/show', [
            'line' => Catalogue::line($product),
            'related' => Catalogue::lines()
                ->reject(fn (array $line) => $line['slug'] === $product->slug)
                ->take(3)
                ->values(),
        ]);
    }
}
