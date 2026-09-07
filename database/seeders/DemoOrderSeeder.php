<?php

namespace Database\Seeders;

use App\Models\CollectionPoint;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\ProductVariant;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Orders across the last ninety days, so the admin and its charts have
 * something to show before real ones arrive.
 *
 * Never run this in production: it invents customers and moves stock.
 */
class DemoOrderSeeder extends Seeder
{
    private const NAMES = [
        'Tendai Moyo', 'Naledi Khumalo', 'Chiedza Rusike', 'Rutendo Chirwa',
        'Anesu Mhlanga', 'Farai Ncube', 'Tariro Banda', 'Nyasha Dube',
        'Vimbai Sibanda', 'Kudzai Mutasa', 'Rumbidzai Zhou', 'Shamiso Marufu',
    ];

    private const CUSTOMS = [
        'I attract, I do not chase.',
        'Softness is my whole strategy.',
        'God already wrote the best plot twist.',
        'I am becoming her, slowly and on purpose.',
    ];

    private const STATUSES = ['pending', 'printing', 'ready', 'shipped', 'collected'];

    public function run(): void
    {
        if (app()->isProduction()) {
            $this->command?->warn('DemoOrderSeeder skipped in production.');

            return;
        }

        $variants = ProductVariant::with('product', 'colourway')->get();
        $zones = DeliveryZone::active()->get();
        $point = CollectionPoint::active()->first();

        if ($variants->isEmpty() || $zones->isEmpty()) {
            $this->command?->warn('Seed the catalogue first.');

            return;
        }

        $customFee = (int) config('shop.custom_affirmation_fee_cents');
        $freeFrom = (int) config('shop.free_delivery_from_cents');

        foreach (range(0, 89) as $daysAgo) {
            // Weekends sell better, and the recent weeks sell better than the old ones.
            $date = Carbon::today()->subDays($daysAgo);
            $weekendLift = $date->isWeekend() ? 2 : 0;
            $recencyLift = $daysAgo < 30 ? 1 : 0;
            $count = max(0, random_int(-1, 2) + $weekendLift + $recencyLift);

            foreach (range(1, max($count, 1)) as $ignored) {
                if ($count === 0) {
                    continue;
                }

                $this->makeOrder($date, $variants, $zones, $point, $customFee, $freeFrom);
            }
        }

        $this->command?->info('Demo orders seeded: '.Order::count());
    }

    /**
     * @param  Collection<int, ProductVariant>  $variants
     * @param  Collection<int, DeliveryZone>  $zones
     */
    private function makeOrder(
        CarbonInterface $date,
        $variants,
        $zones,
        ?CollectionPoint $point,
        int $customFee,
        int $freeFrom,
    ): void {
        $delivery = random_int(1, 10) > 3;
        $zone = $zones->random();
        $placedAt = $date->copy()->addHours(random_int(8, 20))->addMinutes(random_int(0, 59));

        $lines = [];
        $subtotal = 0;

        foreach ($variants->random(random_int(1, 3)) as $variant) {
            $quantity = random_int(1, 2);
            $custom = random_int(1, 10) > 7 ? self::CUSTOMS[array_rand(self::CUSTOMS)] : null;
            $lineCustomFee = $custom ? $customFee : 0;
            $unit = $variant->priceCents() + $lineCustomFee;
            $total = $unit * $quantity;
            $subtotal += $total;

            $variant->decrement('stock', min($quantity, $variant->stock));

            $lines[] = [
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'name' => $variant->product->name,
                'colourway' => $variant->colourway->name,
                'size' => $variant->size,
                'sku' => $variant->sku,
                'custom_affirmation' => $custom,
                'custom_fee_cents' => $lineCustomFee,
                'unit_price_cents' => $unit,
                'quantity' => $quantity,
                'total_cents' => $total,
            ];
        }

        $fee = $delivery && $subtotal < $freeFrom ? $zone->fee_cents : 0;
        $name = self::NAMES[array_rand(self::NAMES)];

        $order = Order::create([
            'reference' => Order::newReference(),
            'status' => self::STATUSES[array_rand(self::STATUSES)],
            'customer_name' => $name,
            'email' => str($name)->slug('.')->append('@example.com')->toString(),
            'phone' => '+2637'.random_int(10000000, 99999999),
            'fulfilment_method' => $delivery ? 'delivery' : 'collection',
            'delivery_zone_id' => $delivery ? $zone->id : null,
            'collection_point_id' => $delivery ? null : $point?->id,
            'address_line' => $delivery ? random_int(1, 90).' Josiah Chinamano Ave' : null,
            'suburb' => $delivery ? 'Avondale' : null,
            'city' => $delivery ? 'Harare' : null,
            'subtotal_cents' => $subtotal,
            'delivery_fee_cents' => $fee,
            'total_cents' => $subtotal + $fee,
            'currency' => config('shop.currency'),
            'payment_method' => 'ecocash',
            'payment_status' => random_int(1, 10) > 3 ? 'paid' : 'unpaid',
            'placed_at' => $placedAt,
            'created_at' => $placedAt,
            'updated_at' => $placedAt,
        ]);

        $order->items()->createMany($lines);
    }
}
