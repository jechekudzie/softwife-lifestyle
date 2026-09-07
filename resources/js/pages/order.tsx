import { Head } from '@inertiajs/react';
import { Check, PenLine, Store, Truck } from 'lucide-react';
import { useEffect } from 'react';
import { Script } from '@/components/storefront/brand';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { useCart } from '@/lib/cart';

type OrderItem = {
    name: string;
    colourway: string;
    size: string;
    custom: string | null;
    quantity: number;
    total: number;
};

type Order = {
    reference: string;
    status: string;
    customerName: string;
    email: string;
    fulfilmentMethod: 'collection' | 'delivery';
    zone: { name: string; eta: string | null } | null;
    point: { name: string; address: string; hours: string | null } | null;
    addressLine: string | null;
    suburb: string | null;
    city: string | null;
    subtotal: number;
    deliveryFee: number;
    total: number;
    currency: string;
    paymentMethod: string | null;
    paymentStatus: string;
    placedAt: string | null;
    hasCustom: boolean;
    items: OrderItem[];
};

export default function OrderConfirmation({
    order,
    customLeadTime,
}: {
    order: Order;
    customLeadTime: string;
}) {
    const { clear } = useCart();

    // The order is on the server now, so the browser copy has done its job.
    useEffect(() => {
        clear();
    }, [clear]);

    const money = (amount: number) => `$${amount.toFixed(2)}`;

    return (
        <>
            <Head title={`Order ${order.reference}`} />

            <div className="bg-bone text-choc font-sans">
                <StorefrontHeader />

                <section
                    className="sw-grain relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20"
                    style={{
                        background:
                            'radial-gradient(120% 120% at 10% 0%, #7d2a44 0%, #6b2137 40%, #55172c 76%, #3d0f20 100%)',
                    }}
                >
                    <div className="relative mx-auto max-w-3xl px-6 text-center">
                        <span className="bg-butter text-wine mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <Check className="h-6 w-6" />
                        </span>

                        <h1 className="font-display text-butter mt-7 text-[clamp(2rem,5vw,3.4rem)] leading-[1.06]">
                            Thank you,{' '}
                            <Script className="text-[1.35em] text-[var(--color-rose)]">
                                {order.customerName.split(' ')[0]}
                            </Script>
                        </h1>

                        <p className="text-butter/70 mt-5 text-sm leading-relaxed">
                            Your order is{' '}
                            <span className="text-butter font-semibold">
                                {order.reference}
                            </span>
                            . We have sent a copy to {order.email}.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
                    <div className="bg-petal rounded-[1.5rem] p-7 sm:p-9">
                        <h2 className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                            What you ordered
                        </h2>

                        <ul className="border-wine/12 mt-5 divide-y divide-[rgba(107,33,55,0.12)] border-b pb-1">
                            {order.items.map((item, index) => (
                                <li
                                    key={`${item.name}-${index}`}
                                    className="flex justify-between gap-5 py-4"
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="font-display block font-bold">
                                            {item.name}
                                            {item.quantity > 1
                                                ? ` × ${item.quantity}`
                                                : ''}
                                        </span>
                                        <span className="mt-0.5 block text-sm opacity-55">
                                            {item.colourway} · Size {item.size}
                                        </span>
                                        {item.custom ? (
                                            <span className="text-magenta mt-1.5 flex items-start gap-1.5 text-xs">
                                                <PenLine className="mt-0.5 h-3 w-3 shrink-0" />
                                                “{item.custom}”
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="text-sm font-medium tabular-nums">
                                        {money(item.total)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-5 space-y-2.5 text-sm">
                            <div className="flex justify-between">
                                <dt className="opacity-60">Subtotal</dt>
                                <dd className="tabular-nums">
                                    {money(order.subtotal)}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="opacity-60">
                                    {order.fulfilmentMethod === 'collection'
                                        ? 'Collection'
                                        : 'Delivery'}
                                </dt>
                                <dd className="tabular-nums">
                                    {order.deliveryFee === 0
                                        ? 'Free'
                                        : money(order.deliveryFee)}
                                </dd>
                            </div>
                        </dl>

                        <div className="border-wine/15 mt-5 flex items-baseline justify-between border-t pt-5">
                            <span className="text-sm opacity-60">Total</span>
                            <span className="font-display text-2xl font-bold tabular-nums">
                                {money(order.total)}{' '}
                                <span className="text-sm font-normal opacity-50">
                                    {order.currency}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="border-wine/12 mt-8 rounded-[1.5rem] border p-7 sm:p-9">
                        <h2 className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                            {order.fulfilmentMethod === 'collection'
                                ? 'Collecting from'
                                : 'Delivering to'}
                        </h2>

                        {order.point ? (
                            <p className="mt-4 flex items-start gap-3 text-sm leading-relaxed">
                                <Store className="text-wine mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    <span className="block font-semibold">
                                        {order.point.name}
                                    </span>
                                    <span className="mt-0.5 block opacity-65">
                                        {order.point.address}
                                    </span>
                                    <span className="mt-0.5 block text-xs opacity-45">
                                        {order.point.hours}
                                    </span>
                                </span>
                            </p>
                        ) : (
                            <p className="mt-4 flex items-start gap-3 text-sm leading-relaxed">
                                <Truck className="text-wine mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    <span className="block opacity-75">
                                        {order.addressLine}
                                        {order.suburb
                                            ? `, ${order.suburb}`
                                            : ''}
                                        {order.city ? `, ${order.city}` : ''}
                                    </span>
                                    {order.zone ? (
                                        <span className="mt-0.5 block text-xs opacity-45">
                                            {order.zone.name} · arrives in{' '}
                                            {order.zone.eta}
                                        </span>
                                    ) : null}
                                </span>
                            </p>
                        )}

                        {order.hasCustom ? (
                            <p className="text-magenta mt-5 text-xs leading-relaxed">
                                Your custom piece is printed to order. We will
                                send a proof before printing, and it adds{' '}
                                {customLeadTime}.
                            </p>
                        ) : null}

                        <p className="border-wine/12 mt-6 border-t pt-5 text-xs leading-relaxed opacity-55">
                            Payment is {order.paymentStatus}. We will be in
                            touch on {order.email} to arrange it.
                        </p>
                    </div>

                    <div className="mt-10 text-center">
                        <a
                            href="/shop"
                            className="border-wine/25 hover:bg-wine rounded-full border px-8 py-4 text-sm font-semibold transition hover:text-white"
                        >
                            Keep shopping
                        </a>
                    </div>
                </section>

                <StorefrontFooter />
            </div>
        </>
    );
}
