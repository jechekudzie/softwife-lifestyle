<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /** How few is few enough to warrant a warning. */
    private const LOW_STOCK = 3;

    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'ordersToday' => Order::whereDate('created_at', today())->count(),
                'ordersPending' => Order::where('status', 'pending')->count(),
                'revenueCents' => (int) Order::whereNot('status', 'cancelled')->sum('total_cents'),
                'unpaidCents' => (int) Order::where('payment_status', 'unpaid')
                    ->whereNot('status', 'cancelled')
                    ->sum('total_cents'),
                'products' => Product::where('is_active', true)->count(),
                'outOfStock' => ProductVariant::where('is_active', true)->where('stock', 0)->count(),
            ],
            /** A fortnight of takings, for the overview trace. */
            'trend' => collect(range(13, 0))
                ->map(function (int $offset) {
                    $date = today()->subDays($offset);
                    $orders = Order::whereNot('status', 'cancelled')
                        ->whereDate('created_at', $date)
                        ->get(['total_cents']);

                    return [
                        'date' => $date->toDateString(),
                        'label' => $date->format('j M'),
                        'revenue' => $orders->sum('total_cents') / 100,
                        'orders' => $orders->count(),
                    ];
                })
                ->values(),
            'recentOrders' => Order::latest('id')->take(8)->get()->map(fn (Order $order) => [
                'reference' => $order->reference,
                'customerName' => $order->customer_name,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'total' => $order->total_cents / 100,
                'placedAt' => $order->created_at?->diffForHumans(),
            ]),
            'lowStock' => ProductVariant::with('product:id,name', 'colourway:id,name')
                ->where('is_active', true)
                ->where('stock', '<=', self::LOW_STOCK)
                ->orderBy('stock')
                ->take(10)
                ->get()
                ->map(fn (ProductVariant $variant) => [
                    'id' => $variant->id,
                    'product' => $variant->product->name,
                    'colourway' => $variant->colourway->name,
                    'size' => $variant->size,
                    'stock' => $variant->stock,
                ]),
        ]);
    }
}
