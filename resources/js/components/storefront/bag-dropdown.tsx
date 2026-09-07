import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Garment, Print } from '@/components/storefront/brand';
import { CUSTOM_LEAD_TIME, unitPrice, useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/storefront';

/** The bag, as a panel hanging off the header button. */
export function BagDropdown({ onClose }: { onClose: () => void }) {
    const { items, subtotal, count, remove, setQuantity } = useCart();
    const panel = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const onClick = (event: MouseEvent) => {
            if (
                panel.current &&
                !panel.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('keydown', onKey);
        // Deferred so the click that opened the panel does not close it.
        const timer = window.setTimeout(
            () => document.addEventListener('mousedown', onClick),
            0,
        );

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
            window.clearTimeout(timer);
        };
    }, [onClose]);

    return (
        <div
            ref={panel}
            role="dialog"
            aria-label="Your bag"
            className="bg-bone text-choc absolute top-full right-0 mt-3 w-[min(92vw,24rem)] overflow-hidden rounded-[1.25rem] shadow-[0_40px_80px_-32px_rgba(39,24,20,0.6)]"
        >
            <div className="border-wine/12 flex items-baseline justify-between border-b px-5 py-4">
                <h2 className="font-display text-lg font-bold">Your bag</h2>
                <span className="text-xs opacity-50">
                    {count} {count === 1 ? 'piece' : 'pieces'}
                </span>
            </div>

            {items.length ? (
                <>
                    <ul className="max-h-[22rem] divide-y divide-[rgba(107,33,55,0.10)] overflow-y-auto">
                        {items.map((item) => (
                            <li key={item.id} className="flex gap-3 px-5 py-4">
                                <span
                                    className="h-20 w-16 shrink-0 overflow-hidden rounded-xl"
                                    style={{ backgroundColor: item.cloth }}
                                >
                                    {item.photo ? (
                                        <img
                                            src={item.photo}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full items-center justify-center p-1.5">
                                            <Garment
                                                cloth={item.cloth}
                                                shadow={false}
                                            >
                                                <Print
                                                    name={item.name}
                                                    affirmation={
                                                        item.custom ?? ''
                                                    }
                                                    ink={item.ink}
                                                />
                                            </Garment>
                                        </span>
                                    )}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="font-display text-sm font-bold">
                                        {item.name}
                                    </p>
                                    <p className="mt-0.5 text-xs opacity-55">
                                        {item.colourway} · {item.size}
                                    </p>
                                    {item.custom ? (
                                        <p className="text-magenta mt-1 truncate text-xs">
                                            Custom: “{item.custom}”
                                        </p>
                                    ) : null}

                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <span className="border-wine/20 flex items-center gap-1 rounded-full border">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuantity(
                                                        item.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="p-1.5 transition hover:opacity-60"
                                            >
                                                <Minus className="h-3 w-3" />
                                                <span className="sr-only">
                                                    Fewer
                                                </span>
                                            </button>
                                            <span className="min-w-4 text-center text-xs tabular-nums">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setQuantity(
                                                        item.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="p-1.5 transition hover:opacity-60"
                                            >
                                                <Plus className="h-3 w-3" />
                                                <span className="sr-only">
                                                    More
                                                </span>
                                            </button>
                                        </span>

                                        <span className="text-sm font-medium tabular-nums">
                                            {formatPrice(
                                                unitPrice(item) * item.quantity,
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => remove(item.id)}
                                            className="p-1 opacity-40 transition hover:opacity-100"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span className="sr-only">
                                                Remove {item.name}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="border-wine/12 border-t px-5 py-4">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm opacity-60">Subtotal</span>
                            <span className="font-display text-xl font-bold tabular-nums">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                        <p className="mt-1 text-xs opacity-45">
                            Delivery calculated at checkout.
                        </p>

                        <a
                            href="/cart"
                            className="bg-wine hover:bg-wine-soft mt-4 block rounded-full py-3.5 text-center text-sm font-semibold text-white transition"
                        >
                            View bag and checkout
                        </a>
                    </div>
                </>
            ) : (
                <div className="px-5 py-12 text-center">
                    <ShoppingBag className="mx-auto h-6 w-6 opacity-25" />
                    <p className="mt-4 text-sm opacity-60">Nothing here yet.</p>
                    <a
                        href="/shop"
                        className="border-wine/25 hover:bg-wine mt-5 inline-block rounded-full border px-6 py-3 text-sm font-semibold transition hover:text-white"
                    >
                        Shop the collection
                    </a>
                </div>
            )}
        </div>
    );
}
