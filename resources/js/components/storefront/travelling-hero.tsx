/**
 * The travelling hero.
 *
 * Four affirmation lines, each arriving in its own ground, rotating on a
 * timer. It was the landing page until the still hero replaced it; /dark
 * keeps it because the colour changes are worth looking at on their own.
 */
import { useEffect, useState } from 'react';
import { Lockup, SMark } from '@/components/storefront/brand';
import { Photo } from '@/components/storefront/photo';
import { heroLines, type AffirmationLine } from '@/lib/storefront';

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
    /** The lockup's own colour, where it differs from the rest of the ink. */
    wordmark?: string;
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
        wordmark: 'var(--color-magenta)',
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

export function TravellingHero({
    variant,
    lines,
}: {
    variant?: HeroVariant;
    lines: AffirmationLine[];
}) {
    const HERO_LINES = heroLines(lines);
    const LINES = lines;

    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduced = usePrefersReducedMotion();

    useEffect(() => {
        if (reduced || paused) {
            return;
        }

        const timer = window.setInterval(
            () => setActive((current) => (current + 1) % HERO_LINES.length),
            6000,
        );

        return () => window.clearInterval(timer);
    }, [reduced, paused]);

    const line = HERO_LINES[active];
    const next = LINES[(active + 1) % HERO_LINES.length];
    // A preview route locks one ground; otherwise it follows the garment.
    const key: HeroVariant = variant ?? line.ground;
    const ground = HERO_GROUNDS[key];

    const usedGrounds = variant
        ? [variant]
        : Array.from(
              new Set<HeroVariant>([
                  ...HERO_LINES.map((item) => item.ground),
                  key,
              ]),
          );

    /**
     * Plates are mounted as they are reached, plus the one coming next so the
     * crossfade has something to fade to. Mounting all four up front meant the
     * first view downloaded three photographs nobody had asked to see.
     */
    const [mounted, setMounted] = useState<number[]>([0, 1]);

    useEffect(() => {
        setMounted((current) => {
            const next = (active + 1) % HERO_LINES.length;
            const wanted =
                current.includes(active) && current.includes(next)
                    ? current
                    : Array.from(new Set([...current, active, next]));

            return wanted.length === current.length ? current : wanted;
        });
    }, [active]);

    return (
        <section className="sw-grain relative overflow-hidden lg:h-[100svh] lg:min-h-[42rem]">
            {/*
             * Only the grounds actually reachable are rendered. Stacking all
             * of them meant the unused photographic ground downloaded its
             * plate on every visit for a layer nobody ever sees.
             */}
            {usedGrounds.map((name) => {
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
                            color={ground.wordmark ?? ground.mark}
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
                        {HERO_LINES.map((item, index) => (
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
                        {HERO_LINES.map((item, index) =>
                            !mounted.includes(index) ? null : (
                                <div
                                    key={`${item.slug}-${index === active}`}
                                    aria-hidden={index !== active}
                                    className={
                                        index === active
                                            ? 'sw-plate-in absolute inset-0'
                                            : 'absolute inset-0 opacity-0'
                                    }
                                >
                                    <Photo
                                        src={item.hero}
                                        alt={
                                            index === active
                                                ? `Wearing the ${item.name} tee`
                                                : ''
                                        }
                                        sizes="(min-width: 1024px) 52vw, 100vw"
                                        priority={index === 0}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ),
                        )}
                    </div>

                    {/* The next line, peeking in like the next print in a stack. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute bottom-16 -left-14 hidden w-[34%] max-w-[13rem] rotate-[-5deg] overflow-hidden rounded-[1.25rem] border-[6px] border-white shadow-[0_28px_56px_-26px_rgba(39,24,20,0.55)] xl:block"
                    >
                        <Photo
                            key={next.slug}
                            src={next.hero}
                            alt=""
                            sizes="14rem"
                            widths={[400]}
                            className="sw-plate-in aspect-[4/5] w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
