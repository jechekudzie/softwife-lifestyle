<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockMovement;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    private const RANGES = [7, 30, 90];

    public function __invoke(Request $request): Response
    {
        $days = (int) $request->integer('days', 30);

        if (! in_array($days, self::RANGES, true)) {
            $days = 30;
        }

        $from = today()->subDays($days - 1);

        /** Cancelled orders are excluded everywhere, so they never flatter a total. */
        $sold = Order::whereNot('status', 'cancelled');

        return Inertia::render('admin/analytics', [
            'days' => $days,
            'ranges' => self::RANGES,
            'headline' => $this->headline($from, $days),
            'daily' => $this->daily($from, $days),
            'topProducts' => $this->topProducts($from),
            'byStatus' => (clone $sold)->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
            'fulfilment' => (clone $sold)->where('created_at', '>=', $from)
                ->selectRaw('fulfilment_method, count(*) as total')
                ->groupBy('fulfilment_method')
                ->pluck('total', 'fulfilment_method'),
        ]);
    }

    /**
     * @return array<string, float|int>
     */
    private function headline(CarbonInterface $from, int $days): array
    {
        $window = Order::whereNot('status', 'cancelled')->where('created_at', '>=', $from);

        $orders = (clone $window)->count();
        $revenue = (int) (clone $window)->sum('total_cents');

        // The equivalent window immediately before this one, for a like-for-like move.
        $previousFrom = $from->copy()->subDays($days);
        $previous = (int) Order::whereNot('status', 'cancelled')
            ->whereBetween('created_at', [$previousFrom, $from])
            ->sum('total_cents');

        $customUnits = (int) OrderItem::whereHas(
            'order',
            fn ($query) => $query->whereNot('status', 'cancelled')->where('created_at', '>=', $from)
        )->whereNotNull('custom_affirmation')->sum('quantity');

        $units = (int) OrderItem::whereHas(
            'order',
            fn ($query) => $query->whereNot('status', 'cancelled')->where('created_at', '>=', $from)
        )->sum('quantity');

        /**
         * Cost of what was sold, from the snapshot taken at the time of sale.
         * Pieces sold before any batch carried a cost contribute nothing, so
         * margin is reported as unknown rather than as pure profit.
         */
        $sales = StockMovement::where('reason', StockMovement::REASON_SALE)
            ->where('created_at', '>=', $from)
            ->get(['quantity', 'unit_cost_cents']);

        $costed = $sales->whereNotNull('unit_cost_cents');
        $cost = (int) $costed->sum(fn ($movement) => abs($movement->quantity) * $movement->unit_cost_cents);
        $costedUnits = (int) $costed->sum(fn ($movement) => abs($movement->quantity));
        $soldUnits = (int) $sales->sum(fn ($movement) => abs($movement->quantity));

        return [
            'revenue' => $revenue / 100,
            'cost' => $cost / 100,
            'profit' => ($revenue - $cost) / 100,
            'margin' => $revenue > 0 ? round(($revenue - $cost) / $revenue * 100) : null,
            'costCoverage' => $soldUnits > 0
                ? round($costedUnits / $soldUnits * 100)
                : null,
            'orders' => $orders,
            'averageOrder' => $orders ? round($revenue / $orders / 100, 2) : 0,
            'units' => $units,
            'customShare' => $units ? round($customUnits / $units * 100) : 0,
            'change' => $previous > 0
                ? round(($revenue - $previous) / $previous * 100)
                : null,
        ];
    }

    /**
     * Every day in the window, including the quiet ones, so the line does not
     * skip gaps and imply activity that did not happen.
     *
     * @return array<int, array{date: string, label: string, revenue: float, orders: int}>
     */
    private function daily(CarbonInterface $from, int $days): array
    {
        $byDay = Order::whereNot('status', 'cancelled')
            ->where('created_at', '>=', $from)
            ->get(['created_at', 'total_cents'])
            ->groupBy(fn (Order $order) => $order->created_at->toDateString());

        return collect(range(0, $days - 1))
            ->map(function (int $offset) use ($from, $byDay) {
                $date = $from->copy()->addDays($offset);
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
     * @return array<int, array{name: string, units: int, revenue: float}>
     */
    private function topProducts(CarbonInterface $from): array
    {
        return OrderItem::whereHas(
            'order',
            fn ($query) => $query->whereNot('status', 'cancelled')->where('created_at', '>=', $from)
        )
            ->selectRaw('name, sum(quantity) as units, sum(total_cents) as revenue')
            ->groupBy('name')
            ->orderByDesc('revenue')
            ->take(6)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'units' => (int) $row->units,
                'revenue' => (int) $row->revenue / 100,
            ])
            ->all();
    }
}
