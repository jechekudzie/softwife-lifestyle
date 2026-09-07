import { Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';

type Stats = {
    ordersToday: number;
    ordersPending: number;
    revenueCents: number;
    unpaidCents: number;
    products: number;
    outOfStock: number;
};

type RecentOrder = {
    reference: string;
    customerName: string;
    status: string;
    paymentStatus: string;
    total: number;
    placedAt: string | null;
};

type LowStock = {
    id: number;
    product: string;
    colourway: string;
    size: string;
    stock: number;
};

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function Stat({
    label,
    value,
    tone = 'plain',
}: {
    label: string;
    value: string | number;
    tone?: 'plain' | 'warn';
}) {
    return (
        <div className="border-wine/12 rounded-2xl border bg-white/60 p-6">
            <p className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                {label}
            </p>
            <p
                className={`font-display mt-3 text-3xl font-bold tabular-nums ${
                    tone === 'warn' && value !== 0 ? 'text-magenta' : ''
                }`}
            >
                {value}
            </p>
        </div>
    );
}

export default function AdminDashboard({
    stats,
    recentOrders,
    lowStock,
}: {
    stats: Stats;
    recentOrders: RecentOrder[];
    lowStock: LowStock[];
}) {
    return (
        <AdminLayout
            title="Overview"
            description="Where the shop stands today."
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Stat label="Orders today" value={stats.ordersToday} />
                <Stat label="Awaiting action" value={stats.ordersPending} />
                <Stat label="Taken" value={money(stats.revenueCents)} />
                <Stat
                    label="Unpaid"
                    value={money(stats.unpaidCents)}
                    tone="warn"
                />
                <Stat label="Live products" value={stats.products} />
                <Stat
                    label="Sold-out variants"
                    value={stats.outOfStock}
                    tone="warn"
                />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <section>
                    <h2 className="font-display text-lg font-bold">
                        Latest orders
                    </h2>

                    {recentOrders.length ? (
                        <ul className="border-wine/12 mt-4 divide-y divide-[rgba(107,33,55,0.10)] rounded-2xl border bg-white/60">
                            {recentOrders.map((order) => (
                                <li key={order.reference}>
                                    <Link
                                        href={`/admin/orders/${order.reference}`}
                                        className="hover:bg-petal/60 flex items-center justify-between gap-4 px-5 py-4 transition"
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold">
                                                {order.customerName}
                                            </span>
                                            <span className="block text-xs opacity-50">
                                                {order.reference} ·{' '}
                                                {order.placedAt}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-4">
                                            <span className="border-wine/20 rounded-full border px-2.5 py-1 text-[0.6rem] tracking-[0.14em] uppercase opacity-60">
                                                {order.status}
                                            </span>
                                            <span className="text-sm font-medium tabular-nums">
                                                ${order.total.toFixed(2)}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="border-wine/12 mt-4 rounded-2xl border bg-white/60 px-5 py-10 text-center text-sm opacity-50">
                            No orders yet.
                        </p>
                    )}
                </section>

                <section>
                    <h2 className="font-display flex items-center gap-2 text-lg font-bold">
                        <AlertTriangle className="text-magenta h-4 w-4" />
                        Running low
                    </h2>

                    {lowStock.length ? (
                        <ul className="border-wine/12 mt-4 divide-y divide-[rgba(107,33,55,0.10)] rounded-2xl border bg-white/60">
                            {lowStock.map((variant) => (
                                <li
                                    key={variant.id}
                                    className="flex items-center justify-between gap-4 px-5 py-3.5"
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm">
                                            {variant.product}
                                        </span>
                                        <span className="block text-xs opacity-50">
                                            {variant.colourway} · {variant.size}
                                        </span>
                                    </span>
                                    <span
                                        className={`text-sm font-semibold tabular-nums ${
                                            variant.stock === 0
                                                ? 'text-magenta'
                                                : ''
                                        }`}
                                    >
                                        {variant.stock}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="border-wine/12 mt-4 rounded-2xl border bg-white/60 px-5 py-10 text-center text-sm opacity-50">
                            Everything is well stocked.
                        </p>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
