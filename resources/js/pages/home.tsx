import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Polaroid, Script, SMark } from '@/components/storefront/brand';
import { StorefrontHeader } from '@/components/storefront/header';
import { StorefrontFooter } from '@/components/storefront/footer';
import { TravellingHero } from '@/components/storefront/travelling-hero';
import {
    ProductCard,
    useRevealOnEnter,
} from '@/components/storefront/product-card';
import {
    InlineReel,
    ReelLightbox,
    ReelTile,
} from '@/components/storefront/reel-tile';
import {
    AFFIRMATIONS,
    CATEGORIES,
    LINES,
    MANIFESTO,
    MANIFESTO_REEL,
    REELS,
    REVIEWS,
    RIBBON,
    RITUAL,
    type Reel,
} from '@/lib/storefront';

/**
 * The hero.
 *
 * One photograph, still, filling the frame: the four prints in one courtyard,
 * shot landscape, so nothing has to be cropped into a shape it was not taken
 * in. It replaced a four-plate rotation that pulled several photographs down
 * before anyone had asked to see them.
 *
 * Phones get a narrower cut of the same frame rather than the centre sliver
 * `cover` would otherwise leave them with.
 */
function Hero() {
    return (
        <section className="bg-petal relative isolate overflow-hidden md:flex md:h-[min(64.5vw,84svh)] md:items-end">
            {/*
             * On a phone the banner is landscape and the screen is not, so it
             * sits whole across the top and the type takes the rose ground
             * beneath it. Nothing is cropped and nothing is buried.
             *
             * From `md` up the shapes agree, and the section takes the frame's
             * own proportions so `cover` has nothing left to crop.
             */}
            <div className="relative pt-20 md:absolute md:inset-0 md:-z-20 md:pt-0">
                <img
                    src="/media/hero/courtyard-1280.jpg"
                    srcSet="/media/hero/courtyard-540.webp 540w, /media/hero/courtyard-780.webp 780w, /media/hero/courtyard-960.webp 960w, /media/hero/courtyard-1280.webp 1280w, /media/hero/courtyard-1698.webp 1698w"
                    sizes="100vw"
                    alt="Four women in Softwife tees in a sunlit courtyard"
                    className="w-full object-cover md:h-full md:object-top"
                    fetchPriority="high"
                    decoding="sync"
                />
            </div>

            {/* A warm scrim under the type, wide screens only. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 hidden md:block"
                style={{
                    background:
                        'linear-gradient(180deg, rgba(39,24,20,0) 28%, rgba(45,20,30,0.42) 54%, rgba(42,16,26,0.80) 74%, rgba(34,10,20,0.94) 100%)',
                }}
            />

            <div className="relative flex w-full flex-col items-center px-6 pt-8 pb-10 text-center sm:px-12 md:h-full md:justify-end md:pt-32 md:pb-8">
                <div className="sw-rise flex flex-col items-center">
                    <h1 className="sr-only">
                        Softwife Lifestyle — affirmation apparel for women
                    </h1>

                    <p className="font-display text-wine md:text-butter text-[clamp(1.5rem,3.6vw,2.8rem)] leading-[1.25] italic">
                        in my soft wife era
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                        <a
                            href="/shop"
                            className="bg-magenta hover:bg-magenta-deep rounded-full px-9 py-4 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:outline-none"
                        >
                            Shop the collection
                        </a>
                        <a
                            href="#story"
                            className="text-wine border-wine/40 hover:bg-wine md:text-butter md:border-butter/55 md:hover:bg-butter rounded-full border px-9 py-4 text-sm font-semibold transition duration-300 hover:text-white focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:outline-none md:hover:text-[var(--color-wine)]"
                        >
                            Our story
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

/** The marquee is parked until the brand wants it back. */
const SHOW_RIBBON = false;

function Ribbon() {
    const strip = [...RIBBON, ...RIBBON, ...RIBBON];

    return (
        <div className="bg-wine text-butter overflow-hidden py-5">
            <div className="sw-marquee-track flex w-max items-center gap-12 whitespace-nowrap">
                {strip.map((phrase, index) => (
                    <span
                        key={`${phrase}-${index}`}
                        className="flex items-center gap-12 text-[0.7rem] font-medium tracking-[0.34em] uppercase"
                    >
                        {phrase}
                        <SMark
                            color="var(--color-blush)"
                            className="h-3 w-3 shrink-0"
                        />
                    </span>
                ))}
            </div>
        </div>
    );
}

function BestSellers() {
    return (
        <section id="shop" className="bg-bone">
            <div className="mx-auto max-w-6xl px-6 pt-12 pb-24 sm:pt-14 sm:pb-32">
                <div className="sw-reveal text-center">
                    <p className="font-display text-[clamp(1.9rem,4.6vw,3.1rem)] leading-[1.12]">
                        Four lines. One wardrobe.
                    </p>
                </div>

                <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
                    {LINES.map((line, index) => (
                        <li
                            key={line.slug}
                            className="sw-reveal"
                            style={{ transitionDelay: `${index * 80}ms` }}
                        >
                            <ProductCard line={line} />
                        </li>
                    ))}
                </ul>

                <div className="mt-14 flex justify-center">
                    <a
                        href="/shop"
                        className="border-wine/25 text-wine hover:bg-wine rounded-full border px-9 py-4 text-sm font-semibold transition duration-300 hover:text-white focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                    >
                        View the full collection
                    </a>
                </div>
            </div>
        </section>
    );
}

/** The product-type axis. Tees ship today; the rest are in production. */
function Categories() {
    return (
        <section className="bg-bone px-6 py-24 sm:py-28">
            <div className="mx-auto max-w-6xl">
                <h2 className="font-display sw-reveal max-w-[13em] text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.1]">
                    One affirmation, worn every way you live.
                </h2>

                {/*
                 * Rules rather than cards. Drawing a tracksuit we have never
                 * photographed was the least honest thing on the page, and
                 * illustrated clip-art beside real photography reads cheap.
                 */}
                <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-3">
                    {CATEGORIES.map((category) => (
                        <li
                            key={category.name}
                            className="sw-reveal border-wine/15 border-t pt-6"
                        >
                            <p className="flex items-baseline gap-3">
                                <span className="font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-none font-bold">
                                    {category.name}
                                </span>
                                {!category.available ? (
                                    <span className="text-xs whitespace-nowrap opacity-45">
                                        from March
                                    </span>
                                ) : null}
                            </p>
                            <p className="mt-3 max-w-[22em] text-sm leading-relaxed opacity-60">
                                {category.blurb}
                            </p>
                            {category.available ? (
                                <a
                                    href="/shop"
                                    className="border-wine/30 hover:border-wine mt-5 inline-block border-b pb-0.5 text-sm font-medium transition"
                                >
                                    Shop tees
                                </a>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** Vertical reel tiles — the lifestyle itself, not a campaign film. */
function Lifestyle({
    onOpenReel,
    reelsPaused,
    audible,
    onToggleSound,
}: {
    onOpenReel: (index: number) => void;
    reelsPaused: boolean;
    audible: string | null;
    onToggleSound: (key: string) => void;
}) {
    return (
        <section id="lifestyle" className="bg-petal px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-6xl">
                <div className="sw-reveal flex flex-wrap items-end justify-between gap-6">
                    <h2 className="font-display max-w-[11em] text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.1]">
                        The Softwife lifestyle
                    </h2>
                    <a
                        href="https://www.instagram.com/_softwife.co"
                        className="text-wine border-wine/40 hover:bg-wine rounded-full border px-6 py-3 text-sm font-semibold transition duration-300 hover:text-white focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                    >
                        Follow on Instagram
                    </a>
                </div>

                <ul className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {REELS.map((reel, index) => (
                        <li
                            key={reel.caption}
                            className="sw-reveal"
                            style={{ transitionDelay: `${index * 80}ms` }}
                        >
                            <ReelTile
                                reel={reel}
                                onOpen={() => onOpenReel(index)}
                                paused={reelsPaused}
                                soundOn={
                                    audible === `reel-${index}` && !reelsPaused
                                }
                                onToggleSound={() =>
                                    onToggleSound(`reel-${index}`)
                                }
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** The brand in its own words — faith, femininity, intentional living. */
function Manifesto({
    onOpenReel,
    reelsPaused,
    soundOn,
    onToggleSound,
}: {
    onOpenReel: () => void;
    reelsPaused: boolean;
    soundOn: boolean;
    onToggleSound: () => void;
}) {
    return (
        <section id="story" className="bg-bone px-6 py-24 sm:py-32">
            <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
                <div className="sw-reveal mx-auto w-full max-w-sm">
                    <Polaroid caption="Est. 2025">
                        <InlineReel
                            reel={MANIFESTO_REEL}
                            onOpen={onOpenReel}
                            paused={reelsPaused}
                            className="aspect-[4/5]"
                            soundOn={soundOn}
                            onToggleSound={onToggleSound}
                        />
                    </Polaroid>
                </div>

                <div className="sw-reveal">
                    <p className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] leading-[1.2]">
                        For the woman who finds beauty in the{' '}
                        <Script className="text-magenta text-[1.35em]">
                            everyday
                        </Script>
                    </p>

                    {MANIFESTO.body.map((paragraph) => (
                        <p
                            key={paragraph.slice(0, 28)}
                            className="mt-6 max-w-[38em] text-sm leading-[1.85] opacity-70"
                        >
                            {paragraph}
                        </p>
                    ))}

                    <p className="font-display mt-9 max-w-[20em] text-lg leading-[1.6] italic">
                        {MANIFESTO.closing}
                    </p>
                </div>
            </div>
        </section>
    );
}

/** How the affirmation gets from the page onto her, in three steps. */
function Ritual() {
    return (
        <section className="bg-petal px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-5xl">
                <p className="font-display sw-reveal mx-auto max-w-[14em] text-center text-[clamp(1.9rem,4.6vw,3rem)] leading-[1.12]">
                    Choose, wear, speak life over yourself.
                </p>

                <ol className="mt-16 grid gap-10 sm:grid-cols-3">
                    {RITUAL.map((step, index) => (
                        <li
                            key={step.title}
                            className="sw-reveal"
                            style={{ transitionDelay: `${index * 90}ms` }}
                        >
                            <span className="bg-wine/20 block h-[2px] w-full">
                                <span className="bg-wine block h-full w-1/3" />
                            </span>
                            <span className="text-wine mt-3 block text-[0.62rem] tabular-nums opacity-45">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-display mt-1 text-xl font-bold">
                                {step.title}
                            </h3>
                            <p className="mt-3 max-w-[22em] text-sm leading-relaxed opacity-65">
                                {step.body}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/** Community voices, signed the way the brand signs its affirmation cards. */
function Reviews() {
    return (
        <section className="bg-rose sw-grain relative px-6 py-24 sm:py-32">
            <div className="relative mx-auto max-w-6xl">
                <p className="font-display sw-reveal mx-auto max-w-[16em] text-center text-[clamp(1.7rem,4vw,2.5rem)] leading-[1.15] text-white">
                    What she said, wearing it.
                </p>

                <ul className="mt-16 grid gap-10 sm:grid-cols-3">
                    {REVIEWS.map((review, index) => (
                        <li
                            key={review.name}
                            className="sw-reveal"
                            style={{ transitionDelay: `${index * 80}ms` }}
                        >
                            <blockquote className="flex h-full flex-col rounded-[1.5rem] bg-white/85 p-8 backdrop-blur-sm">
                                <p className="flex-1 text-sm leading-[1.85] opacity-75">
                                    {review.quote}
                                </p>
                                <cite className="mt-6 not-italic">
                                    <Script className="text-magenta text-2xl">
                                        {review.name}
                                    </Script>
                                </cite>
                            </blockquote>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default function Home({ hero }: { hero?: 'travelling' }) {
    const [landed, setLanded] = useState(false);
    const [lightbox, setLightbox] = useState<{
        reels: Reel[];
        index: number;
    } | null>(null);
    // Only one clip anywhere on the page may carry sound.
    const [audible, setAudible] = useState<string | null>(null);

    const toggleSound = (key: string) =>
        setAudible((current) => (current === key ? null : key));

    useRevealOnEnter();

    useEffect(() => {
        const measure = () =>
            setLanded(window.scrollY > window.innerHeight * 0.82);

        measure();
        window.addEventListener('scroll', measure, { passive: true });

        return () => window.removeEventListener('scroll', measure);
    }, []);

    return (
        <>
            <Head title="Affirmation apparel for women choosing softness" />

            <div className="bg-petal text-choc font-sans">
                <StorefrontHeader shadow={landed} />

                {hero === 'travelling' ? <TravellingHero /> : <Hero />}

                {SHOW_RIBBON ? <Ribbon /> : null}

                <BestSellers />

                <Lifestyle
                    onOpenReel={(index) => setLightbox({ reels: REELS, index })}
                    reelsPaused={lightbox !== null}
                    audible={audible}
                    onToggleSound={toggleSound}
                />

                <Manifesto
                    onOpenReel={() =>
                        setLightbox({ reels: [MANIFESTO_REEL], index: 0 })
                    }
                    reelsPaused={lightbox !== null}
                    soundOn={audible === 'manifesto' && lightbox === null}
                    onToggleSound={() => toggleSound('manifesto')}
                />

                <Ritual />

                <Reviews />

                <section
                    id="affirmations"
                    className="bg-magenta sw-grain relative px-6 py-28 sm:py-36"
                >
                    <div className="relative mx-auto mb-20 max-w-[24em] text-center">
                        <p className="font-display text-butter text-[clamp(1.7rem,4vw,2.4rem)] leading-[1.15]">
                            Words to say back to yourself.
                        </p>
                        <p className="text-butter/60 mt-4 text-sm leading-relaxed">
                            Written for the season you are in, and printed on
                            the pieces you wear through it.
                        </p>
                    </div>

                    <div className="relative mx-auto grid max-w-5xl gap-x-16 gap-y-20 sm:grid-cols-2">
                        {AFFIRMATIONS.map((line, index) => (
                            <blockquote
                                key={line}
                                className="sw-reveal text-butter text-center"
                                style={{ transitionDelay: `${index * 70}ms` }}
                            >
                                <p className="font-display mx-auto max-w-[19em] text-[clamp(1.1rem,2.4vw,1.5rem)] leading-[1.5] italic">
                                    {line}
                                </p>
                                <span
                                    aria-hidden="true"
                                    className="bg-butter/30 mx-auto mt-7 block h-px w-10"
                                />
                            </blockquote>
                        ))}
                    </div>
                </section>

                <section className="bg-petal px-6 py-24 text-center sm:py-28">
                    <h2 className="font-display sw-reveal mx-auto max-w-[14em] text-[clamp(1.6rem,3.8vw,2.5rem)] leading-[1.15]">
                        Affirmations in your inbox, every Sunday.
                    </h2>
                    <form
                        className="sw-reveal mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <label htmlFor="join-email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="join-email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="border-wine/20 placeholder:text-choc/40 flex-1 rounded-full border bg-white/70 px-6 py-3.5 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-wine rounded-full px-8 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-wine-soft)] focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                        >
                            Join us
                        </button>
                    </form>
                </section>

                <Categories />

                <StorefrontFooter />
            </div>

            {lightbox ? (
                <ReelLightbox
                    reels={lightbox.reels}
                    index={lightbox.index}
                    onClose={() => setLightbox(null)}
                    onMove={(index) =>
                        setLightbox((current) =>
                            current ? { ...current, index } : current,
                        )
                    }
                />
            ) : null}
        </>
    );
}
