import { Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

type Row = {
    reference: string;
    customerName: string;
    email: string;
    status: string;
    paymentStatus: string;
    fulfilmentMethod: string;
    total: number;
    placedAt: string | null;
};

type Paginated = {
    data: Row[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

export default function AdminOrders({
    orders,
    filters,
    statuses,
}: {
    orders: Paginated;
    filters: { status: string; search: string };
    statuses: string[];
}) {
    const [search, setSearch] = useState(filters.search);

    const apply = (patch: Record<string, string>) =>
        router.get(
            '/admin/orders',
            { ...filters, ...patch },
            {
                preserveState: true,
                replace: true,
            },
        );

    return (
        <AdminLayout title="Orders" description={`${orders.total} in total.`}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        apply({ search });
                    }}
                    className="border-wine/20 flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2.5"
                >
                    <Search className="h-4 w-4 opacity-40" />
                    <label htmlFor="order-search" className="sr-only">
                        Search orders
                    </label>
                    <input
                        id="order-search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Reference, name or email"
                        className="w-56 bg-transparent text-sm outline-none"
                    />
                </form>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => apply({ status: '' })}
                        className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                            filters.status === ''
                                ? 'border-wine bg-wine text-white'
                                : 'border-wine/20 hover:border-wine/50'
                        }`}
                    >
                        All
                    </button>
                    {statuses.map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => apply({ status })}
                            className={`rounded-full border px-4 py-2 text-xs font-medium capitalize transition ${
                                filters.status === status
                                    ? 'border-wine bg-wine text-white'
                                    : 'border-wine/20 hover:border-wine/50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {orders.data.length ? (
                <ul className="border-wine/12 divide-y divide-[rgba(107,33,55,0.10)] overflow-hidden rounded-2xl border bg-white/60">
                    {orders.data.map((order) => (
                        <li key={order.reference}>
                            <Link
                                href={`/admin/orders/${order.reference}`}
                                className="hover:bg-petal/60 flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition"
                            >
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">
                                        {order.customerName}
                                    </span>
                                    <span className="block text-xs opacity-50">
                                        {order.reference} · {order.email}
                                    </span>
                                </span>

                                <span className="flex items-center gap-3">
                                    <span className="border-wine/20 rounded-full border px-2.5 py-1 text-[0.6rem] tracking-[0.14em] uppercase opacity-65">
                                        {order.fulfilmentMethod}
                                    </span>
                                    <span className="border-wine/20 rounded-full border px-2.5 py-1 text-[0.6rem] tracking-[0.14em] uppercase opacity-65">
                                        {order.status}
                                    </span>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[0.6rem] tracking-[0.14em] uppercase ${
                                            order.paymentStatus === 'paid'
                                                ? 'bg-petal text-wine'
                                                : 'text-magenta border-magenta/30 border'
                                        }`}
                                    >
                                        {order.paymentStatus}
                                    </span>
                                    <span className="w-20 text-right text-sm font-medium tabular-nums">
                                        ${order.total.toFixed(2)}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="border-wine/12 rounded-2xl border bg-white/60 px-5 py-16 text-center text-sm opacity-50">
                    No orders match that.
                </p>
            )}

            {orders.links.length > 3 ? (
                <nav className="mt-8 flex flex-wrap justify-center gap-2">
                    {orders.links.map((link) => (
                        <button
                            key={link.label}
                            type="button"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            className={`rounded-full border px-3.5 py-2 text-xs transition disabled:opacity-30 ${
                                link.active
                                    ? 'border-wine bg-wine text-white'
                                    : 'border-wine/20 hover:border-wine/50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>
            ) : null}
        </AdminLayout>
    );
}
