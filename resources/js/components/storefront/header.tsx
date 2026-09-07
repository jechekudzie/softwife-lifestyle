import {
    Clapperboard,
    Search,
    Shirt,
    ShoppingBag,
    Sparkles,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BagDropdown } from '@/components/storefront/bag-dropdown';
import { SMark, Wordmark } from '@/components/storefront/brand';
import { useCart } from '@/lib/cart';
import { formatPrice, LINES } from '@/lib/storefront';

/**
 * The storefront header.
 *
 * Below `sm` the nav collapses to icons rather than dropping links, so every
 * destination stays reachable on a phone without a hamburger.
 */
const NAV = [
    { href: '/shop', key: 'shop', label: 'Shop', icon: Shirt },
    {
        href: '/#lifestyle',
        key: 'lifestyle',
        label: 'Lifestyle',
        icon: Clapperboard,
    },
    {
        href: '/#affirmations',
        key: 'affirmations',
        label: 'Affirmations',
        icon: Sparkles,
    },
];

/** Searches the catalogue by line name, printed words and colourway. */
function searchCatalogue(query: string) {
    const term = query.trim().toLowerCase();

    if (term.length < 2) {
        return [];
    }

    return LINES.filter((line) =>
        [
            line.name,
            line.era,
            line.affirmation,
            ...line.colourways.map((colourway) => colourway.name),
        ]
            .join(' ')
            .toLowerCase()
            .includes(term),
    );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
    const [query, setQuery] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const results = useMemo(() => searchCatalogue(query), [query]);

    useEffect(() => {
        input.current?.focus();

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const searched = query.trim().length >= 2;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Search the collection"
            className="fixed inset-0 z-[60]"
        >
            <button
                type="button"
                aria-label="Close search"
                onClick={onClose}
                className="absolute inset-0 bg-[rgba(39,24,20,0.55)] backdrop-blur-sm"
            />

            <div className="bg-bone relative mx-auto mt-0 max-h-[88vh] w-full overflow-y-auto rounded-b-[1.5rem] px-6 pt-6 pb-8 sm:mt-24 sm:max-w-2xl sm:rounded-[1.5rem]">
                <div className="border-wine/15 flex items-center gap-3 border-b pb-4">
                    <Search className="text-wine h-5 w-5 shrink-0" />
                    <label htmlFor="site-search" className="sr-only">
                        Search the collection
                    </label>
                    <input
                        id="site-search"
                        ref={input}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search a line, a colour, a word…"
                        className="placeholder:text-choc/35 flex-1 bg-transparent text-lg outline-none"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        className="-m-2 rounded-full p-2 transition hover:opacity-60"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close search</span>
                    </button>
                </div>

                {searched ? (
                    results.length ? (
                        <ul className="mt-6 space-y-2">
                            {results.map((line) => (
                                <li key={line.slug}>
                                    <a
                                        href="/shop"
                                        className="hover:bg-petal flex items-center gap-4 rounded-2xl p-3 transition"
                                    >
                                        <span
                                            className="h-16 w-14 shrink-0 overflow-hidden rounded-xl"
                                            style={{
                                                backgroundColor: line.field,
                                            }}
                                        >
                                            {line.photo ? (
                                                <img
                                                    src={line.photo}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : null}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="font-display block text-base font-bold">
                                                {line.name}
                                            </span>
                                            <span className="mt-0.5 block truncate text-xs opacity-55">
                                                {line.pictured}
                                            </span>
                                        </span>
                                        <span className="text-sm font-medium">
                                            {formatPrice(line.price)}
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-12 text-center text-sm opacity-60">
                            Nothing matches “{query.trim()}”. Try a line name, a
                            colour, or a word from the print.
                        </p>
                    )
                ) : (
                    <div className="pt-6">
                        <p className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                            The lines
                        </p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {LINES.map((line) => (
                                <li key={line.slug}>
                                    <button
                                        type="button"
                                        onClick={() => setQuery(line.name)}
                                        className="border-wine/20 hover:border-wine rounded-full border px-4 py-2 text-sm transition"
                                    >
                                        {line.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export function StorefrontHeader({
    current,
    shadow = true,
}: {
    current?: 'shop' | 'lifestyle' | 'affirmations';
    shadow?: boolean;
}) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [bagOpen, setBagOpen] = useState(false);
    const { count } = useCart();

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
                <div
                    className="text-wine mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-3 py-2 transition-shadow duration-500 sm:gap-6 sm:px-6 sm:py-2.5"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(255,251,247,0.94) 0%, rgba(253,238,244,0.9) 100%)',
                        backdropFilter: 'blur(20px) saturate(140%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
                        border: '1px solid rgba(107, 33, 55, 0.10)',
                        boxShadow: shadow
                            ? '0 20px 44px -26px rgba(39,24,20,0.8), inset 0 1px 0 rgba(255,255,255,0.7)'
                            : '0 12px 30px -24px rgba(39,24,20,0.55), inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}
                >
                    <a
                        href="/"
                        className="flex shrink-0 items-center gap-2.5"
                        aria-label="Softwife Lifestyle home"
                    >
                        <SMark
                            color="var(--color-magenta)"
                            className="h-6 w-6"
                        />
                        <Wordmark
                            color="currentColor"
                            className="hidden h-3 w-24 sm:block"
                        />
                    </a>

                    <nav className="flex items-center gap-1 sm:gap-9">
                        {NAV.map(({ href, key, label, icon: Icon }) => (
                            <a
                                key={key}
                                href={href}
                                aria-current={
                                    current === key ? 'page' : undefined
                                }
                                className={`flex items-center rounded-full p-2.5 transition hover:opacity-60 focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none sm:p-0 sm:text-sm ${
                                    current === key
                                        ? 'font-semibold opacity-100'
                                        : 'font-medium'
                                }`}
                            >
                                <Icon
                                    aria-hidden="true"
                                    className="h-[1.15rem] w-[1.15rem] sm:hidden"
                                />
                                <span className="sr-only sm:not-sr-only">
                                    {label}
                                </span>
                            </a>
                        ))}
                    </nav>

                    <div className="relative flex shrink-0 items-center gap-0.5 sm:gap-1">
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            className="rounded-full p-2.5 transition hover:opacity-60 focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                        >
                            <Search className="h-[1.15rem] w-[1.15rem] sm:h-4 sm:w-4" />
                            <span className="sr-only">
                                Search the collection
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setBagOpen((open) => !open)}
                            aria-expanded={bagOpen}
                            className="bg-wine hover:bg-wine-soft flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none sm:gap-2 sm:px-4"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            <span className="tabular-nums">{count}</span>
                            <span className="sr-only">items in your bag</span>
                        </button>

                        {bagOpen ? (
                            <BagDropdown onClose={() => setBagOpen(false)} />
                        ) : null}
                    </div>
                </div>
            </header>

            {searchOpen ? (
                <SearchOverlay onClose={() => setSearchOpen(false)} />
            ) : null}
        </>
    );
}
