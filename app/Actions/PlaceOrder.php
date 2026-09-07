<?php

namespace App\Actions;

use App\Models\CollectionPoint;
use App\Models\Colourway;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Support\StockCosting;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Turns a validated basket into an order.
 *
 * Prices, fees and totals are recomputed from the database. Nothing the
 * browser sends about money is trusted, and stock is checked and decremented
 * inside the same transaction so two shoppers cannot claim the last piece.
 */
class PlaceOrder
{
    public function __construct(private StockCosting $costing) {}

    /**
     * @param  array{
     *     customer_name: string, email: string, phone: string,
     *     fulfilment_method: string, delivery_zone?: ?string, collection_point?: ?string,
     *     address_line?: ?string, suburb?: ?string, city?: ?string, notes?: ?string,
     *     payment_method?: ?string,
     *     items: array<int, array{product: string, colourway: string, size: string, quantity: int, custom?: ?string}>
     * }  $data
     */
    public function handle(array $data): Order
    {
        $customFee = (int) config('shop.custom_affirmation_fee_cents');

        return DB::transaction(function () use ($data, $customFee) {
            $lines = [];
            $movements = [];
            $subtotal = 0;

            foreach ($data['items'] as $index => $row) {
                $product = Product::active()->where('slug', $row['product'])->firstOrFail();
                $colourway = Colourway::where('name', $row['colourway'])->firstOrFail();

                $variant = ProductVariant::where('product_id', $product->id)
                    ->where('colourway_id', $colourway->id)
                    ->where('size', $row['size'])
                    ->lockForUpdate()
                    ->first();

                if (! $variant || ! $variant->is_active) {
                    throw ValidationException::withMessages([
                        "items.{$index}" => "{$product->name} is not available in {$colourway->name}, size {$row['size']}.",
                    ]);
                }

                if ($variant->stock < $row['quantity']) {
                    throw ValidationException::withMessages([
                        "items.{$index}" => $variant->stock === 0
                            ? "{$product->name} in {$colourway->name}, size {$row['size']} has sold out."
                            : "Only {$variant->stock} left of {$product->name} in {$colourway->name}, size {$row['size']}.",
                    ]);
                }

                $custom = isset($row['custom']) && $row['custom'] !== null
                    ? trim($row['custom'])
                    : null;

                $lineCustomFee = $custom ? $customFee : 0;
                $unit = $variant->priceCents() + $lineCustomFee;
                $total = $unit * $row['quantity'];
                $subtotal += $total;

                $variant->decrement('stock', $row['quantity']);
                $movements[] = [
                    'variant_id' => $variant->id,
                    'quantity' => -$row['quantity'],
                    // Snapshotted now, so a later batch never rewrites margin.
                    'unit_cost_cents' => $this->costing->averageCostCents($variant),
                ];

                $lines[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'name' => $product->name,
                    'colourway' => $colourway->name,
                    'size' => $variant->size,
                    'sku' => $variant->sku,
                    'custom_affirmation' => $custom,
                    'custom_fee_cents' => $lineCustomFee,
                    'unit_price_cents' => $unit,
                    'quantity' => $row['quantity'],
                    'total_cents' => $total,
                ];
            }

            $zone = ($data['fulfilment_method'] === 'delivery' && ! empty($data['delivery_zone']))
                ? DeliveryZone::active()->where('slug', $data['delivery_zone'])->first()
                : null;

            $point = ($data['fulfilment_method'] === 'collection' && ! empty($data['collection_point']))
                ? CollectionPoint::active()->where('slug', $data['collection_point'])->first()
                : null;

            $deliveryFee = $this->deliveryFee($zone, $subtotal);

            $order = Order::create([
                'reference' => Order::newReference(),
                'status' => 'pending',
                'customer_name' => $data['customer_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'fulfilment_method' => $data['fulfilment_method'],
                'delivery_zone_id' => $zone?->id,
                'collection_point_id' => $point?->id,
                'address_line' => $data['address_line'] ?? null,
                'suburb' => $data['suburb'] ?? null,
                'city' => $data['city'] ?? null,
                'notes' => $data['notes'] ?? null,
                'subtotal_cents' => $subtotal,
                'delivery_fee_cents' => $deliveryFee,
                'total_cents' => $subtotal + $deliveryFee,
                'currency' => config('shop.currency'),
                'payment_method' => $data['payment_method'] ?? null,
                'payment_status' => 'unpaid',
                'placed_at' => now(),
            ]);

            $order->items()->createMany($lines);

            foreach ($movements as $movement) {
                StockMovement::create([
                    'product_variant_id' => $movement['variant_id'],
                    'order_id' => $order->id,
                    'quantity' => $movement['quantity'],
                    'unit_cost_cents' => $movement['unit_cost_cents'],
                    'reason' => StockMovement::REASON_SALE,
                ]);
            }

            return $order->load('items', 'deliveryZone', 'collectionPoint');
        });
    }

    /** Collection is free, and delivery is waived once the order is large enough. */
    private function deliveryFee(?DeliveryZone $zone, int $subtotal): int
    {
        if (! $zone) {
            return 0;
        }

        return $subtotal >= (int) config('shop.free_delivery_from_cents')
            ? 0
            : $zone->fee_cents;
    }
}
