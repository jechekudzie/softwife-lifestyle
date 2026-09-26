import { Head, Link } from '@inertiajs/react';
import { Check, PenLine, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { StorefrontFooter } from '@/components/storefront/footer';
import { StorefrontHeader } from '@/components/storefront/header';
import { Photo } from '@/components/storefront/photo';
import {
    ProductCard,
    useRevealOnEnter,
} from '@/components/storefront/product-card';
import { MAX_CUSTOM, useBuyForm } from '@/lib/buy';
import { CUSTOM_AFFIRMATION_FEE, CUSTOM_LEAD_TIME } from '@/lib/cart';
import { formatPrice, SIZES, type AffirmationLine } from '@/lib/storefront';

const LABEL =
    'text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45';

export default function ShowProduct({
    line,
    related,
}: {
    line: AffirmationLine;
    related: AffirmationLine[];
}) {
    const buy = useBuyForm(line);
    useRevealOnEnter();

    /**
     * The frames for the chosen cloth, plus anything untagged. Unlike the
     * card this does not advance on a timer: someone on this page is looking
     * deliberately, so they move it themselves.
     */
    const frames = useMemo(() => {
        const matched = line.images.filter(
            (image) => !image.colourway || image.colourway === buy.active.name,
        );

        return matched.length ? matched : line.images;
    }, [line.images, buy.active.name]);

    const [frame, setFrame] = useState(0);
    const shown = frames[Math.min(frame, frames.length - 1)];

    return (
        <>
            <Head title={`${line.name} — ${line.phrase}`} />

            <div className="bg-bone text-choc font-sans">
                <StorefrontHeader current="shop" />

                <div className="mx-auto max-w-6xl px-6 pt-28 pb-20 sm:pt-36">
                    <nav
                        aria-label="Breadcrumb"
                        className="text-wine/55 text-[0.68rem] tracking-[0.22em] uppercase"
                    >
                        <Link href="/shop" className="hover:text-wine">
                            Shop
                        </Link>
                        <span className="px-2">/</span>
                        <span className="text-wine/85">{line.name}</span>
                    </nav>

                    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
                        <div>
                            <div
                                className="overflow-hidden rounded-[1.5rem]"
                                style={{ backgroundColor: line.field }}
                            >
                                {shown ? (
                                    <Photo
                                        key={shown.src}
                                        src={shown.src}
                                        alt={
                                            shown.alt ??
                                            `${line.name} in ${buy.active.name}`
                                        }
                                        sizes="(min-width: 1024px) 52vw, 92vw"
                                        priority
                                        className="aspect-[4/5] w-full object-cover"
                                    />
                                ) : null}
                            </div>

                            {frames.length > 1 ? (
                                <ul className="mt-4 grid grid-cols-5 gap-3">
                                    {frames.map((image, index) => (
                                        <li key={image.src}>
                                            <button
                                                type="button"
                                                onClick={() => setFrame(index)}
                                                aria-current={index === frame}
                                                className="block w-full overflow-hidden rounded-xl transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                                style={{
                                                    boxShadow:
                                                        index === frame
                                                            ? '0 0 0 2px var(--color-wine)'
                                                            : '0 0 0 1px rgba(39,24,20,0.14)',
                                                }}
                                            >
                                                <Photo
                                                    src={image.src}
                                                    alt=""
                                                    sizes="9rem"
                                                    widths={[400]}
                                                    className="aspect-[4/5] w-full object-cover"
                                                />
                                                <span className="sr-only">
                                                    View photograph {index + 1}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>

                        <div>
                            {line.badge ? (
                                <p className="text-magenta text-[0.6rem] font-semibold tracking-[0.24em] uppercase">
                                    {line.badge}
                                </p>
                            ) : null}

                            <h1 className="font-display mt-2 text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] font-bold">
                                {line.name}
                            </h1>

                            <p className="font-display text-wine mt-2 text-lg italic">
                                {line.phrase}
                            </p>

                            <p className="mt-5 flex items-baseline gap-3">
                                {line.wasPrice ? (
                                    <span className="text-lg line-through opacity-35">
                                        {formatPrice(line.wasPrice)}
                                    </span>
                                ) : null}
                                <span
                                    className={`font-display text-2xl font-bold ${
                                        line.wasPrice ? 'text-magenta' : ''
                                    }`}
                                >
                                    {formatPrice(buy.total)}
                                </span>
                            </p>

                            <p className="mt-7 max-w-[38em] text-sm leading-[1.9] opacity-70">
                                {line.affirmation}
                            </p>

                            <fieldset className="mt-9">
                                <legend className={LABEL}>
                                    Colourway · {buy.active.name}
                                </legend>
                                <ul className="mt-3 flex flex-wrap gap-2.5">
                                    {line.colourways.map((option, index) => (
                                        <li key={option.name}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    buy.setColourway(index);
                                                    setFrame(0);
                                                }}
                                                aria-pressed={
                                                    index === buy.colourway
                                                }
                                                title={option.name}
                                                className="block h-9 w-9 rounded-full transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                                style={{
                                                    backgroundColor:
                                                        option.cloth,
                                                    boxShadow:
                                                        index === buy.colourway
                                                            ? '0 0 0 2px var(--color-wine)'
                                                            : '0 0 0 1px rgba(39,24,20,0.18)',
                                                }}
                                            >
                                                <span className="sr-only">
                                                    {option.name}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </fieldset>

                            <fieldset className="mt-8">
                                <legend className={LABEL}>Size</legend>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {SIZES.map((option) => (
                                        <li key={option}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    buy.setSize(option)
                                                }
                                                aria-pressed={
                                                    buy.size === option
                                                }
                                                className={`min-w-13 rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none ${
                                                    buy.size === option
                                                        ? 'border-wine bg-wine text-white'
                                                        : 'border-wine/20 hover:border-wine/60'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </fieldset>

                            <div className="border-wine/15 mt-8 rounded-2xl border p-5">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={buy.wantsCustom}
                                        onChange={(event) =>
                                            buy.setWantsCustom(
                                                event.target.checked,
                                            )
                                        }
                                        className="accent-magenta mt-0.5 h-4 w-4"
                                    />
                                    <span>
                                        <span className="flex items-center gap-2 text-sm font-semibold">
                                            <PenLine className="text-magenta h-4 w-4" />
                                            Print my own affirmation
                                        </span>
                                        <span className="mt-1 block text-xs leading-relaxed opacity-60">
                                            Your words in the same layout,
                                            printed to order. Adds{' '}
                                            {formatPrice(
                                                CUSTOM_AFFIRMATION_FEE,
                                            )}{' '}
                                            and {CUSTOM_LEAD_TIME} to your
                                            delivery.
                                        </span>
                                    </span>
                                </label>

                                {buy.wantsCustom ? (
                                    <div className="mt-4">
                                        <label
                                            htmlFor="custom-affirmation"
                                            className="sr-only"
                                        >
                                            Your affirmation
                                        </label>
                                        <textarea
                                            id="custom-affirmation"
                                            rows={3}
                                            maxLength={MAX_CUSTOM}
                                            value={buy.custom}
                                            onChange={(event) =>
                                                buy.setCustom(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="In my soft era because…"
                                            className="border-wine/20 placeholder:text-choc/35 w-full rounded-xl border bg-white/70 px-4 py-3 text-sm leading-relaxed focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                        />
                                        <p className="mt-2 flex items-center justify-between text-xs opacity-50">
                                            <span>
                                                {buy.customText.length < 8
                                                    ? 'At least 8 characters.'
                                                    : 'We will send a proof before printing.'}
                                            </span>
                                            <span className="tabular-nums">
                                                {buy.custom.length}/{MAX_CUSTOM}
                                            </span>
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                onClick={buy.submit}
                                disabled={!buy.ready}
                                className="bg-magenta hover:bg-magenta-deep mt-8 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {buy.added ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Added to your bag
                                    </>
                                ) : (
                                    `Add to bag · ${formatPrice(buy.total)}`
                                )}
                            </button>

                            {!buy.size ? (
                                <p className="mt-3 text-center text-xs opacity-50">
                                    Choose a size first.
                                </p>
                            ) : null}

                            <p className="border-wine/12 mt-7 flex items-start gap-3 border-t pt-6 text-xs leading-relaxed opacity-60">
                                <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                                Delivered across Zimbabwe and the region, or
                                collect in Harare. Choose at checkout.
                            </p>
                        </div>
                    </div>

                    {related.length ? (
                        <section className="border-wine/12 mt-24 border-t pt-14">
                            <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)]">
                                The rest of the wardrobe
                            </h2>

                            <ul className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {related.map((item, index) => (
                                    <li
                                        key={item.slug}
                                        className="sw-reveal"
                                        style={{
                                            transitionDelay: `${index * 70}ms`,
                                        }}
                                    >
                                        <ProductCard line={item} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}
                </div>

                <StorefrontFooter />
            </div>
        </>
    );
}
