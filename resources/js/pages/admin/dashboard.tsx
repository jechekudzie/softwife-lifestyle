import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Boxes,
    Crown,
    PackageX,
    Receipt,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { RevenueChart, type DailyPoint } from '@/components/admin/charts';
import { SMark } from '@/components/storefront/brand';
import AdminLayout from '@/layouts/admin-layout';

type Today = { revenue: number; orders: number; change: number | null };

type Stats = {
    week: number;
    weekChange: number | null;
    pending: number;
    unpaid: number;
    unpaidCount: number;
    products: number;
    outOfStock: number;
    onHand: number;
};

type RecentOrder = {
    reference: string;
    customerName: string;
    status: string;
    paymentStatus: string;
    fulfilmentMethod: string;
    total: number;
    placedAt: string | null;
};

type LowStock = {
    id: number;
    slug: string | null;
    product: string;
    colourway: string;
    cloth: string;
    size: string;
    stock: number;
};

const money = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Delta({
    value,
    quiet = false,
}: {
    value: number | null;
    quiet?: boolean;
}) {
    if (value === null) {
        return (
            <span className={quiet ? 'opacity-40' : 'text-butter/45'}>
                nothing to compare
            </span>
        );
    }

    const rising = value >= 0;
    const Icon = rising ? TrendingUp : TrendingDown;

    return (
        <span
            className={`flex items-center gap-1.5 ${
                quiet
                    ? rising
                        ? 'text-wine'
                        : 'text-magenta'
                    : rising
                      ? 'text-[var(--color-rose)]'
                      : 'text-white/70'
            }`}
        >
            <Icon className="h-3.5 w-3.5" />
            {Math.abs(value)}%
        </span>
    );
}

/** A quiet tile. The loud numbers live in the masthead. */
function Tile({
    icon: Icon,
    label,
    value,
    hint,
    href,
    urgent = false,
}: {
    icon: typeof Wallet;
    label: string;
    value: string;
    hint?: React.ReactNode;
    href?: string;
    urgent?: boolean;
}) {
    const body = (
        <>
            <div className="flex items-start justify-between">
                <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        urgent
                            ? 'bg-magenta/12 text-magenta'
                            : 'bg-petal text-wine'
                    }`}
                >
                    <Icon className="h-4 w-4" />
                </span>
                {href ? (
                    <ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-40" />
                ) : null}
            </div>

            <p className="mt-5 text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                {label}
            </p>
            <p
                className={`font-display mt-1.5 text-2xl font-bold tabular-nums ${
                    urgent ? 'text-magenta' : ''
                }`}
            >
                {value}
            </p>
            {hint ? <div className="mt-1.5 text-xs">{hint}</div> : null}
        </>
    );

    const shell =
        'group border-wine/12 hover:border-wine/30 block rounded-2xl border bg-white/70 p-6 transition';

    return href ? (
        <Link href={href} className={shell}>
            {body}
        </Link>
    ) : (
        <div className={shell}>{body}</div>
    );
}

const STATUS_TONE: Record<string, string> = {
    pending: 'bg-magenta/12 text-magenta',
    printing: 'bg-petal text-wine',
    ready: 'bg-petal text-wine',
    shipped: 'bg-wine/10 text-wine',
    collected: 'bg-wine/10 text-wine',
    cancelled: 'bg-choc/8 text-choc/50',
};

export default function AdminDashboard({
    greeting,
    today,
    stats,
    trend,
    topSeller,
    recentOrders,
    lowStock,
}: {
    greeting: string;
    today: Today;
    stats: Stats;
    trend: DailyPoint[];
    topSeller: { name: string; units: number; revenue: number } | null;
    recentOrders: RecentOrder[];
    lowStock: LowStock[];
}) {
    return (
        <AdminLayout
            title="Overview"
            description="Where the shop stands today."
        >
            {/* Masthead. The day's numbers, on the brand's own ground. */}
            <section
                className="sw-grain relative overflow-hidden rounded-[1.75rem] px-8 py-9 sm:px-10"
                style={{
                    background:
                        'radial-gradient(120% 130% at 8% 0%, #7d2a44 0%, #6b2137 42%, #55172c 78%, #3d0f20 100%)',
                }}
            >
                <SMark
                    color="var(--color-butter)"
                    className="pointer-events-none absolute -right-10 -bottom-24 hidden h-[240%] sm:block"
                    style={{ opacity: 0.05 }}
                />

                <div className="relative flex flex-wrap items-end justify-between gap-8">
                    <div>
                        <p className="text-butter/60 text-[0.62rem] font-semibold tracking-[0.28em] uppercase">
                            {greeting}
                        </p>
                        <p className="font-display text-butter mt-3 text-[clamp(2.4rem,5vw,3.6rem)] leading-none font-bold tabular-nums">
                            {money(today.revenue)}
                        </p>
                        <p className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-butter/65">
                                {today.orders}{' '}
                                {today.orders === 1 ? 'order' : 'orders'} today
                            </span>
                            <Delta value={today.change} />
                            <span className="text-butter/35 text-xs">
                                against yesterday
                            </span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/admin/orders?status=pending"
                            className="bg-butter text-wine rounded-full px-6 py-3 text-sm font-semibold transition hover:bg-white"
                        >
                            {stats.pending} to action
                        </Link>
                        <Link
                            href="/admin/analytics"
                            className="text-butter flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
                        >
                            Analytics
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Tile
                    icon={Wallet}
                    label="Last 7 days"
                    value={money(stats.week)}
                    hint={<Delta value={stats.weekChange} quiet />}
                />
                <Tile
                    icon={Receipt}
                    label="Unpaid"
                    value={money(stats.unpaid)}
                    urgent={stats.unpaid > 0}
                    href="/admin/orders"
                    hint={
                        <span className="opacity-45">
                            across {stats.unpaidCount}{' '}
                            {stats.unpaidCount === 1 ? 'order' : 'orders'}
                        </span>
                    }
                />
                <Tile
                    icon={Boxes}
                    label="Pieces on hand"
                    value={stats.onHand.toLocaleString()}
                    href="/admin/products"
                    hint={
                        <span className="opacity-45">
                            across {stats.products} live products
                        </span>
                    }
                />
                <Tile
                    icon={PackageX}
                    label="Sold out"
                    value={String(stats.outOfStock)}
                    urgent={stats.outOfStock > 0}
                    href="/admin/products"
                    hint={<span className="opacity-45">size and colour</span>}
                />
            </div>

            <section className="border-wine/12 mt-6 rounded-2xl border bg-white/70 p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h2 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                        Last 14 days
                    </h2>
                    {topSeller ? (
                        <p className="flex items-center gap-2 text-xs">
                            <Crown className="text-wine h-3.5 w-3.5" />
                            <span className="opacity-45">Best seller</span>
                            <span className="font-semibold">
                                {topSeller.name}
                            </span>
                            <span className="tabular-nums opacity-45">
                                {topSeller.units} sold
                            </span>
                        </p>
                    ) : null}
                </div>

                <div className="mt-5">
                    <RevenueChart data={trend} />
                </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <section className="border-wine/12 rounded-2xl border bg-white/70">
                    <div className="border-wine/10 flex items-center justify-between border-b px-6 py-4">
                        <h2 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                            Latest orders
                        </h2>
                        <Link
                            href="/admin/orders"
                            className="text-wine text-xs font-semibold hover:underline"
                        >
                            See all
                        </Link>
                    </div>

                    {recentOrders.length ? (
                        <ul className="divide-y divide-[rgba(107,33,55,0.08)]">
                            {recentOrders.map((order) => (
                                <li key={order.reference}>
                                    <Link
                                        href={`/admin/orders/${order.reference}`}
                                        className="hover:bg-petal/50 flex items-center gap-4 px-6 py-3.5 transition"
                                    >
                                        <span className="bg-wine flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                                            {order.customerName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>

                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold">
                                                {order.customerName}
                                            </span>
                                            <span className="block text-xs opacity-45">
                                                {order.reference} ·{' '}
                                                {order.placedAt}
                                            </span>
                                        </span>

                                        <span
                                            className={`hidden rounded-full px-2.5 py-1 text-[0.58rem] tracking-[0.14em] uppercase sm:inline ${
                                                STATUS_TONE[order.status] ??
                                                'bg-choc/8'
                                            }`}
                                        >
                                            {order.status}
                                        </span>

                                        <span className="w-20 text-right text-sm font-medium tabular-nums">
                                            {money(order.total)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-6 py-14 text-center text-sm opacity-45">
                            No orders yet.
                        </p>
                    )}
                </section>

                <section className="border-wine/12 rounded-2xl border bg-white/70">
                    <div className="border-wine/10 flex items-center justify-between border-b px-6 py-4">
                        <h2 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                            Running low
                        </h2>
                        <Link
                            href="/admin/products"
                            className="text-wine text-xs font-semibold hover:underline"
                        >
                            Restock
                        </Link>
                    </div>

                    {lowStock.length ? (
                        <ul className="divide-y divide-[rgba(107,33,55,0.08)]">
                            {lowStock.map((variant) => (
                                <li
                                    key={variant.id}
                                    className="flex items-center gap-3 px-6 py-3.5"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="border-wine/15 h-7 w-7 shrink-0 rounded-full border"
                                        style={{
                                            backgroundColor: variant.cloth,
                                        }}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm">
                                            {variant.product}
                                        </span>
                                        <span className="block text-xs opacity-45">
                                            {variant.colourway} · {variant.size}
                                        </span>
                                    </span>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${
                                            variant.stock === 0
                                                ? 'bg-magenta/12 text-magenta'
                                                : 'bg-petal text-wine'
                                        }`}
                                    >
                                        {variant.stock === 0
                                            ? 'Out'
                                            : variant.stock}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-6 py-14 text-center text-sm opacity-45">
                            Everything is well stocked.
                        </p>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
