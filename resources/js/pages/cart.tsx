import { Head } from '@inertiajs/react';
import { Minus, PenLine, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Garment, Print, Script } from '@/components/storefront/brand';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import {
    CUSTOM_AFFIRMATION_FEE,
    CUSTOM_LEAD_TIME,
    unitPrice,
    useCart,
} from '@/lib/cart';
import { formatPrice } from '@/lib/storefront';

export default function Cart() {
    const { items, subtotal, count, customCount, remove, setQuantity, clear } =
        useCart();

    return (
        <>
            <Head title="Your bag" />

            <div className="bg-bone text-choc font-sans">
                <StorefrontHeader />

                <section
                    className="sw-grain relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20"
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
                            <a href="/" className="hover:text-butter">
                                Home
                            </a>
                            <span className="px-2">/</span>
                            <span className="text-butter/85">Bag</span>
                        </nav>

                        <h1 className="font-display text-butter mt-6 text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.04]">
                            Your{' '}
                            <Script className="text-[1.35em] text-[var(--color-rose)]">
                                bag
                            </Script>
                        </h1>
                        <p className="text-butter/65 mt-4 text-sm">
                            {count
                                ? `${count} ${count === 1 ? 'piece' : 'pieces'}, held for you.`
                                : 'Nothing in it yet.'}
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
                    {items.length ? (
                        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
                            <div>
                                <ul className="divide-y divide-[rgba(107,33,55,0.12)]">
                                    {items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex gap-5 py-6 first:pt-0"
                                        >
                                            <span
                                                className="h-32 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-32"
                                                style={{
                                                    backgroundColor: item.cloth,
                                                }}
                                            >
                                                {item.photo ? (
                                                    <img
                                                        src={item.photo}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex h-full items-center justify-center p-3">
                                                        <Garment
                                                            cloth={item.cloth}
                                                            shadow={false}
                                                        >
                                                            <Print
                                                                name={item.name}
                                                                affirmation={
                                                                    item.custom ??
                                                                    ''
                                                                }
                                                                ink={item.ink}
                                                            />
                                                        </Garment>
                                                    </span>
                                                )}
                                            </span>

                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <div className="flex items-baseline justify-between gap-4">
                                                    <h2 className="font-display text-lg font-bold">
                                                        {item.name}
                                                    </h2>
                                                    <span className="text-sm font-medium tabular-nums">
                                                        {formatPrice(
                                                            unitPrice(item) *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm opacity-55">
                                                    {item.colourway} · Size{' '}
                                                    {item.size}
                                                </p>

                                                {item.custom ? (
                                                    <p className="border-magenta/30 bg-petal/60 mt-3 rounded-xl border px-3 py-2 text-xs leading-relaxed">
                                                        <span className="text-magenta flex items-center gap-1.5 font-semibold">
                                                            <PenLine className="h-3 w-3" />
                                                            Your affirmation
                                                        </span>
                                                        <span className="mt-1 block opacity-75">
                                                            “{item.custom}”
                                                        </span>
                                                        <span className="mt-1 block opacity-50">
                                                            +
                                                            {formatPrice(
                                                                CUSTOM_AFFIRMATION_FEE,
                                                            )}{' '}
                                                            · printed to order
                                                        </span>
                                                    </p>
                                                ) : null}

                                                <div className="mt-auto flex items-center gap-4 pt-4">
                                                    <span className="border-wine/20 flex items-center gap-2 rounded-full border">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQuantity(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="p-2 transition hover:opacity-60"
                                                        >
                                                            <Minus className="h-3.5 w-3.5" />
                                                            <span className="sr-only">
                                                                Fewer
                                                            </span>
                                                        </button>
                                                        <span className="min-w-5 text-center text-sm tabular-nums">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQuantity(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1,
                                                                )
                                                            }
                                                            className="p-2 transition hover:opacity-60"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            <span className="sr-only">
                                                                More
                                                            </span>
                                                        </button>
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            remove(item.id)
                                                        }
                                                        className="flex items-center gap-1.5 text-xs opacity-45 transition hover:opacity-100"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8 flex flex-wrap items-center gap-6">
                                    <a
                                        href="/shop"
                                        className="border-wine/25 hover:bg-wine rounded-full border px-7 py-3 text-sm font-semibold transition hover:text-white"
                                    >
                                        Keep shopping
                                    </a>
                                    <button
                                        type="button"
                                        onClick={clear}
                                        className="text-xs opacity-45 transition hover:opacity-100"
                                    >
                                        Empty the bag
                                    </button>
                                </div>
                            </div>

                            <aside className="mt-12 lg:mt-0">
                                <div className="bg-petal sticky top-28 rounded-[1.5rem] p-7">
                                    <h2 className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                                        Summary
                                    </h2>

                                    <dl className="mt-6 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="opacity-60">
                                                Subtotal
                                            </dt>
                                            <dd className="tabular-nums">
                                                {formatPrice(subtotal)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="opacity-60">
                                                Delivery
                                            </dt>
                                            <dd className="text-xs opacity-60">
                                                At checkout
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="border-wine/15 mt-5 flex items-baseline justify-between border-t pt-5">
                                        <span className="text-sm opacity-60">
                                            Total
                                        </span>
                                        <span className="font-display text-2xl font-bold tabular-nums">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>

                                    {customCount ? (
                                        <p className="text-magenta mt-5 text-xs leading-relaxed">
                                            {customCount}{' '}
                                            {customCount === 1
                                                ? 'piece is'
                                                : 'pieces are'}{' '}
                                            printed to order. We will send a
                                            proof before printing, and delivery
                                            takes {CUSTOM_LEAD_TIME} longer.
                                        </p>
                                    ) : null}

                                    <a
                                        href="/checkout"
                                        className="bg-wine hover:bg-wine-soft mt-6 block w-full rounded-full py-4 text-center text-sm font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                    >
                                        Checkout
                                    </a>
                                    <p className="mt-3 text-center text-xs opacity-45">
                                        Collection or delivery, chosen next.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <ShoppingBag className="mx-auto h-8 w-8 opacity-20" />
                            <p className="font-display mt-6 text-2xl">
                                Your bag is empty.
                            </p>
                            <p className="mx-auto mt-3 max-w-[24em] text-sm opacity-60">
                                Pick the words for the season you are in.
                            </p>
                            <a
                                href="/shop"
                                className="bg-wine hover:bg-wine-soft mt-8 inline-block rounded-full px-9 py-4 text-sm font-semibold text-white transition"
                            >
                                Shop the collection
                            </a>
                        </div>
                    )}
                </section>

                <StorefrontFooter />
            </div>
        </>
    );
}
