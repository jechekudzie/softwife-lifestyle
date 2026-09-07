import { Head } from '@inertiajs/react';
import { Gift, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Garment,
    Lockup,
    Polaroid,
    Scallop,
    Script,
    SectionHeading,
    SMark,
} from '@/components/storefront/brand';
import { StorefrontHeader } from '@/components/storefront/header';
import {
    ProductCard,
    useRevealOnEnter,
} from '@/components/storefront/product-card';
import { ReelTile } from '@/components/storefront/reel-tile';
import {
    AFFIRMATIONS,
    CATEGORIES,
    LINES,
    MANIFESTO,
    REELS,
    REVIEWS,
    RIBBON,
    RITUAL,
} from '@/lib/storefront';

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}

export type HeroVariant = 'rose' | 'wine' | 'brown' | 'plum' | 'pale' | 'photo';

type Ground = {
    layer: string;
    /** Optional photographic plate behind the ground. */
    image?: string;
    mark: string;
    body: string;
    rule: string;
    watermark: string;
    watermarkOpacity: number;
    glowA: string;
    glowB: string;
    primaryBg: string;
    primaryText: string;
    secondaryText: string;
};

/**
 * One world per affirmation line. The hero cycles through them with the lines,
 * so each era arrives in its own colour.
 */
const HERO_GROUNDS: Record<HeroVariant, Ground> = {
    wine: {
        layer: 'radial-gradient(120% 110% at 8% 0%, #7d2a44 0%, #6b2137 38%, #55172c 74%, #3d0f20 100%)',
        mark: 'var(--color-butter)',
        body: 'rgba(242, 231, 183, 0.72)',
        rule: 'var(--color-butter)',
        watermark: 'var(--color-butter)',
        watermarkOpacity: 0.07,
        glowA: 'var(--color-plum)',
        glowB: 'var(--color-magenta)',
        primaryBg: 'var(--color-butter)',
        primaryText: 'var(--color-wine)',
        secondaryText: 'var(--color-butter)',
    },
    rose: {
        layer: 'radial-gradient(120% 105% at 4% 2%, #fffaf3 0%, #fdf0f5 34%, #f8dde9 72%, #f2cfdf 100%)',
        mark: 'var(--color-wine)',
        body: 'rgba(39, 24, 20, 0.65)',
        rule: 'var(--color-wine)',
        watermark: 'var(--color-wine)',
        watermarkOpacity: 0.05,
        glowA: 'var(--color-butter)',
        glowB: 'var(--color-rose)',
        primaryBg: 'var(--color-wine)',
        primaryText: '#ffffff',
        secondaryText: 'var(--color-wine)',
    },
    plum: {
        layer: 'radial-gradient(122% 112% at 8% 0%, #6d3062 0%, #5a2450 38%, #451a3e 76%, #30112b 100%)',
        mark: 'var(--color-butter)',
        body: 'rgba(242, 231, 183, 0.70)',
        rule: 'var(--color-butter)',
        watermark: 'var(--color-butter)',
        watermarkOpacity: 0.07,
        glowA: 'var(--color-magenta)',
        glowB: 'var(--color-rose)',
        primaryBg: 'var(--color-butter)',
        primaryText: '#45193d',
        secondaryText: 'var(--color-butter)',
    },
    brown: {
        layer: 'radial-gradient(125% 115% at 10% 0%, #4a3125 0%, #37261b 40%, #2b1c14 76%, #1e130d 100%)',
        mark: 'var(--color-butter)',
        body: 'rgba(242, 231, 183, 0.70)',
        rule: 'var(--color-butter)',
        watermark: 'var(--color-butter)',
        watermarkOpacity: 0.06,
        glowA: '#8a5a34',
        glowB: 'var(--color-butter)',
        primaryBg: 'var(--color-butter)',
        primaryText: 'var(--color-choc)',
        secondaryText: 'var(--color-butter)',
    },
    pale: {
        layer: 'radial-gradient(120% 105% at 6% 2%, #ffffff 0%, #fdfaf6 40%, #f7f1ea 78%, #f2e9e0 100%)',
        mark: 'var(--color-wine)',
        body: 'rgba(39, 24, 20, 0.60)',
        rule: 'var(--color-wine)',
        watermark: 'var(--color-choc)',
        watermarkOpacity: 0.04,
        glowA: 'var(--color-butter)',
        glowB: 'var(--color-petal-deep)',
        primaryBg: 'var(--color-wine)',
        primaryText: '#ffffff',
        secondaryText: 'var(--color-choc)',
    },
    photo: {
        layer: 'linear-gradient(100deg, rgba(39,24,20,0.90) 0%, rgba(39,24,20,0.66) 44%, rgba(39,24,20,0.34) 100%)',
        image: '/media/soft-babe-plum-standing.jpg',
        mark: '#ffffff',
        body: 'rgba(255, 255, 255, 0.75)',
        rule: '#ffffff',
        watermark: '#ffffff',
        watermarkOpacity: 0.06,
        glowA: 'transparent',
        glowB: 'transparent',
        primaryBg: '#ffffff',
        primaryText: 'var(--color-choc)',
        secondaryText: '#ffffff',
    },
};

const INK_TRANSITION =
    'color 900ms ease, background-color 900ms ease, border-color 900ms ease';

function Hero({ variant }: { variant?: HeroVariant }) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduced = usePrefersReducedMotion();

    useEffect(() => {
        if (reduced || paused || variant) {
            return;
        }

        const timer = window.setInterval(
            () => setActive((current) => (current + 1) % LINES.length),
            6000,
        );

        return () => window.clearInterval(timer);
    }, [reduced, paused, variant]);

    const line = LINES[active];
    const next = LINES[(active + 1) % LINES.length];
    // A preview route locks one ground; otherwise it follows the garment.
    const key: HeroVariant = variant ?? line.ground;
    const ground = HERO_GROUNDS[key];

    return (
        <section className="sw-grain relative overflow-hidden lg:h-[100svh] lg:min-h-[42rem]">
            {/* Grounds are stacked and crossfaded, so gradients can animate. */}
            {(Object.keys(HERO_GROUNDS) as HeroVariant[]).map((name) => {
                const item = HERO_GROUNDS[name];

                return (
                    <div
                        key={name}
                        aria-hidden="true"
                        className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
                        style={{ opacity: name === key ? 1 : 0 }}
                    >
                        {item.image ? (
                            <img
                                src={item.image}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                                style={{ objectPosition: '30% 30%' }}
                                loading="lazy"
                            />
                        ) : null}
                        <div
                            className="absolute inset-0"
                            style={{ background: item.layer }}
                        />
                    </div>
                );
            })}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-[24vh] -left-[12vw] h-[52vh] w-[52vh] rounded-full opacity-45 blur-[130px] transition-colors duration-[1400ms]"
                style={{ backgroundColor: ground.glowA }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-22vh] left-[24vw] h-[46vh] w-[46vh] rounded-full opacity-35 blur-[140px] transition-colors duration-[1400ms]"
                style={{ backgroundColor: ground.glowB }}
            />

            <SMark
                color={ground.watermark}
                className="pointer-events-none absolute -bottom-[16%] -left-[9%] hidden h-[70%] transition-all duration-[1400ms] lg:block"
                style={{ opacity: ground.watermarkOpacity }}
            />

            <div className="relative grid h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                {/* Type panel. Sits left on desktop, below the plate on mobile. */}
                <div className="relative order-2 flex flex-col justify-between px-6 pt-14 pb-10 sm:px-12 lg:order-1 lg:px-16 lg:pt-24 lg:pb-12">
                    <div className="relative flex flex-1 flex-col justify-center">
                        <h1 className="sr-only">
                            Softwife Lifestyle — affirmation apparel for women
                        </h1>

                        <Lockup
                            color={ground.mark}
                            className="sw-rise w-full max-w-[34rem]"
                            style={{ transition: INK_TRANSITION }}
                        />

                        <div className="mt-7 overflow-hidden">
                            <p
                                className="font-display text-[clamp(1.1rem,2.4vw,1.75rem)] italic"
                                style={{
                                    color: ground.mark,
                                    transition: INK_TRANSITION,
                                }}
                            >
                                <span
                                    key={active}
                                    className="sw-era inline-block"
                                >
                                    {line.phrase}
                                </span>
                            </p>
                        </div>

                        <p
                            className="mt-7 max-w-[34em] text-sm leading-[1.9]"
                            style={{
                                color: ground.body,
                                transition: INK_TRANSITION,
                            }}
                        >
                            Soft is not small. Wear the words you are already
                            speaking over yourself, printed in small runs for
                            the woman romanticising her life through every
                            season.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-3">
                            <a
                                href="/shop"
                                className="rounded-full px-9 py-4 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none"
                                style={{
                                    backgroundColor: ground.primaryBg,
                                    color: ground.primaryText,
                                    transition: INK_TRANSITION,
                                }}
                            >
                                Shop the collection
                            </a>
                            <a
                                href="#lifestyle"
                                className="rounded-full border px-9 py-4 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none"
                                style={{
                                    color: ground.secondaryText,
                                    borderColor: `color-mix(in oklab, ${ground.secondaryText} 42%, transparent)`,
                                    transition: INK_TRANSITION,
                                }}
                            >
                                See the lifestyle
                            </a>
                        </div>
                    </div>

                    {/* The four lines, doubling as the plate control. */}
                    <ul
                        className="relative mt-12 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4"
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                    >
                        {LINES.map((item, index) => (
                            <li key={item.slug}>
                                <button
                                    type="button"
                                    onClick={() => setActive(index)}
                                    aria-current={index === active}
                                    className="group w-full text-left focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none"
                                >
                                    <span
                                        className="block h-[2px] w-full overflow-hidden"
                                        style={{
                                            backgroundColor: `color-mix(in oklab, ${ground.rule} 22%, transparent)`,
                                        }}
                                    >
                                        {index === active ? (
                                            <span
                                                key={`${item.slug}-${active}`}
                                                className="sw-progress block h-full w-full"
                                                data-paused={String(paused)}
                                                style={{
                                                    backgroundColor:
                                                        ground.rule,
                                                }}
                                            />
                                        ) : (
                                            <span className="block h-full w-0" />
                                        )}
                                    </span>
                                    <span
                                        className="mt-3 block text-[0.62rem] tabular-nums opacity-45"
                                        style={{
                                            color: ground.rule,
                                            transition: INK_TRANSITION,
                                        }}
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span
                                        className="mt-1 block text-sm font-medium transition-opacity duration-300 group-hover:opacity-100"
                                        style={{
                                            color: ground.rule,
                                            opacity:
                                                index === active ? 1 : 0.55,
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Plate. A framed card on the ground, so no seam exists. */}
                <div className="relative order-1 flex items-center px-6 pt-24 pb-4 sm:px-12 lg:order-2 lg:py-14 lg:pr-14 lg:pl-4">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-40px_rgba(39,24,20,0.55)] lg:aspect-auto lg:h-full lg:rounded-[2.25rem]">
                        {LINES.map((item, index) => (
                            <img
                                key={`${item.slug}-${index === active}`}
                                src={item.hero}
                                alt={
                                    index === active
                                        ? `Wearing the ${item.name} tee`
                                        : ''
                                }
                                aria-hidden={index !== active}
                                className={
                                    index === active
                                        ? 'sw-plate-in absolute inset-0 h-full w-full object-cover'
                                        : 'absolute inset-0 h-full w-full object-cover opacity-0'
                                }
                                style={{ objectPosition: '50% 28%' }}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                fetchPriority={index === 0 ? 'high' : 'low'}
                            />
                        ))}
                    </div>

                    {/* The next line, peeking in like the next print in a stack. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-16 -left-14 hidden w-[34%] max-w-[13rem] rotate-[-5deg] overflow-hidden rounded-[1.25rem] border-[6px] border-white shadow-[0_28px_56px_-26px_rgba(39,24,20,0.55)] xl:block"
                    >
                        <img
                            key={next.slug}
                            src={next.hero}
                            alt=""
                            className="sw-plate-in aspect-[4/5] w-full object-cover"
                            style={{ objectPosition: '50% 26%' }}
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

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
        <section id="shop" className="bg-bone relative overflow-hidden">
            {/* A wine band behind the upper half, so the cards sit on contrast. */}
            <div
                aria-hidden="true"
                className="bg-wine absolute inset-x-0 top-0 h-[26rem]"
            />
            <div
                aria-hidden="true"
                className="sw-grain bg-wine absolute inset-x-0 top-0 h-[26rem]"
            />

            <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-24 sm:pt-28 sm:pb-32">
                <div className="sw-reveal text-butter text-center">
                    <p className="font-display text-[clamp(1.9rem,4.6vw,3.1rem)] leading-[1.12]">
                        Four lines. One{' '}
                        <Script className="text-[1.4em] text-[var(--color-rose)]">
                            wardrobe
                        </Script>
                    </p>
                    <p className="mx-auto mt-5 max-w-[34em] text-sm leading-relaxed opacity-70">
                        Heavyweight cotton, printed in small runs. Choose the
                        words for the season you are in.
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
        <section className="bg-bone px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-6xl">
                <h2 className="font-display sw-reveal max-w-[13em] text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.1]">
                    One affirmation, worn every way you live.
                </h2>

                <ul className="mt-14 grid gap-8 sm:grid-cols-3">
                    {CATEGORIES.map((category, index) => (
                        <li
                            key={category.name}
                            className="sw-reveal"
                            style={{ transitionDelay: `${index * 90}ms` }}
                        >
                            <div
                                className="flex items-center justify-center rounded-[1.75rem] px-8 py-12"
                                style={{
                                    backgroundColor: category.available
                                        ? 'var(--color-petal)'
                                        : 'color-mix(in oklab, var(--color-wine) 10%, var(--color-petal))',
                                }}
                            >
                                <div className="w-full max-w-[12rem]">
                                    <Garment
                                        cloth={
                                            category.available
                                                ? 'var(--color-butter)'
                                                : 'var(--color-bone)'
                                        }
                                        silhouette={category.silhouette}
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex items-baseline justify-between gap-4">
                                <h3 className="font-display text-xl font-bold">
                                    {category.name}
                                </h3>
                                <span className="text-[0.62rem] font-medium tracking-[0.24em] uppercase opacity-50">
                                    {category.available
                                        ? 'In stock'
                                        : 'Coming soon'}
                                </span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed opacity-60">
                                {category.blurb}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** Vertical reel tiles — the lifestyle itself, not a campaign film. */
function Lifestyle() {
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
                            <ReelTile reel={reel} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** The brand in its own words — faith, femininity, intentional living. */
function Manifesto() {
    return (
        <section id="story" className="bg-bone px-6 py-24 sm:py-32">
            <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
                <div className="sw-reveal mx-auto w-full max-w-sm">
                    <Polaroid caption="Est. 2025">
                        <img
                            src="/media/soft-babe-plum-table.jpg"
                            alt="Wearing the Soft Babe tee"
                            className="aspect-[4/5] w-full object-cover"
                            loading="lazy"
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
                    Choose, wear,{' '}
                    <Script className="text-magenta text-[1.4em]">
                        speak life
                    </Script>
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
                <SectionHeading className="sw-reveal text-center text-white">
                    Kind words
                </SectionHeading>

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

const SERVICES = [
    { icon: Truck, label: 'Regional delivery' },
    { icon: RotateCcw, label: 'Easy exchanges' },
    { icon: Gift, label: 'Gift wrapping' },
    { icon: ShieldCheck, label: 'Secure payment' },
];

function Services() {
    return (
        <section className="bg-bone px-6 py-16">
            <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
                {SERVICES.map(({ icon: Icon, label }) => (
                    <li
                        key={label}
                        className="flex flex-col items-center gap-3 text-center"
                    >
                        <Icon className="text-wine h-5 w-5" />
                        <span className="text-[0.7rem] font-medium tracking-[0.2em] uppercase opacity-65">
                            {label}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

const SOCIALS = [
    { label: 'Instagram', href: 'https://www.instagram.com/_softwife.co' },
    { label: 'TikTok', href: 'https://www.tiktok.com/tag/softwife' },
    { label: 'WhatsApp', href: '#story' },
];

const FOOTER_LINKS = [
    {
        heading: 'Shop',
        links: ['Tees', 'Tracksuits', 'Caps', 'Gift cards', 'Size guide'],
    },
    {
        heading: 'The brand',
        links: ['Our story', 'Affirmations', 'Journal', 'Stockists'],
    },
    {
        heading: 'Help',
        links: [
            'Track your order',
            'Delivery',
            'Returns',
            'Contact us',
            'FAQs',
        ],
    },
];

export default function Home({ variant }: { variant?: HeroVariant }) {
    const [landed, setLanded] = useState(false);

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

                <Hero variant={variant} />

                <Ribbon />

                <Manifesto />

                <BestSellers />

                <Categories />

                <Ritual />

                <Reviews />

                <Lifestyle />

                <Scallop fill="var(--color-magenta)" />

                <section
                    id="affirmations"
                    className="bg-magenta sw-grain relative px-6 pt-20 pb-28 sm:pt-24 sm:pb-36"
                >
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
                                <cite className="mt-6 block text-[0.56rem] font-medium tracking-[0.36em] uppercase not-italic opacity-55">
                                    Softwife affirmations
                                </cite>
                            </blockquote>
                        ))}
                    </div>
                </section>

                <Scallop fill="var(--color-magenta)" flip />

                <Services />

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

                <footer className="bg-wine text-butter px-6 pt-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="lg:col-span-2">
                                <Lockup
                                    color="var(--color-butter)"
                                    className="w-52"
                                />
                                <p className="mt-6 max-w-[26em] text-sm leading-relaxed opacity-60">
                                    An affirmation and manifestation lifestyle
                                    brand for women. Comfortable luxury, made to
                                    be worn and believed.
                                </p>
                                <p className="font-display mt-8 max-w-[12em] text-2xl leading-[1.2] italic">
                                    Softness over survival, in every season.
                                </p>
                            </div>

                            {FOOTER_LINKS.map((column) => (
                                <div key={column.heading}>
                                    <h2 className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase opacity-50">
                                        {column.heading}
                                    </h2>
                                    <ul className="mt-5 space-y-3 text-sm">
                                        {column.links.map((label) => (
                                            <li key={label}>
                                                <a
                                                    href="#shop"
                                                    className="opacity-75 transition hover:opacity-100"
                                                >
                                                    {label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-current/15 py-8">
                            <p className="text-xs opacity-50">
                                © 2025 Softwife Lifestyle. Est. 2025.
                            </p>
                            <ul className="flex flex-wrap items-center gap-6 text-xs">
                                {SOCIALS.map((social) => (
                                    <li key={social.label}>
                                        <a
                                            href={social.href}
                                            className="opacity-60 transition hover:opacity-100"
                                        >
                                            {social.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs opacity-50">
                                Prices in USD · Shipping regionally
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
