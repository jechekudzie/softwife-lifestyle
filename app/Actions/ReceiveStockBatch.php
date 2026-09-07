<?php

namespace App\Actions;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockBatch;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Receives a delivery of stock.
 *
 * Stock is added rather than set, and every piece received is written to the
 * ledger, so the figure on a variant can always be traced back to the batch
 * that brought it in.
 */
class ReceiveStockBatch
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Product $product, array $data, ?User $user = null): StockBatch
    {
        return DB::transaction(function () use ($product, $data, $user) {
            $batch = StockBatch::create([
                'product_id' => $product->id,
                'received_by' => $user?->id,
                'reference' => $data['reference'],
                'received_on' => $data['received_on'],
                'supplier_id' => $data['supplier_id'] ?? null,
                'unit_cost_cents' => isset($data['unit_cost'])
                    ? (int) round($data['unit_cost'] * 100)
                    : null,
                'freight_cents' => (int) round(($data['freight'] ?? 0) * 100),
                'duty_cents' => (int) round(($data['duty'] ?? 0) * 100),
                'other_cost_cents' => (int) round(($data['other_cost'] ?? 0) * 100),
                'currency' => config('shop.currency'),
                'note' => $data['note'] ?? null,
            ]);

            foreach ($data['quantities'] as $variantId => $quantity) {
                if ($quantity < 1) {
                    continue;
                }

                $variant = ProductVariant::where('product_id', $product->id)
                    ->whereKey($variantId)
                    ->lockForUpdate()
                    ->first();

                if (! $variant) {
                    continue;
                }

                $variant->increment('stock', $quantity);

                StockMovement::create([
                    'product_variant_id' => $variant->id,
                    'stock_batch_id' => $batch->id,
                    'user_id' => $user?->id,
                    'quantity' => $quantity,
                    'reason' => StockMovement::REASON_BATCH,
                ]);
            }

            return $batch;
        });
    }
}
