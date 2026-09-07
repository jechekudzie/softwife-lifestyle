import { router } from '@inertiajs/react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import {
    BarList,
    RevenueChart,
    SplitBar,
    type DailyPoint,
} from '@/components/admin/charts';
import AdminLayout from '@/layouts/admin-layout';

type Headline = {
    revenue: number;
    cost: number;
    profit: number;
    margin: number | null;
    costCoverage: number | null;
    orders: number;
    averageOrder: number;
    units: number;
    customShare: number;
    change: number | null;
};

function Card({
    title,
    children,
    className = '',
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`border-wine/12 rounded-2xl border bg-white/60 p-7 ${className}`}
        >
            <h2 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                {title}
            </h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function Stat({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: React.ReactNode;
}) {
    return (
        <div className="border-wine/12 rounded-2xl border bg-white/60 p-6">
            <p className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                {label}
            </p>
            <p className="font-display mt-3 text-3xl font-bold tabular-nums">
                {value}
            </p>
            {hint ? <div className="mt-2 text-xs">{hint}</div> : null}
        </div>
    );
}

export default function Analytics({
    days,
    ranges,
    headline,
    daily,
    topProducts,
    byStatus,
    fulfilment,
}: {
    days: number;
    ranges: number[];
    headline: Headline;
    daily: DailyPoint[];
    topProducts: { name: string; units: number; revenue: number }[];
    byStatus: Record<string, number>;
    fulfilment: Record<string, number>;
}) {
    const rising = (headline.change ?? 0) >= 0;

    return (
        <AdminLayout
            title="Analytics"
            description={`The last ${days} days. Cancelled orders are excluded.`}
            actions={
                <div className="flex gap-2">
                    {ranges.map((range) => (
                        <button
                            key={range}
                            type="button"
                            onClick={() =>
                                router.get(
                                    '/admin/analytics',
                                    { days: range },
                                    { preserveState: true, replace: true },
                                )
                            }
                            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                                days === range
                                    ? 'border-wine bg-wine text-white'
                                    : 'border-wine/20 hover:border-wine/50'
                            }`}
                        >
                            {range} days
                        </button>
                    ))}
                </div>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                    label="Revenue"
                    value={`$${headline.revenue.toFixed(2)}`}
                    hint={
                        headline.change !== null ? (
                            <span
                                className={`flex items-center gap-1.5 ${
                                    rising ? 'text-wine' : 'text-magenta'
                                }`}
                            >
                                {rising ? (
                                    <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                    <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {Math.abs(headline.change)}% on the {days} days
                                before
                            </span>
                        ) : (
                            <span className="opacity-45">
                                No earlier window to compare
                            </span>
                        )
                    }
                />
                <Stat
                    label="Profit"
                    value={`$${headline.profit.toFixed(2)}`}
                    hint={
                        headline.costCoverage !== null &&
                        headline.costCoverage < 100 ? (
                            <span className="text-magenta">
                                Costs known for {headline.costCoverage}% of
                                pieces sold
                            </span>
                        ) : headline.margin !== null ? (
                            <span className="opacity-45">
                                {headline.margin}% margin after landed cost
                            </span>
                        ) : null
                    }
                />
                <Stat label="Orders" value={String(headline.orders)} />
                <Stat
                    label="Average order"
                    value={`$${headline.averageOrder.toFixed(2)}`}
                />
                <Stat
                    label="Custom prints"
                    value={`${headline.customShare}%`}
                    hint={
                        <span className="opacity-45">
                            of {headline.units} pieces sold
                        </span>
                    }
                />
            </div>

            <Card title="Revenue per day" className="mt-8">
                <RevenueChart data={daily} />
            </Card>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <Card title="Best sellers by revenue">
                    <BarList
                        rows={topProducts.map((product) => ({
                            label: product.name,
                            value: product.revenue,
                            sub: `${product.units} sold`,
                        }))}
                    />
                </Card>

                <div className="space-y-8">
                    <Card title="Collection or delivery">
                        <SplitBar
                            parts={Object.entries(fulfilment).map(
                                ([label, value]) => ({ label, value }),
                            )}
                        />
                    </Card>

                    <Card title="Orders by status">
                        <BarList
                            rows={Object.entries(byStatus).map(
                                ([label, value]) => ({ label, value }),
                            )}
                            format={(value) => String(value)}
                        />
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
