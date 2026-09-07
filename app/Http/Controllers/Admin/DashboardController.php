<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** How few is few enough to warrant a warning. */
    private const LOW_STOCK = 3;

    private const TREND_DAYS = 14;

    public function __invoke(): Response
    {
        $sold = fn () => Order::whereNot('status', 'cancelled');

        $today = (int) $sold()->whereDate('created_at', today())->sum('total_cents');
        $yesterday = (int) $sold()->whereDate('created_at', today()->subDay())->sum('total_cents');

        $thisWeek = (int) $sold()->where('created_at', '>=', today()->subDays(6))->sum('total_cents');
        $lastWeek = (int) $sold()
            ->whereBetween('created_at', [today()->subDays(13), today()->subDays(7)])
            ->sum('total_cents');

        return Inertia::render('admin/dashboard', [
            'greeting' => $this->greeting(),
            'today' => [
                'revenue' => $today / 100,
                'orders' => $sold()->whereDate('created_at', today())->count(),
                'change' => $this->change($today, $yesterday),
            ],
            'stats' => [
                'week' => $thisWeek / 100,
                'weekChange' => $this->change($thisWeek, $lastWeek),
                'pending' => Order::where('status', 'pending')->count(),
                'unpaid' => (int) $sold()->where('payment_status', 'unpaid')->sum('total_cents') / 100,
                'unpaidCount' => $sold()->where('payment_status', 'unpaid')->count(),
                'products' => Product::where('is_active', true)->count(),
                'outOfStock' => ProductVariant::where('is_active', true)->where('stock', 0)->count(),
                'onHand' => (int) ProductVariant::where('is_active', true)->sum('stock'),
            ],
            'trend' => $this->trend(),
            'topSeller' => $this->topSeller(),
            'recentOrders' => Order::latest('id')->take(6)->get()->map(fn (Order $order) => [
                'reference' => $order->reference,
                'customerName' => $order->customer_name,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'fulfilmentMethod' => $order->fulfilment_method,
                'total' => $order->total_cents / 100,
                'placedAt' => $order->created_at?->diffForHumans(short: true),
            ]),
            'lowStock' => ProductVariant::with('product:id,name', 'colourway:id,name,cloth')
                ->where('is_active', true)
                ->where('stock', '<=', self::LOW_STOCK)
                ->orderBy('stock')
                ->take(6)
                ->get()
                ->map(fn (ProductVariant $variant) => [
                    'id' => $variant->id,
                    'slug' => $variant->product->slug ?? null,
                    'product' => $variant->product->name,
                    'colourway' => $variant->colourway->name,
                    'cloth' => $variant->colourway->cloth,
                    'size' => $variant->size,
                    'stock' => $variant->stock,
                ]),
        ]);
    }

    private function greeting(): string
    {
        $hour = (int) now()->format('G');

        return match (true) {
            $hour < 12 => 'Good morning',
            $hour < 17 => 'Good afternoon',
            default => 'Good evening',
        };
    }

    /** Null when there is nothing to compare against, rather than a false zero. */
    private function change(int $now, int $before): ?int
    {
        return $before > 0 ? (int) round(($now - $before) / $before * 100) : null;
    }

    /**
     * @return array<int, array{date: string, label: string, revenue: float, orders: int}>
     */
    private function trend(): array
    {
        $from = today()->subDays(self::TREND_DAYS - 1);

        $byDay = Order::whereNot('status', 'cancelled')
            ->where('created_at', '>=', $from)
            ->get(['created_at', 'total_cents'])
            ->groupBy(fn (Order $order) => $order->created_at->toDateString());

        return collect(range(0, self::TREND_DAYS - 1))
            ->map(function (int $offset) use ($from, $byDay) {
                $date = $from->addDays($offset);
                $orders = $byDay->get($date->toDateString(), collect());

                return [
                    'date' => $date->toDateString(),
                    'label' => $date->format('j M'),
                    'revenue' => $orders->sum('total_cents') / 100,
                    'orders' => $orders->count(),
                ];
            })
            ->all();
    }

    /**
     * @return array{name: string, units: int, revenue: float}|null
     */
    private function topSeller(): ?array
    {
        $row = OrderItem::whereHas(
            'order',
            fn ($query) => $query->whereNot('status', 'cancelled')
                ->where('created_at', '>=', today()->subDays(29))
        )
            ->selectRaw('name, sum(quantity) as units, sum(total_cents) as revenue')
            ->groupBy('name')
            ->orderByDesc('units')
            ->first();

        return $row ? [
            'name' => $row->name,
            'units' => (int) $row->units,
            'revenue' => (int) $row->revenue / 100,
        ] : null;
    }
}
