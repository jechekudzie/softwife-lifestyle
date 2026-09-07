import { Head } from '@inertiajs/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Lockup, Script, SMark } from '@/components/storefront/brand';
import { StorefrontHeader } from '@/components/storefront/header';
import {
    ProductCard,
    useRevealOnEnter,
} from '@/components/storefront/product-card';
import { CATEGORIES, LINES, SIZES } from '@/lib/storefront';

type Sort = 'featured' | 'price-low' | 'price-high' | 'newest';

const SORTS: { value: Sort; label: string }[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest first' },
    { value: 'price-low', label: 'Price, low to high' },
    { value: 'price-high', label: 'Price, high to low' },
];

/** Every colourway offered across the collection, de-duplicated. */
function allColourways() {
    const seen = new Map<string, { name: string; cloth: string }>();

    LINES.forEach((line) =>
        line.colourways.forEach((colourway) => {
            if (!seen.has(colourway.name)) {
                seen.set(colourway.name, {
                    name: colourway.name,
                    cloth: colourway.cloth,
                });
            }
        }),
    );

    return [...seen.values()];
}

function FilterGroup({
    heading,
    children,
}: {
    heading: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-wine/12 border-t py-7 first:border-t-0 first:pt-0">
            <h3 className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                {heading}
            </h3>
            <div className="mt-5">{children}</div>
        </div>
    );
}

export default function ShopIndex() {
    const [colourway, setColourway] = useState<string | null>(null);
    const [size, setSize] = useState<string | null>(null);
    const [sort, setSort] = useState<Sort>('featured');
    const [filtersOpen, setFiltersOpen] = useState(false);

    useRevealOnEnter();

    const colourways = useMemo(allColourways, []);

    const results = useMemo(() => {
        const matched = LINES.filter((line) =>
            colourway
                ? line.colourways.some((option) => option.name === colourway)
                : true,
        );

        const sorted = [...matched];

        if (sort === 'price-low') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-high') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sort === 'newest') {
            sorted.sort(
                (a, b) => Number(b.badge === 'New') - Number(a.badge === 'New'),
            );
        }

        return sorted;
    }, [colourway, sort]);

    const filtered = colourway !== null || size !== null;

    const clear = () => {
        setColourway(null);
        setSize(null);
    };

    const filterRail = (
        <>
            <FilterGroup heading="Category">
                <ul className="space-y-3 text-sm">
                    {CATEGORIES.map((category) => (
                        <li
                            key={category.name}
                            className="flex items-center justify-between gap-4"
                        >
                            <span
                                className={
                                    category.available ? '' : 'opacity-40'
                                }
                            >
                                {category.name}
                            </span>
                            <span className="text-[0.62rem] tracking-[0.2em] uppercase opacity-40">
                                {category.available ? LINES.length : 'Soon'}
                            </span>
                        </li>
                    ))}
                </ul>
            </FilterGroup>

            <FilterGroup heading="Colourway">
                <ul className="flex flex-wrap gap-2.5">
                    {colourways.map((option) => {
                        const on = colourway === option.name;

                        return (
                            <li key={option.name}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setColourway(on ? null : option.name)
                                    }
                                    aria-pressed={on}
                                    title={option.name}
                                    className="block h-7 w-7 rounded-full transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                    style={{
                                        backgroundColor: option.cloth,
                                        boxShadow: on
                                            ? '0 0 0 2px var(--color-wine)'
                                            : '0 0 0 1px rgba(39,24,20,0.16)',
                                    }}
                                >
                                    <span className="sr-only">
                                        {option.name}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </FilterGroup>

            <FilterGroup heading="Size">
                <ul className="flex flex-wrap gap-2">
                    {SIZES.map((option) => {
                        const on = size === option;

                        return (
                            <li key={option}>
                                <button
                                    type="button"
                                    onClick={() => setSize(on ? null : option)}
                                    aria-pressed={on}
                                    className={`min-w-11 rounded-full border px-3 py-2 text-xs font-medium transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none ${
                                        on
                                            ? 'border-wine bg-wine text-white'
                                            : 'border-wine/20 hover:border-wine/50'
                                    }`}
                                >
                                    {option}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </FilterGroup>

            <FilterGroup heading="Price">
                <p className="text-sm opacity-65">$35 – $48</p>
            </FilterGroup>
        </>
    );

    return (
        <>
            <Head title="Shop the collection" />

            <div className="bg-bone text-choc font-sans">
                <StorefrontHeader current="shop" />

                {/* Editorial masthead. */}
                <section
                    className="sw-grain relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24"
                    style={{
                        background:
                            'radial-gradient(120% 120% at 10% 0%, #7d2a44 0%, #6b2137 40%, #55172c 76%, #3d0f20 100%)',
                    }}
                >
                    <SMark
                        color="var(--color-butter)"
                        className="pointer-events-none absolute -right-[6%] -bottom-[38%] hidden h-[150%] lg:block"
                        style={{ opacity: 0.06 }}
                    />

                    <div className="relative mx-auto max-w-6xl px-6">
                        <nav
                            aria-label="Breadcrumb"
                            className="text-butter/55 text-[0.68rem] tracking-[0.22em] uppercase"
                        >
                            <a href="/" className="hover:text-butter">
                                Home
                            </a>
                            <span className="px-2">/</span>
                            <span className="text-butter/85">Shop</span>
                        </nav>

                        <h1 className="font-display text-butter mt-7 text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.02]">
                            Wear your{' '}
                            <Script className="text-[1.35em] text-[var(--color-rose)]">
                                words
                            </Script>
                        </h1>

                        <p className="text-butter/70 mt-6 max-w-[36em] text-sm leading-[1.9]">
                            Every piece carries an affirmation for the season
                            you are in. Heavyweight cotton, printed in small
                            runs, made to be lived in rather than saved.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
                    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
                        {/* Filter rail. */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-28">
                                <div className="flex items-baseline justify-between">
                                    <h2 className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                                        Filters
                                    </h2>
                                    {filtered ? (
                                        <button
                                            type="button"
                                            onClick={clear}
                                            className="text-magenta text-xs font-medium hover:underline"
                                        >
                                            Clear
                                        </button>
                                    ) : null}
                                </div>
                                <div className="mt-6">{filterRail}</div>
                            </div>
                        </aside>

                        <div>
                            <div className="border-wine/12 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                                <p className="text-sm opacity-60">
                                    Showing {results.length} of {LINES.length}{' '}
                                    pieces
                                </p>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFiltersOpen(true)}
                                        className="border-wine/25 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium lg:hidden"
                                    >
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                        Filters
                                    </button>

                                    <label className="flex items-center gap-2 text-sm">
                                        <span className="sr-only">Sort by</span>
                                        <select
                                            value={sort}
                                            onChange={(event) =>
                                                setSort(
                                                    event.target.value as Sort,
                                                )
                                            }
                                            className="border-wine/25 rounded-full border bg-transparent px-4 py-2 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                        >
                                            {SORTS.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </div>

                            {results.length ? (
                                <ul className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                                    {results.map((line, index) => (
                                        <li
                                            key={line.slug}
                                            className="sw-reveal"
                                            style={{
                                                transitionDelay: `${index * 70}ms`,
                                            }}
                                        >
                                            <ProductCard line={line} />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="py-24 text-center">
                                    <p className="font-display text-2xl">
                                        Nothing in that colourway yet.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={clear}
                                        className="bg-wine hover:bg-wine-soft mt-6 rounded-full px-7 py-3 text-sm font-semibold text-white transition"
                                    >
                                        Show everything
                                    </button>
                                </div>
                            )}

                            {/* What is still in production. */}
                            <div className="border-wine/12 mt-16 border-t pt-10">
                                <ul className="grid gap-4 sm:grid-cols-2">
                                    {CATEGORIES.filter(
                                        (category) => !category.available,
                                    ).map((category) => (
                                        <li
                                            key={category.name}
                                            className="bg-petal rounded-[1.25rem] px-7 py-8"
                                        >
                                            <p className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                                                In production
                                            </p>
                                            <h3 className="font-display mt-2 text-xl font-bold">
                                                {category.name}
                                            </h3>
                                            <p className="mt-2 max-w-[26em] text-sm leading-relaxed opacity-65">
                                                {category.blurb}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filter sheet, small screens. */}
                {filtersOpen ? (
                    <div className="fixed inset-0 z-60 lg:hidden">
                        <button
                            type="button"
                            aria-label="Close filters"
                            onClick={() => setFiltersOpen(false)}
                            className="absolute inset-0 bg-[rgba(39,24,20,0.5)]"
                        />
                        <div className="bg-bone absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-[1.5rem] px-6 pt-6 pb-10">
                            <div className="flex items-center justify-between">
                                <h2 className="font-display text-lg font-bold">
                                    Filters
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setFiltersOpen(false)}
                                    className="-m-2 p-2"
                                >
                                    <X className="h-5 w-5" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </div>
                            <div className="mt-6">{filterRail}</div>
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(false)}
                                className="bg-wine mt-8 w-full rounded-full py-4 text-sm font-semibold text-white"
                            >
                                Show {results.length} pieces
                            </button>
                        </div>
                    </div>
                ) : null}

                <footer className="bg-wine text-butter mt-8 px-6 py-16 text-center">
                    <Lockup
                        color="var(--color-butter)"
                        className="mx-auto w-44"
                        align="center"
                    />
                    <p className="mt-6 text-xs tracking-[0.28em] uppercase opacity-45">
                        Est. 2025
                    </p>
                </footer>
            </div>
        </>
    );
}
