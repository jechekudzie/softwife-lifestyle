import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, PenLine, Store, Truck } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';

type Item = {
    name: string;
    colourway: string;
    size: string;
    sku: string | null;
    custom: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
};

type Order = {
    reference: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string | null;
    paymentReference: string | null;
    customerName: string;
    email: string;
    phone: string;
    fulfilmentMethod: 'collection' | 'delivery';
    zone: { name: string; eta: string | null } | null;
    point: { name: string; address: string } | null;
    addressLine: string | null;
    suburb: string | null;
    city: string | null;
    notes: string | null;
    subtotal: number;
    deliveryFee: number;
    total: number;
    currency: string;
    placedAt: string | null;
    items: Item[];
};

const input =
    'border-wine/20 mt-2 w-full rounded-xl border bg-white/70 px-4 py-3 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none';

export default function ShowOrder({
    order,
    statuses,
    paymentStatuses,
}: {
    order: Order;
    statuses: string[];
    paymentStatuses: string[];
}) {
    return (
        <AdminLayout
            title={order.reference}
            description={`Placed ${order.placedAt}`}
            actions={
                <Link
                    href="/admin/orders"
                    className="border-wine/25 hover:bg-wine flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    All orders
                </Link>
            }
        >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <div>
                    <section className="border-wine/12 rounded-2xl border bg-white/60 p-7">
                        <h2 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                            Items
                        </h2>

                        <ul className="mt-5 divide-y divide-[rgba(107,33,55,0.10)]">
                            {order.items.map((item, index) => (
                                <li
                                    key={`${item.sku}-${index}`}
                                    className="flex justify-between gap-5 py-4 first:pt-0"
                                >
                                    <span className="min-w-0">
                                        <span className="font-display block font-bold">
                                            {item.name}
                                            {item.quantity > 1
                                                ? ` × ${item.quantity}`
                                                : ''}
                                        </span>
                                        <span className="mt-0.5 block text-sm opacity-55">
                                            {item.colourway} · {item.size}
                                        </span>
                                        {item.sku ? (
                                            <span className="block text-xs opacity-35">
                                                {item.sku}
                                            </span>
                                        ) : null}
                                        {item.custom ? (
                                            <span className="text-magenta mt-2 flex items-start gap-1.5 text-xs">
                                                <PenLine className="mt-0.5 h-3 w-3 shrink-0" />
                                                “{item.custom}”
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="text-sm font-medium tabular-nums">
                                        ${item.total.toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <dl className="border-wine/12 mt-5 space-y-2 border-t pt-5 text-sm">
                            <div className="flex justify-between">
                                <dt className="opacity-55">Subtotal</dt>
                                <dd className="tabular-nums">
                                    ${order.subtotal.toFixed(2)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="opacity-55">
                                    {order.fulfilmentMethod === 'collection'
                                        ? 'Collection'
                                        : 'Delivery'}
                                </dt>
                                <dd className="tabular-nums">
                                    ${order.deliveryFee.toFixed(2)}
                                </dd>
                            </div>
                            <div className="border-wine/12 flex justify-between border-t pt-3">
                                <dt className="font-semibold">Total</dt>
                                <dd className="font-display text-xl font-bold tabular-nums">
                                    ${order.total.toFixed(2)} {order.currency}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="border-wine/12 mt-8 rounded-2xl border bg-white/60 p-7">
                        <h2 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                            Customer
                        </h2>
                        <p className="mt-4 text-sm">
                            <span className="block font-semibold">
                                {order.customerName}
                            </span>
                            <a
                                href={`mailto:${order.email}`}
                                className="mt-1 block opacity-65 hover:underline"
                            >
                                {order.email}
                            </a>
                            <a
                                href={`tel:${order.phone}`}
                                className="block opacity-65 hover:underline"
                            >
                                {order.phone}
                            </a>
                        </p>

                        <p className="mt-5 flex items-start gap-3 text-sm">
                            {order.fulfilmentMethod === 'collection' ? (
                                <>
                                    <Store className="text-wine mt-0.5 h-4 w-4 shrink-0" />
                                    <span className="opacity-70">
                                        {order.point?.name} ·{' '}
                                        {order.point?.address}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Truck className="text-wine mt-0.5 h-4 w-4 shrink-0" />
                                    <span className="opacity-70">
                                        {order.addressLine}
                                        {order.suburb
                                            ? `, ${order.suburb}`
                                            : ''}
                                        {order.city ? `, ${order.city}` : ''}
                                        {order.zone
                                            ? ` · ${order.zone.name}`
                                            : ''}
                                    </span>
                                </>
                            )}
                        </p>

                        {order.notes ? (
                            <p className="bg-petal/70 mt-5 rounded-xl px-4 py-3 text-sm leading-relaxed">
                                {order.notes}
                            </p>
                        ) : null}
                    </section>
                </div>

                <aside>
                    <Form
                        method="put"
                        action={`/admin/orders/${order.reference}`}
                        className="border-wine/12 sticky top-8 rounded-2xl border bg-white/60 p-7"
                    >
                        {({ processing }) => (
                            <>
                                <h2 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                                    Update
                                </h2>

                                <div className="mt-5">
                                    <label
                                        htmlFor="status"
                                        className="text-xs opacity-55"
                                    >
                                        Order status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={order.status}
                                        className={`${input} capitalize`}
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-5">
                                    <label
                                        htmlFor="payment_status"
                                        className="text-xs opacity-55"
                                    >
                                        Payment
                                    </label>
                                    <select
                                        id="payment_status"
                                        name="payment_status"
                                        defaultValue={order.paymentStatus}
                                        className={`${input} capitalize`}
                                    >
                                        {paymentStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-5">
                                    <label
                                        htmlFor="payment_reference"
                                        className="text-xs opacity-55"
                                    >
                                        Payment reference
                                    </label>
                                    <input
                                        id="payment_reference"
                                        name="payment_reference"
                                        defaultValue={
                                            order.paymentReference ?? ''
                                        }
                                        placeholder="EcoCash confirmation…"
                                        className={input}
                                    />
                                </div>

                                {order.paymentMethod ? (
                                    <p className="mt-4 text-xs opacity-50">
                                        Chosen at checkout:{' '}
                                        {order.paymentMethod}
                                    </p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-wine hover:bg-wine-soft mt-7 w-full rounded-full py-3.5 text-sm font-semibold text-white transition disabled:opacity-50"
                                >
                                    {processing ? 'Saving…' : 'Save'}
                                </button>
                            </>
                        )}
                    </Form>
                </aside>
            </div>
        </AdminLayout>
    );
}
