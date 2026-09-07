<?php

namespace App\Http\Controllers\Admin;

use App\Actions\ReceiveStockBatch;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockBatch;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
            'grounds' => ['wine', 'rose', 'brown', 'plum', 'pale'],
            'sizes' => config('shop.sizes'),
            'rows' => $this->stockMatrix($product),
            'suppliers' => Supplier::active()->get(['id', 'name']),
            'batches' => $product->batches()
                ->with('receivedBy:id,name', 'supplier:id,name')
                ->withSum('movements as received', 'quantity')
                ->latest('received_on')
                ->take(8)
                ->get()
                ->map(fn (StockBatch $batch) => [
                    'id' => $batch->id,
                    'reference' => $batch->reference,
                    'receivedOn' => $batch->received_on->format('j M Y'),
                    'received' => (int) ($batch->received ?? 0),
                    'unitCost' => $batch->unit_cost_cents
                        ? $batch->unit_cost_cents / 100
                        : null,
                    'landedUnitCost' => $batch->landedUnitCostCents() !== null
                        ? $batch->landedUnitCostCents() / 100
                        : null,
                    'supplier' => $batch->supplier?->name,
                    'by' => $batch->receivedBy?->name,
                    'note' => $batch->note,
                ]),
            'allColourways' => Colourway::orderBy('position')
                ->get(['id', 'name', 'cloth', 'ink']),
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

            $this->syncVariants($product);
        }

        return back()->with('success', "{$product->name} saved.");
    }

    /**
     * Gives every offered colourway a row per size to hold stock, and retires
     * the rows for colourways no longer offered. Retiring rather than deleting
     * keeps the stock figure if the colourway comes back.
     */
    private function syncVariants(Product $product): void
    {
        $offered = $product->colourways()->pluck('colourways.id');

        foreach ($offered as $colourwayId) {
            foreach (config('shop.sizes') as $size) {
                ProductVariant::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'colourway_id' => $colourwayId,
                        'size' => $size,
                    ],
                    [
                        'sku' => Str::upper(
                            Str::slug($product->slug).'-'.$colourwayId.'-'.$size
                        ),
                        'stock' => 0,
                    ],
                );
            }
        }

        ProductVariant::where('product_id', $product->id)
            ->whereNotIn('colourway_id', $offered)
            ->update(['is_active' => false]);

        ProductVariant::where('product_id', $product->id)
            ->whereIn('colourway_id', $offered)
            ->update(['is_active' => true]);
    }

    /**
     * One row per colourway, with a cell per size. Listing every colourway and
     * size as its own row turns a six-by-six grid into thirty-six lines.
     *
     * @return array<int, array<string, mixed>>
     */
    private function stockMatrix(Product $product): array
    {
        return ProductVariant::with('colourway:id,name,cloth,ink,position')
            ->where('product_id', $product->id)
            ->get()
            ->groupBy('colourway_id')
            ->map(function ($group) {
                $colourway = $group->first()->colourway;

                return [
                    'colourwayId' => $colourway->id,
                    'name' => $colourway->name,
                    'cloth' => $colourway->cloth,
                    'ink' => $colourway->ink,
                    'position' => $colourway->position,
                    'total' => (int) $group->sum('stock'),
                    'sizes' => $group->mapWithKeys(fn (ProductVariant $variant) => [
                        $variant->size => [
                            'id' => $variant->id,
                            'stock' => $variant->stock,
                            'isActive' => $variant->is_active,
                        ],
                    ]),
                ];
            })
            ->sortBy('position')
            ->values()
            ->all();
    }

    public function receiveBatch(
        Request $request,
        Product $product,
        ReceiveStockBatch $receive,
    ): RedirectResponse {
        $data = $request->validate([
            'reference' => ['required', 'string', 'max:60'],
            'received_on' => ['required', 'date', 'before_or_equal:today'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'unit_cost' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'freight' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'duty' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'other_cost' => ['nullable', 'numeric', 'min:0', 'max:1000000'],
            'note' => ['nullable', 'string', 'max:500'],
            'quantities' => ['required', 'array'],
            'quantities.*' => ['nullable', 'integer', 'min:0', 'max:10000'],
        ]);

        if (collect($data['quantities'])->filter()->isEmpty()) {
            return back()->withErrors([
                'quantities' => 'Enter how many arrived in at least one size.',
            ]);
        }

        $batch = $receive->handle($product, $data, $request->user());

        return back()->with(
            'success',
            "Batch {$batch->reference} received: {$batch->totalReceived()} pieces added."
        );
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
            $variant = ProductVariant::where('product_id', $product->id)
                ->whereKey($row['id'])
                ->first();

            if (! $variant) {
                continue;
            }

            $difference = $row['stock'] - $variant->stock;

            $variant->update([
                'stock' => $row['stock'],
                'is_active' => $row['is_active'],
            ]);

            // A hand edit is a correction, and the ledger should say so.
            if ($difference !== 0) {
                StockMovement::create([
                    'product_variant_id' => $variant->id,
                    'user_id' => $request->user()?->id,
                    'quantity' => $difference,
                    'reason' => StockMovement::REASON_ADJUSTMENT,
                ]);
            }
        }

        return back()->with('success', 'Stock corrected.');
    }
}
