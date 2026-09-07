import { Heart, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AddToBag } from '@/components/storefront/add-to-bag';
import { Garment, Print } from '@/components/storefront/brand';
import { formatPrice, type AffirmationLine } from '@/lib/storefront';

/** Adds `sw-in` to every `.sw-reveal` element as it enters the viewport. */
export function useRevealOnEnter() {
    useEffect(() => {
        const targets = document.querySelectorAll('.sw-reveal');

        if (!('IntersectionObserver' in window)) {
            targets.forEach((el) => el.classList.add('sw-in'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('sw-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -12% 0px' },
        );

        targets.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);
}

/**
 * The one orchestrated moment on the page. The affirmation opens at poster
 * scale, moves through the four lines, then settles onto the garment as the
 * reader scrolls. The line strip beneath doubles as the carousel control.
 */

/**
 * A product card, shared by the homepage rail and the shop grid.
 *
 * Where a line has no photography the garment renders instead, and the
 * colourway swatch recolours it live.
 */
export function ProductCard({ line }: { line: AffirmationLine }) {
    const [colourway, setColourway] = useState(0);
    const [saved, setSaved] = useState(false);
    const [adding, setAdding] = useState(false);
    const active = line.colourways[colourway];

    return (
        <article className="group flex h-full flex-col">
            <div className="relative overflow-hidden rounded-[1.25rem] bg-white shadow-[0_26px_50px_-30px_rgba(39,24,20,0.5)]">
                {line.photo ? (
                    <img
                        src={line.photo}
                        alt={`${line.name} affirmation tee`}
                        className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="flex aspect-[4/5] w-full items-center justify-center px-8"
                        style={{ backgroundColor: line.field }}
                    >
                        <div className="w-[86%] transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                            <Garment cloth={active.cloth}>
                                <Print
                                    name={line.name}
                                    affirmation={line.affirmation}
                                    ink={active.ink}
                                />
                            </Garment>
                        </div>
                    </div>
                )}

                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(39,24,20,0.30) 0%, rgba(39,24,20,0) 38%, rgba(39,24,20,0.18) 100%)',
                    }}
                />

                <div
                    className="absolute inset-x-0 top-0 flex items-start justify-between p-5"
                    style={{
                        color: line.photo ? '#ffffff' : 'var(--color-choc)',
                    }}
                >
                    <span className="text-[0.58rem] font-medium tracking-[0.24em] uppercase">
                        {line.badge ?? 'Affirmation tee'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setSaved((value) => !value)}
                        aria-pressed={saved}
                        className="-m-2 rounded-full p-2 transition focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:outline-none"
                        style={{ opacity: saved ? 1 : 0.75 }}
                    >
                        <Heart
                            className="h-4 w-4"
                            fill={saved ? 'currentColor' : 'none'}
                        />
                        <span className="sr-only">
                            {saved ? 'Saved' : 'Save'} {line.name}
                        </span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="bg-wine hover:bg-wine-soft absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full text-white opacity-0 transition duration-300 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:outline-none"
                >
                    <ShoppingBag className="h-4 w-4" />
                    <span className="sr-only">Add {line.name} to bag</span>
                </button>
            </div>

            <div className="mt-4 flex flex-1 flex-col px-1">
                <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-bold">
                        {line.name}
                    </h3>
                    <p className="flex items-baseline gap-2 text-sm">
                        {line.wasPrice ? (
                            <span className="line-through opacity-40">
                                {formatPrice(line.wasPrice)}
                            </span>
                        ) : null}
                        <span
                            className={
                                line.wasPrice
                                    ? 'text-magenta font-semibold'
                                    : 'font-medium'
                            }
                        >
                            {formatPrice(line.price)}
                        </span>
                    </p>
                </div>

                <p className="mt-1 text-xs tracking-wide opacity-50">
                    {line.photo
                        ? line.pictured
                        : `${active.name} · affirmation print`}
                </p>

                <ul className="mt-3.5 flex items-center gap-2">
                    {line.colourways.map((option, index) => (
                        <li key={option.name}>
                            <button
                                type="button"
                                onClick={() => setColourway(index)}
                                aria-pressed={index === colourway}
                                className="block h-4 w-4 rounded-full border transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                style={{
                                    backgroundColor: option.cloth,
                                    borderColor:
                                        index === colourway
                                            ? 'var(--color-wine)'
                                            : 'rgba(39,24,20,0.18)',
                                    borderWidth:
                                        index === colourway ? '2px' : '1px',
                                }}
                            >
                                <span className="sr-only">{option.name}</span>
                            </button>
                        </li>
                    ))}
                    <li className="ml-1 text-[0.68rem] opacity-40">
                        {line.colourways.length}
                    </li>
                </ul>

                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="border-wine/25 hover:bg-wine mt-5 w-full rounded-full border py-3 text-sm font-semibold transition duration-300 hover:text-white focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                >
                    Choose your size
                </button>
            </div>

            {adding ? (
                <AddToBag line={line} onClose={() => setAdding(false)} />
            ) : null}
        </article>
    );
}
