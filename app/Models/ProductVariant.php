<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'price_cents' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<Colourway, $this> */
    public function colourway(): BelongsTo
    {
        return $this->belongsTo(Colourway::class);
    }

    /** @param Builder<ProductVariant> $query */
    public function scopeAvailable(Builder $query): void
    {
        $query->where('is_active', true)->where('stock', '>', 0);
    }

    /** Falls back to the product price when the variant does not override it. */
    public function priceCents(): int
    {
        return $this->price_cents ?? $this->product->price_cents;
    }
}
