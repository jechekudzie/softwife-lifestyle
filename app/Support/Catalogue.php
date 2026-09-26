<?php

namespace App\Support;

use App\Models\Category;
use App\Models\Colourway;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Collection;

/**
 * The catalogue, shaped for the storefront.
 *
 * The shop used to read a hand-written array in the front end while the admin
 * wrote to the database, so the two drifted apart every time either changed.
 * This is the single source: it reads what the admin manages and returns it in
 * the shape the React components already expect.
 */
class Catalogue
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public static function lines(): Collection
    {
        return Product::query()
            ->with([
                'colourways:id,name,cloth,ink',
                'images.colourway:id,name',
            ])
            ->active()
            ->get()
            ->map(fn (Product $product) => self::shape($product));
    }

    /**
     * @return array<string, mixed>
     */
    private static function shape(Product $product): array
    {
        return [
            'slug' => $product->slug,
            'name' => $product->name,
            'era' => $product->era,
            'phrase' => $product->phrase,
            'affirmation' => $product->affirmation,
            'hero' => $product->hero_image,
            'ground' => $product->hero_ground,
            'photo' => $product->card_image,
            'images' => self::framesFor($product),
            'pictured' => $product->pictured_label,
            'field' => $product->field_colour,
            'colourways' => $product->colourways
                ->map(fn (Colourway $colourway) => [
                    'name' => $colourway->name,
                    'cloth' => $colourway->cloth,
                    'ink' => $colourway->ink,
                ])
                ->values(),
            'price' => $product->price_cents / 100,
            'wasPrice' => $product->compare_at_cents
                ? $product->compare_at_cents / 100
                : null,
            'badge' => $product->badge,
        ];
    }

    /**
     * The photographs of a product.
     *
     * Where a gallery exists the admin owns it entirely, order and tagging
     * alike. Where it does not, the card shot stands alone rather than the
     * card rendering nothing.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function framesFor(Product $product): array
    {
        if ($product->images->isEmpty()) {
            return $product->card_image
                ? [['src' => $product->card_image, 'colourway' => null, 'alt' => null]]
                : [];
        }

        return $product->images
            ->map(fn (ProductImage $image) => [
                'src' => $image->path,
                'colourway' => $image->colourway?->name,
                'alt' => $image->alt,
            ])
            ->values()
            ->all();
    }

    /** One line, shaped exactly as it appears in a listing. */
    public static function line(Product $product): array
    {
        $product->load(['colourways:id,name,cloth,ink', 'images.colourway:id,name']);

        return self::shape($product);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public static function categories(): Collection
    {
        return Category::orderBy('position')
            ->get()
            ->map(fn (Category $category) => [
                'name' => $category->name,
                'blurb' => $category->blurb,
                'silhouette' => $category->silhouette,
                'available' => (bool) $category->is_available,
            ]);
    }
}
