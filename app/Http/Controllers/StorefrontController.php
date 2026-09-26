<?php

namespace App\Http\Controllers;

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
}
