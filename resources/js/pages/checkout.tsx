import { Head } from '@inertiajs/react';
import { Check, PenLine, Store, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Script } from '@/components/storefront/brand';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { router } from '@inertiajs/react';
import { unitPrice, useCart } from '@/lib/cart';
import { PAYMENT_METHODS, type Fulfilment } from '@/lib/checkout';
import { formatPrice } from '@/lib/storefront';

function Field({
    id,
    label,
    type = 'text',
    required = true,
    placeholder,
    value,
    onChange,
    autoComplete,
}: {
    id: string;
    label: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete?: string;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45"
            >
                {label}
                {required ? '' : ' (optional)'}
            </label>
            <input
                id={id}
                type={type}
                required={required}
                placeholder={placeholder}
                value={value}
                autoComplete={autoComplete}
                onChange={(event) => onChange(event.target.value)}
                className="border-wine/20 placeholder:text-choc/30 mt-2 w-full rounded-xl border bg-white/70 px-4 py-3 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
            />
        </div>
    );
}

function Section({
    step,
    title,
    children,
}: {
    step: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border-wine/12 border-t py-9 first:border-t-0 first:pt-0">
            <h2 className="flex items-baseline gap-3">
                <span className="text-wine text-[0.62rem] tabular-nums opacity-45">
                    {step}
                </span>
                <span className="font-display text-xl font-bold">{title}</span>
            </h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

type Zone = {
    slug: string;
    name: string;
    detail: string | null;
    fee: number;
    eta: string | null;
};

type Point = {
    slug: string;
    name: string;
    address: string;
    hours: string | null;
};

type Shop = {
    currency: string;
    customFee: number;
    customLeadTime: string;
    freeDeliveryFrom: number;
};

export default function Checkout({
    zones,
    points,
    shop,
}: {
    zones: Zone[];
    points: Point[];
    shop: Shop;
}) {
    const { items, subtotal, count, customCount } = useCart();
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fulfilment, setFulfilment] = useState<Fulfilment>({
        method: 'delivery',
        zoneId: zones[0]?.slug ?? '',
    });
    const [address, setAddress] = useState('');
    const [suburb, setSuburb] = useState('');
    const [city, setCity] = useState('');
    const [notes, setNotes] = useState('');
    const [payment, setPayment] = useState(PAYMENT_METHODS[0].id);

    const zone =
        fulfilment.method === 'delivery'
            ? (zones.find((item) => item.slug === fulfilment.zoneId) ?? null)
            : null;
    const point =
        fulfilment.method === 'collection'
            ? (points.find((item) => item.slug === fulfilment.pointId) ?? null)
            : null;

    // Shown live, then recomputed on the server before anything is stored.
    const fee = useMemo(() => {
        if (!zone || subtotal >= shop.freeDeliveryFrom) {
            return 0;
        }

        return zone.fee;
    }, [zone, subtotal, shop.freeDeliveryFrom]);

    const total = subtotal + fee;

    const contactReady =
        name.trim().length > 1 &&
        email.includes('@') &&
        phone.trim().length > 5;
    const addressReady =
        fulfilment.method === 'collection' ||
        (address.trim().length > 3 && city.trim().length > 1);
    const ready = items.length > 0 && contactReady && addressReady;

    const shortfall = Math.max(0, shop.freeDeliveryFrom - subtotal);

    const submit = () => {
        if (!ready || submitting) {
            return;
        }

        setSubmitting(true);

        router.post(
            '/checkout',
            {
                customer_name: name,
                email,
                phone,
                fulfilment_method: fulfilment.method,
                delivery_zone:
                    fulfilment.method === 'delivery' ? fulfilment.zoneId : null,
                collection_point:
                    fulfilment.method === 'collection'
                        ? fulfilment.pointId
                        : null,
                address_line: fulfilment.method === 'delivery' ? address : null,
                suburb: fulfilment.method === 'delivery' ? suburb : null,
                city: fulfilment.method === 'delivery' ? city : null,
                notes: notes || null,
                payment_method: payment,
                items: items.map((item) => ({
                    product: item.slug,
                    colourway: item.colourway,
                    size: item.size,
                    quantity: item.quantity,
                    custom: item.custom,
                })),
            },
            {
                onError: (bag) => setErrors(bag as Record<string, string>),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    if (!items.length) {
        return (
            <>
                <Head title="Checkout" />
                <div className="bg-bone text-choc font-sans">
                    <StorefrontHeader />
                    <div className="mx-auto max-w-2xl px-6 py-40 text-center">
                        <p className="font-display text-2xl">
                            There is nothing to check out.
                        </p>
                        <a
                            href="/shop"
                            className="bg-wine hover:bg-wine-soft mt-8 inline-block rounded-full px-9 py-4 text-sm font-semibold text-white transition"
                        >
                            Shop the collection
                        </a>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Checkout" />

            <div className="bg-bone text-choc font-sans">
                <StorefrontHeader />

                <section
                    className="sw-grain relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16"
                    style={{
                        background:
                            'radial-gradient(120% 120% at 10% 0%, #7d2a44 0%, #6b2137 40%, #55172c 76%, #3d0f20 100%)',
                    }}
                >
                    <div className="relative mx-auto max-w-6xl px-6">
                        <nav
                            aria-label="Breadcrumb"
                            className="text-butter/55 text-[0.68rem] tracking-[0.22em] uppercase"
                        >
                            <a href="/cart" className="hover:text-butter">
                                Bag
                            </a>
                            <span className="px-2">/</span>
                            <span className="text-butter/85">Checkout</span>
                        </nav>
                        <h1 className="font-display text-butter mt-6 text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.04]">
                            Almost{' '}
                            <Script className="text-[1.35em] text-[var(--color-rose)]">
                                yours
                            </Script>
                        </h1>
                    </div>
                </section>

                <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
                    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
                        <form onSubmit={(event) => event.preventDefault()}>
                            <Section step="01" title="Your details">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field
                                        id="name"
                                        label="Full name"
                                        value={name}
                                        onChange={setName}
                                        autoComplete="name"
                                        placeholder="Tendai Moyo"
                                    />
                                    <Field
                                        id="phone"
                                        label="Phone"
                                        type="tel"
                                        value={phone}
                                        onChange={setPhone}
                                        autoComplete="tel"
                                        placeholder="+263 77 000 0000"
                                    />
                                    <div className="sm:col-span-2">
                                        <Field
                                            id="email"
                                            label="Email"
                                            type="email"
                                            value={email}
                                            onChange={setEmail}
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                            </Section>

                            <Section step="02" title="Collection or delivery">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFulfilment({
                                                method: 'collection',
                                                pointId: points[0]?.slug ?? '',
                                            })
                                        }
                                        aria-pressed={
                                            fulfilment.method === 'collection'
                                        }
                                        className={`rounded-2xl border p-5 text-left transition ${
                                            fulfilment.method === 'collection'
                                                ? 'border-wine bg-petal/70'
                                                : 'border-wine/15 hover:border-wine/40'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2 text-sm font-semibold">
                                            <Store className="text-wine h-4 w-4" />
                                            Collect in person
                                        </span>
                                        <span className="mt-1.5 block text-xs opacity-60">
                                            Free. Ready in 1–2 days.
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFulfilment({
                                                method: 'delivery',
                                                zoneId: zones[0]?.slug ?? '',
                                            })
                                        }
                                        aria-pressed={
                                            fulfilment.method === 'delivery'
                                        }
                                        className={`rounded-2xl border p-5 text-left transition ${
                                            fulfilment.method === 'delivery'
                                                ? 'border-wine bg-petal/70'
                                                : 'border-wine/15 hover:border-wine/40'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2 text-sm font-semibold">
                                            <Truck className="text-wine h-4 w-4" />
                                            Deliver to me
                                        </span>
                                        <span className="mt-1.5 block text-xs opacity-60">
                                            From {formatPrice(5)}, free over{' '}
                                            {formatPrice(shop.freeDeliveryFrom)}
                                            .
                                        </span>
                                    </button>
                                </div>

                                {fulfilment.method === 'collection' ? (
                                    <ul className="mt-6 space-y-3">
                                        {points.map((option) => (
                                            <li key={option.slug}>
                                                <label className="border-wine/15 flex cursor-pointer items-start gap-3 rounded-2xl border p-5">
                                                    <input
                                                        type="radio"
                                                        name="point"
                                                        checked={
                                                            fulfilment.pointId ===
                                                            option.slug
                                                        }
                                                        onChange={() =>
                                                            setFulfilment({
                                                                method: 'collection',
                                                                pointId:
                                                                    option.slug,
                                                            })
                                                        }
                                                        className="accent-wine mt-1"
                                                    />
                                                    <span>
                                                        <span className="block text-sm font-semibold">
                                                            {option.name}
                                                        </span>
                                                        <span className="mt-1 block text-xs opacity-60">
                                                            {option.address}
                                                        </span>
                                                        <span className="mt-1 block text-xs opacity-45">
                                                            {option.hours}
                                                        </span>
                                                    </span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <>
                                        <ul className="mt-6 space-y-3">
                                            {zones.map((option) => (
                                                <li key={option.slug}>
                                                    <label
                                                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                                                            fulfilment.zoneId ===
                                                            option.slug
                                                                ? 'border-wine bg-petal/50'
                                                                : 'border-wine/15 hover:border-wine/40'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="zone"
                                                            checked={
                                                                fulfilment.zoneId ===
                                                                option.slug
                                                            }
                                                            onChange={() =>
                                                                setFulfilment({
                                                                    method: 'delivery',
                                                                    zoneId: option.slug,
                                                                })
                                                            }
                                                            className="accent-wine mt-1"
                                                        />
                                                        <span className="flex-1">
                                                            <span className="flex items-baseline justify-between gap-4">
                                                                <span className="text-sm font-semibold">
                                                                    {
                                                                        option.name
                                                                    }
                                                                </span>
                                                                <span className="text-sm tabular-nums">
                                                                    {subtotal >=
                                                                    shop.freeDeliveryFrom
                                                                        ? 'Free'
                                                                        : formatPrice(
                                                                              option.fee,
                                                                          )}
                                                                </span>
                                                            </span>
                                                            <span className="mt-1 block text-xs opacity-60">
                                                                {option.detail}
                                                            </span>
                                                            <span className="mt-1 block text-xs opacity-45">
                                                                {option.eta}
                                                            </span>
                                                        </span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <Field
                                                    id="address"
                                                    label="Street address"
                                                    value={address}
                                                    onChange={setAddress}
                                                    autoComplete="street-address"
                                                    placeholder="12 Josiah Chinamano Ave"
                                                />
                                            </div>
                                            <Field
                                                id="suburb"
                                                label="Suburb"
                                                required={false}
                                                value={suburb}
                                                onChange={setSuburb}
                                                placeholder="Avondale"
                                            />
                                            <Field
                                                id="city"
                                                label="City"
                                                value={city}
                                                onChange={setCity}
                                                autoComplete="address-level2"
                                                placeholder="Harare"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="mt-6">
                                    <label
                                        htmlFor="notes"
                                        className="block text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45"
                                    >
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={2}
                                        value={notes}
                                        onChange={(event) =>
                                            setNotes(event.target.value)
                                        }
                                        placeholder="Gate code, landmark, a gift message…"
                                        className="border-wine/20 placeholder:text-choc/30 mt-2 w-full rounded-xl border bg-white/70 px-4 py-3 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                    />
                                </div>
                            </Section>

                            <Section step="03" title="Payment">
                                <ul className="space-y-3">
                                    {PAYMENT_METHODS.map((option) => (
                                        <li key={option.id}>
                                            <label
                                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                                                    payment === option.id
                                                        ? 'border-wine bg-petal/50'
                                                        : 'border-wine/15 hover:border-wine/40'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    checked={
                                                        payment === option.id
                                                    }
                                                    onChange={() =>
                                                        setPayment(option.id)
                                                    }
                                                    className="accent-wine mt-1"
                                                />
                                                <span className="flex-1">
                                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                                        {option.label}
                                                        {!option.live ? (
                                                            <span className="border-wine/25 rounded-full border px-2 py-0.5 text-[0.55rem] tracking-[0.16em] uppercase opacity-50">
                                                                Not connected
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                    <span className="mt-1 block text-xs opacity-60">
                                                        {option.detail}
                                                    </span>
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        </form>

                        <aside className="mt-10 lg:mt-0">
                            <div className="bg-petal sticky top-28 rounded-[1.5rem] p-7">
                                <h2 className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                                    Your order
                                </h2>

                                <ul className="mt-5 space-y-3 text-sm">
                                    {items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex justify-between gap-4"
                                        >
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate">
                                                    {item.name}
                                                    {item.quantity > 1
                                                        ? ` × ${item.quantity}`
                                                        : ''}
                                                </span>
                                                <span className="block text-xs opacity-50">
                                                    {item.colourway} ·{' '}
                                                    {item.size}
                                                </span>
                                                {item.custom ? (
                                                    <span className="text-magenta flex items-center gap-1 text-xs">
                                                        <PenLine className="h-3 w-3" />
                                                        Custom print
                                                    </span>
                                                ) : null}
                                            </span>
                                            <span className="tabular-nums">
                                                {formatPrice(
                                                    unitPrice(item) *
                                                        item.quantity,
                                                )}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <dl className="border-wine/15 mt-6 space-y-2.5 border-t pt-5 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="opacity-60">
                                            Subtotal ({count})
                                        </dt>
                                        <dd className="tabular-nums">
                                            {formatPrice(subtotal)}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="opacity-60">
                                            {fulfilment.method === 'collection'
                                                ? 'Collection'
                                                : 'Delivery'}
                                        </dt>
                                        <dd className="tabular-nums">
                                            {fee === 0
                                                ? 'Free'
                                                : formatPrice(fee)}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="border-wine/15 mt-5 flex items-baseline justify-between border-t pt-5">
                                    <span className="text-sm opacity-60">
                                        Total
                                    </span>
                                    <span className="font-display text-2xl font-bold tabular-nums">
                                        {formatPrice(total)}
                                    </span>
                                </div>

                                {fulfilment.method === 'delivery' &&
                                shortfall > 0 ? (
                                    <p className="mt-4 text-xs opacity-55">
                                        Add {formatPrice(shortfall)} more for
                                        free delivery.
                                    </p>
                                ) : null}

                                {zone ? (
                                    <p className="mt-4 flex items-start gap-2 text-xs opacity-55">
                                        <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        {zone.name} · arrives in {zone.eta}
                                    </p>
                                ) : null}

                                {point ? (
                                    <p className="mt-4 flex items-start gap-2 text-xs opacity-55">
                                        <Store className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        {point.name} · {point.hours}
                                    </p>
                                ) : null}

                                {customCount ? (
                                    <p className="text-magenta mt-4 text-xs leading-relaxed">
                                        {customCount}{' '}
                                        {customCount === 1
                                            ? 'piece is'
                                            : 'pieces are'}{' '}
                                        printed to order, adding{' '}
                                        {shop.customLeadTime}.
                                    </p>
                                ) : null}

                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={!ready || submitting}
                                    className="bg-wine hover:bg-wine-soft mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Check className="h-4 w-4" />
                                    {submitting ? 'Placing…' : 'Place order'}
                                </button>

                                {Object.keys(errors).length ? (
                                    <ul className="text-magenta mt-4 space-y-1 text-xs">
                                        {Object.values(errors).map(
                                            (message) => (
                                                <li key={message}>{message}</li>
                                            ),
                                        )}
                                    </ul>
                                ) : null}

                                <p className="mt-3 text-center text-xs opacity-45">
                                    {ready
                                        ? 'No payment provider is connected yet.'
                                        : 'Fill in your details to continue.'}
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>

                <StorefrontFooter />
            </div>
        </>
    );
}
