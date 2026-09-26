<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductImageController extends Controller
{
    /**
     * Files land in `public/media/products`, alongside the shoot images the
     * site already serves, so a gallery photograph and an editorial one are
     * fetched the same way and neither needs the storage symlink.
     */
    private const DIRECTORY = 'media/products';

    public function store(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'images' => ['required', 'array', 'max:12'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'colourway_id' => ['nullable', Rule::exists('colourways', 'id')],
            'alt' => ['nullable', 'string', 'max:160'],
        ]);

        $position = (int) $product->images()->max('position');

        foreach ($data['images'] as $file) {
            $name = Str::slug($product->slug.'-'.Str::random(6)).'.'.$file->extension();
            $file->move(public_path(self::DIRECTORY), $name);

            $product->images()->create([
                'colourway_id' => $data['colourway_id'] ?? null,
                'path' => '/'.self::DIRECTORY.'/'.$name,
                'alt' => $data['alt'] ?? null,
                'position' => ++$position,
            ]);
        }

        return back()->with('success', count($data['images']).' added to the gallery.');
    }

    public function update(Request $request, Product $product, ProductImage $image): RedirectResponse
    {
        abort_unless($image->product_id === $product->id, 404);

        $data = $request->validate([
            'colourway_id' => ['nullable', Rule::exists('colourways', 'id')],
            'alt' => ['nullable', 'string', 'max:160'],
            'position' => ['required', 'integer', 'min:0', 'max:999'],
        ]);

        $image->update($data);

        return back()->with('success', 'Gallery updated.');
    }

    public function destroy(Product $product, ProductImage $image): RedirectResponse
    {
        abort_unless($image->product_id === $product->id, 404);

        /**
         * Only files this app wrote are removed. A path pointing at a shoot
         * image the catalogue also uses must survive losing its gallery row.
         */
        if (Str::startsWith($image->path, '/'.self::DIRECTORY.'/')) {
            @unlink(public_path(ltrim($image->path, '/')));
        }

        $image->delete();

        return back()->with('success', 'Removed from the gallery.');
    }
}
