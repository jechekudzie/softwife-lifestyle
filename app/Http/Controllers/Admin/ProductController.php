<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/products/index', [
            'products' => Product::with('category:id,name')
                ->withSum('variants as stock_total', 'stock')
                ->orderBy('position')
                ->get()
                ->map(fn (Product $product) => [
                    'slug' => $product->slug,
                    'name' => $product->name,
                    'category' => $product->category->name,
                    'price' => $product->price_cents / 100,
                    'compareAt' => $product->compare_at_cents
                        ? $product->compare_at_cents / 100
                        : null,
                    'badge' => $product->badge,
                    'isActive' => $product->is_active,
                    'image' => $product->card_image,
                    'stock' => (int) ($product->stock_total ?? 0),
                ]),
        ]);
    }

    public function edit(Product $product): Response
    {
        $product->load('colourways');

        return Inertia::render('admin/products/edit', [
            'product' => [
                'slug' => $product->slug,
                'name' => $product->name,
                'categoryId' => $product->category_id,
                'era' => $product->era,
                'phrase' => $product->phrase,
                'affirmation' => $product->affirmation,
                'price' => $product->price_cents / 100,
                'compareAt' => $product->compare_at_cents
                    ? $product->compare_at_cents / 100
                    : null,
                'badge' => $product->badge,
                'heroImage' => $product->hero_image,
                'heroGround' => $product->hero_ground,
                'cardImage' => $product->card_image,
                'picturedLabel' => $product->pictured_label,
                'isActive' => $product->is_active,
            ],
            'categories' => Category::orderBy('position')->get(['id', 'name']),
            'variants' => ProductVariant::with('colourway:id,name')
                ->where('product_id', $product->id)
                ->get()
                ->sortBy([['colourway.name', 'asc'], ['size', 'asc']])
                ->values()
                ->map(fn (ProductVariant $variant) => [
                    'id' => $variant->id,
                    'colourway' => $variant->colourway->name,
                    'size' => $variant->size,
                    'sku' => $variant->sku,
                    'stock' => $variant->stock,
                    'isActive' => $variant->is_active,
                ]),
            'grounds' => ['wine', 'rose', 'brown', 'plum', 'pale'],
            'allColourways' => Colourway::orderBy('position')->get(['id', 'name']),
            'selectedColourways' => $product->colourways->pluck('id'),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category_id' => ['required', 'exists:categories,id'],
            'era' => ['required', 'string', 'max:40'],
            'phrase' => ['required', 'string', 'max:120'],
            'affirmation' => ['required', 'string', 'max:600'],
            'price' => ['required', 'numeric', 'min:0', 'max:100000'],
            'compare_at' => ['nullable', 'numeric', 'min:0', 'max:100000', 'gt:price'],
            'badge' => ['nullable', 'string', 'max:40'],
            'hero_image' => ['nullable', 'string', 'max:255'],
            'hero_ground' => ['required', 'in:wine,rose,brown,plum,pale'],
            'card_image' => ['nullable', 'string', 'max:255'],
            'pictured_label' => ['nullable', 'string', 'max:80'],
            'is_active' => ['required', 'boolean'],
            'colourways' => ['array'],
            'colourways.*' => ['exists:colourways,id'],
        ]);

        $product->update([
            'name' => $data['name'],
            'category_id' => $data['category_id'],
            'era' => $data['era'],
            'phrase' => $data['phrase'],
            'affirmation' => $data['affirmation'],
            'price_cents' => (int) round($data['price'] * 100),
            'compare_at_cents' => isset($data['compare_at'])
                ? (int) round($data['compare_at'] * 100)
                : null,
            'badge' => $data['badge'] ?? null,
            'hero_image' => $data['hero_image'] ?? null,
            'hero_ground' => $data['hero_ground'],
            'card_image' => $data['card_image'] ?? null,
            'pictured_label' => $data['pictured_label'] ?? null,
            'is_active' => $data['is_active'],
        ]);

        if (isset($data['colourways'])) {
            $product->colourways()->sync(
                collect($data['colourways'])
                    ->mapWithKeys(fn ($id, $index) => [$id => ['position' => $index]])
                    ->all(),
            );
        }

        return back()->with('success', "{$product->name} saved.");
    }

    /** Stock is edited in bulk, because that is how a stock take happens. */
    public function updateStock(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'variants' => ['required', 'array'],
            'variants.*.id' => ['required', 'integer'],
            'variants.*.stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'variants.*.is_active' => ['required', 'boolean'],
        ]);

        foreach ($data['variants'] as $row) {
            ProductVariant::where('product_id', $product->id)
                ->whereKey($row['id'])
                ->update([
                    'stock' => $row['stock'],
                    'is_active' => $row['is_active'],
                ]);
        }

        return back()->with('success', 'Stock updated.');
    }
}
