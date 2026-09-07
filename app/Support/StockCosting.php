<?php

namespace App\Support;

use App\Models\ProductVariant;
use App\Models\StockMovement;

/**
 * What a piece costs us.
 *
 * Batches land at different prices, so a sale is costed at the weighted
 * average landed cost of the stock on hand when it is sold, and that figure is
 * written onto the sale. Snapshotting matters: a later, dearer batch must
 * never reach back and rewrite the margin on something already sold.
 *
 * This is average costing, not FIFO. For a small apparel run the two differ
 * little, and the average survives a stock take where lot tracking does not.
 */
class StockCosting
{
    /**
     * The weighted average landed cost of everything received for this variant
     * so far, or null when no batch has recorded a cost.
     */
    public function averageCostCents(ProductVariant $variant): ?int
    {
        $received = StockMovement::query()
            ->with('batch')
            ->where('product_variant_id', $variant->id)
            ->where('reason', StockMovement::REASON_BATCH)
            ->get();

        $units = 0;
        $cost = 0;

        foreach ($received as $movement) {
            $unitCost = $movement->batch?->landedUnitCostCents();

            if ($unitCost === null) {
                continue;
            }

            $units += $movement->quantity;
            $cost += $unitCost * $movement->quantity;
        }

        return $units > 0 ? (int) round($cost / $units) : null;
    }
}
