/**
 * Brand marks and garment silhouettes.
 *
 * The wordmark and monogram are the real SOFTWIFE artwork, traced to vector
 * and drawn as CSS masks, so one file tints to any brand colour instead of
 * shipping one per colourway. Vector rather than raster because these render
 * from 12 pixels in a tab to half a viewport in the hero: the SVG is a
 * twelfth the weight of the PNG it replaced and sharp at both.
 */

export type Silhouette = 'tee' | 'hoodie' | 'cap';

export const SILHOUETTES: Record<Silhouette, string> = {
    tee: 'M150 18 L118 32 L14 78 L58 152 L110 128 L110 376 Q110 388 122 388 L338 388 Q350 388 350 376 L350 128 L402 152 L446 78 L342 32 L310 18 Q288 56 230 56 Q172 56 150 18 Z',
    hoodie: 'M150 34 L112 50 L30 96 Q18 104 22 118 L58 232 Q62 246 76 240 L104 226 L104 372 Q104 386 118 386 L342 386 Q356 386 356 372 L356 226 L384 240 Q398 246 402 232 L438 118 Q442 104 430 96 L348 50 L310 34 Q300 78 230 78 Q160 78 150 34 Z',
    cap: 'M230 78 Q120 78 108 214 Q106 240 128 240 L332 240 Q354 240 352 214 Q340 78 230 78 Z M128 244 L336 244 Q408 250 438 286 Q450 302 434 312 L146 312 Q126 312 126 292 Z',
};

export function Wordmark({
    color,
    className,
}: {
    color: string;
    className?: string;
}) {
    return (
        <div
            role="img"
            aria-label="Softwife Lifestyle"
            className={className}
            style={{
                backgroundColor: color,
                aspectRatio: '1482 / 178',
                WebkitMaskImage: 'url(/brand/wordmark-only.svg)',
                maskImage: 'url(/brand/wordmark-only.svg)',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
            }}
        />
    );
}

/**
 * The full brand lockup: the wordmark with LIFESTYLE set beneath it, the way
 * EST.2025 sits under the mark in the original artwork.
 */
export function Lockup({
    color,
    className,
    tagline = 'Lifestyle',
    align = 'left',
    style,
}: {
    color: string;
    className?: string;
    tagline?: string;
    align?: 'left' | 'center';
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={className}
            style={{ containerType: 'inline-size', ...style }}
        >
            <Wordmark color={color} className="w-full" />
            {/* Letters are spread edge to edge so the tagline spans the mark. */}
            <p
                aria-hidden="true"
                className="mt-[0.5em] flex w-full font-semibold"
                style={{
                    color,
                    fontSize: 'clamp(0.46rem, 4.4cqw, 1.05rem)',
                    justifyContent:
                        align === 'center' ? 'center' : 'space-between',
                    gap: align === 'center' ? '0.5em' : undefined,
                }}
            >
                {tagline
                    .toUpperCase()
                    .split('')
                    .map((letter, index) => (
                        <span key={`${letter}-${index}`}>{letter}</span>
                    ))}
            </p>
        </div>
    );
}

export function SMark({
    color,
    className,
    style,
}: {
    color: string;
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <span
            aria-hidden="true"
            className={className}
            style={{
                display: 'inline-block',
                backgroundColor: color,
                aspectRatio: '496 / 511',
                ...style,
                WebkitMaskImage: 'url(/brand/s.svg)',
                maskImage: 'url(/brand/s.svg)',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
            }}
        />
    );
}

/**
 * Wordmark plus its printed affirmation, exactly as it sits on the cloth.
 *
 * Sizes itself against its container rather than a caller-supplied scale, so
 * the same print fits the hero, a product card and a category tile — and so a
 * long line name ("Becoming Softwife") never overflows the print area.
 */
export function Print({
    name,
    affirmation,
    ink,
}: {
    name: string;
    affirmation: string;
    ink: string;
}) {
    const words = name.split(' ');
    const longestWord = Math.max(...words.map((word) => word.length), 4);

    return (
        <div
            className="text-center"
            style={{ color: ink, containerType: 'inline-size' }}
        >
            <span
                className="font-display block leading-[0.82] font-black tracking-[-0.02em]"
                style={{ fontSize: `min(30cqw, ${143 / longestWord}cqw)` }}
            >
                {words.map((word) => (
                    <span key={word} className="block">
                        {word}
                    </span>
                ))}
            </span>
            <p
                className="mx-auto mt-[0.7em] max-w-[15em] leading-[1.5] font-medium tracking-[0.16em] uppercase opacity-85"
                style={{ fontSize: '3.4cqw' }}
            >
                {affirmation}
            </p>
        </div>
    );
}

/**
 * A garment placeholder. Swap the whole component for photography once the
 * shoot images land — every caller passes cloth, silhouette and print only.
 */
export function Garment({
    cloth,
    silhouette = 'tee',
    children,
    shadow = true,
}: {
    cloth: string;
    silhouette?: Silhouette;
    children?: React.ReactNode;
    shadow?: boolean;
}) {
    return (
        <div
            className="relative w-full"
            style={
                shadow
                    ? { filter: 'drop-shadow(0 22px 34px rgba(39,24,20,0.13))' }
                    : undefined
            }
        >
            <svg viewBox="0 0 460 400" className="w-full" aria-hidden="true">
                <path
                    d={SILHOUETTES[silhouette]}
                    fill={cloth}
                    fillRule="evenodd"
                />
            </svg>
            {children ? (
                <div className="absolute inset-x-[25%] top-[34%]">
                    {children}
                </div>
            ) : null}
        </div>
    );
}

/** A shallow scalloped edge, echoing the rounded terminals of the wordmark. */
export function Scallop({
    fill,
    flip = false,
}: {
    fill: string;
    flip?: boolean;
}) {
    return (
        <svg
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="block h-4 w-full sm:h-6"
            style={{ transform: flip ? 'scaleY(-1)' : undefined }}
        >
            <path
                d="M0 24 V12 Q30 0 60 12 T120 12 T180 12 T240 12 T300 12 T360 12 T420 12 T480 12 T540 12 T600 12 T660 12 T720 12 T780 12 T840 12 T900 12 T960 12 T1020 12 T1080 12 T1140 12 T1200 12 V24 Z"
                fill={fill}
            />
        </svg>
    );
}

/**
 * A pinned photo frame. The brand's own language is scrapbook-adjacent —
 * romanticising the everyday — so gallery items are framed and captioned
 * rather than bled to the edge.
 */
export function Polaroid({
    caption,
    tone = 'light',
    children,
}: {
    caption?: string;
    tone?: 'light' | 'rose';
    children: React.ReactNode;
}) {
    return (
        <figure className="relative">
            <span
                aria-hidden="true"
                className="absolute -top-2 left-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full"
                style={{
                    background:
                        'radial-gradient(circle at 32% 28%, #f4dfa8, #b8923f 68%, #8a6c26)',
                    boxShadow: '0 2px 5px rgba(39,24,20,0.35)',
                }}
            />
            <div
                className="px-3 pt-3 pb-11 shadow-[0_16px_34px_-20px_rgba(39,24,20,0.55)]"
                style={{
                    backgroundColor:
                        tone === 'rose' ? 'var(--color-petal)' : '#ffffff',
                }}
            >
                <div className="overflow-hidden">{children}</div>
                {caption ? (
                    <figcaption className="font-display absolute inset-x-0 bottom-3.5 text-center text-sm">
                        {caption}
                    </figcaption>
                ) : null}
            </div>
        </figure>
    );
}

/** Letterspaced display caps, the section marker used across the brand. */
export function SectionHeading({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={`font-display text-[clamp(1.35rem,3vw,2rem)] font-medium tracking-[0.22em] uppercase ${className}`}
        >
            {children}
        </h2>
    );
}

/** A script accent, for signatures and single emphasised words only. */
export function Script({
    children,
    className = '',
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span className={`font-script leading-[1.1] ${className}`}>
            {children}
        </span>
    );
}
