<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockBatch extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'received_on' => 'date',
            'unit_cost_cents' => 'integer',
            'freight_cents' => 'integer',
            'duty_cents' => 'integer',
            'other_cost_cents' => 'integer',
        ];
    }

    /**
     * What one piece from this batch actually cost, landed: its invoice price
     * plus its share of the freight, duty and anything else the batch carried.
     *
     * Returns null when the batch has no cost recorded, so a missing figure
     * reads as unknown rather than as free.
     */
    public function landedUnitCostCents(): ?int
    {
        $units = $this->totalReceived();

        if ($units < 1) {
            return null;
        }

        $extras = $this->freight_cents + $this->duty_cents + $this->other_cost_cents;

        if ($this->unit_cost_cents === null && $extras === 0) {
            return null;
        }

        return (int) round(
            ($this->unit_cost_cents ?? 0) + $extras / $units
        );
    }

    public function landedTotalCents(): ?int
    {
        $unit = $this->landedUnitCostCents();

        return $unit === null ? null : $unit * $this->totalReceived();
    }

    /** @return BelongsTo<Supplier, $this> */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** @return BelongsTo<User, $this> */
    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /** @return HasMany<StockMovement, $this> */
    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function totalReceived(): int
    {
        return (int) $this->movements()->sum('quantity');
    }
}
