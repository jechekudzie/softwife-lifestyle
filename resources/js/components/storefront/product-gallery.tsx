import { useEffect, useMemo, useRef, useState } from 'react';
import { Photo } from '@/components/storefront/photo';
import type { LineImage } from '@/lib/storefront';

/**
 * The photographs of one product, sliding.
 *
 * Images carry the colourway they picture, so choosing a swatch narrows the
 * gallery to the frames that actually show that cloth; a shot with no
 * colourway — a flat lay, a print detail — belongs to the whole line and
 * stays in every set. Where a colourway has only one frame nothing moves,
 * which is the honest outcome rather than a carousel of one.
 */
export function ProductGallery({
    images,
    colourway,
    alt,
    sizes,
    /** Milliseconds each frame holds. Zero leaves it on the first. */
    interval = 3400,
    className = 'aspect-[4/5] w-full object-cover',
}: {
    images: LineImage[];
    colourway?: string;
    alt: string;
    sizes: string;
    interval?: number;
    className?: string;
}) {
    const frames = useMemo(() => {
        const matched = images.filter(
            (image) => !image.colourway || image.colourway === colourway,
        );

        return matched.length ? matched : images;
    }, [images, colourway]);

    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduced = useRef(false);

    useEffect(() => {
        reduced.current = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
    }, []);

    // A narrowed set can be shorter than where we had got to.
    useEffect(() => setActive(0), [colourway, frames.length]);

    useEffect(() => {
        if (frames.length < 2 || paused || reduced.current || !interval) {
            return;
        }

        const timer = window.setInterval(
            () => setActive((current) => (current + 1) % frames.length),
            interval,
        );

        return () => window.clearInterval(timer);
    }, [frames.length, paused, interval]);

    if (!frames.length) {
        return null;
    }

    return (
        <div
            className="relative h-full w-full"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
        >
            {frames.map((frame, index) => (
                <Photo
                    key={frame.src}
                    src={frame.src}
                    alt={index === active ? (frame.alt ?? alt) : ''}
                    sizes={sizes}
                    priority={index === 0}
                    className={`${className} ${
                        index === 0 ? '' : 'absolute inset-0'
                    } transition-opacity duration-700 ease-out`}
                    style={{ opacity: index === active ? 1 : 0 }}
                />
            ))}

            {frames.length > 1 ? (
                <ul
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
                >
                    {frames.map((frame, index) => (
                        <li
                            key={frame.src}
                            className="h-1 rounded-full bg-white transition-all duration-500"
                            style={{
                                width: index === active ? '1.25rem' : '0.25rem',
                                opacity: index === active ? 0.95 : 0.5,
                            }}
                        />
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
