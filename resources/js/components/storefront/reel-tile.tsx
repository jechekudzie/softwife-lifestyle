import {
    ChevronLeft,
    ChevronRight,
    Expand,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Wordmark } from '@/components/storefront/brand';
import type { Reel } from '@/lib/storefront';

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        setReduced(
            window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        );
    }, []);

    return reduced;
}

/**
 * A vertical reel in the wall.
 *
 * Previews muted while it is on screen and pauses when it leaves, so a wall of
 * them never decodes more video than the reader can see. Sound and full size
 * live in the lightbox, which is what a click opens.
 */
export function ReelTile({
    reel,
    onOpen,
    paused,
    soundOn = false,
    onToggleSound,
}: {
    reel: Reel;
    onOpen: () => void;
    paused: boolean;
    /** Only one tile in a wall may carry sound at a time. */
    soundOn?: boolean;
    onToggleSound?: () => void;
}) {
    const video = useRef<HTMLVideoElement>(null);
    const frame = useRef<HTMLDivElement>(null);
    const [onScreen, setOnScreen] = useState(false);
    const reduced = usePrefersReducedMotion();

    useEffect(() => {
        const el = frame.current;

        if (!el || !reel.src || !('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setOnScreen(entry.isIntersecting),
            { threshold: 0.55 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [reel.src]);

    // The wall goes quiet while the lightbox is open.
    useEffect(() => {
        const player = video.current;

        if (!player) {
            return;
        }

        if (onScreen && !paused && !reduced) {
            void player.play().catch(() => undefined);
        } else {
            player.pause();
        }
    }, [onScreen, paused, reduced]);

    return (
        <figure className="group relative">
            <button
                type="button"
                onClick={onOpen}
                className="block w-full cursor-pointer text-left focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
            >
                <div
                    ref={frame}
                    className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.5rem]"
                    style={{ backgroundColor: reel.cloth }}
                >
                    {reel.src ? (
                        <video
                            ref={video}
                            className="h-full w-full object-cover"
                            src={reel.src}
                            poster={reel.poster ?? undefined}
                            muted={!soundOn}
                            loop
                            playsInline
                            preload="metadata"
                        />
                    ) : reel.poster ? (
                        <img
                            src={reel.poster}
                            alt={reel.caption}
                            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                            loading="lazy"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <Wordmark
                                color={reel.ink}
                                className="w-3/4 opacity-25"
                            />
                        </div>
                    )}

                    <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-[rgba(39,24,20,0.28)] opacity-0 transition duration-300 group-hover:opacity-100"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                            <Expand className="h-5 w-5" />
                        </span>
                    </span>
                    <span className="sr-only">Open {reel.caption}</span>
                </div>
            </button>

            {reel.src && onToggleSound ? (
                <button
                    type="button"
                    onClick={onToggleSound}
                    aria-pressed={soundOn}
                    className={`absolute right-4 bottom-[4.75rem] flex h-10 w-10 items-center justify-center rounded-full text-white backdrop-blur-sm transition focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none ${
                        soundOn
                            ? 'bg-white/40'
                            : 'bg-[rgba(39,24,20,0.45)] hover:bg-[rgba(39,24,20,0.65)]'
                    }`}
                >
                    {soundOn ? (
                        <Volume2 className="h-4 w-4" />
                    ) : (
                        <VolumeX className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                        {soundOn ? 'Mute' : 'Play sound for'} {reel.caption}
                    </span>
                </button>
            ) : null}
            <figcaption className="mt-4 text-sm leading-snug opacity-60">
                {reel.caption}
            </figcaption>
        </figure>
    );
}

/**
 * A reel rendered bare, for placing inside another frame such as a polaroid.
 * Previews muted on screen; a click hands it to the lightbox.
 */
export function InlineReel({
    reel,
    onOpen,
    paused,
    className = '',
}: {
    reel: Reel;
    onOpen: () => void;
    paused: boolean;
    className?: string;
}) {
    const video = useRef<HTMLVideoElement>(null);
    const frame = useRef<HTMLButtonElement>(null);
    const [onScreen, setOnScreen] = useState(false);
    const reduced = usePrefersReducedMotion();

    useEffect(() => {
        const el = frame.current;

        if (!el || !('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => setOnScreen(entry.isIntersecting),
            { threshold: 0.5 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const player = video.current;

        if (!player) {
            return;
        }

        if (onScreen && !paused && !reduced) {
            void player.play().catch(() => undefined);
        } else {
            player.pause();
        }
    }, [onScreen, paused, reduced]);

    return (
        <button
            ref={frame}
            type="button"
            onClick={onOpen}
            className={`group relative block w-full cursor-pointer overflow-hidden focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none ${className}`}
        >
            <video
                ref={video}
                className="h-full w-full object-cover"
                src={reel.src ?? undefined}
                poster={reel.poster ?? undefined}
                muted
                loop
                playsInline
                preload="metadata"
            />
            <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-[rgba(39,24,20,0.25)] opacity-0 transition duration-300 group-hover:opacity-100"
            >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
                    <Expand className="h-5 w-5" />
                </span>
            </span>
            <span className="sr-only">Open {reel.caption}</span>
        </button>
    );
}

/** Full-size reel viewer. Opens with sound, since a click is a user gesture. */
export function ReelLightbox({
    reels,
    index,
    onClose,
    onMove,
}: {
    reels: Reel[];
    index: number;
    onClose: () => void;
    onMove: (next: number) => void;
}) {
    const reel = reels[index];
    const closeButton = useRef<HTMLButtonElement>(null);

    const step = useCallback(
        (delta: number) =>
            onMove((index + delta + reels.length) % reels.length),
        [index, onMove, reels.length],
    );

    useEffect(() => {
        closeButton.current?.focus();

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }

            if (event.key === 'ArrowRight') {
                step(1);
            }

            if (event.key === 'ArrowLeft') {
                step(-1);
            }
        };

        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, step]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={reel.caption}
            className="fixed inset-0 z-[70] flex items-center justify-center"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 bg-[rgba(30,17,14,0.86)] backdrop-blur-md"
            />

            <button
                ref={closeButton}
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none"
            >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
            </button>

            {reels.length > 1 ? (
                <>
                    <button
                        type="button"
                        onClick={() => step(-1)}
                        className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none sm:left-8"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Previous</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => step(1)}
                        className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/30 focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none sm:right-8"
                    >
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Next</span>
                    </button>
                </>
            ) : null}

            <figure className="relative mx-auto flex max-h-[92vh] w-[min(92vw,26rem)] flex-col">
                <div className="overflow-hidden rounded-[1.5rem] bg-black shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]">
                    {reel.src ? (
                        <video
                            key={reel.src}
                            className="max-h-[78vh] w-full object-contain"
                            src={reel.src}
                            poster={reel.poster ?? undefined}
                            autoPlay
                            loop
                            controls
                            playsInline
                        />
                    ) : reel.poster ? (
                        <img
                            key={reel.poster}
                            src={reel.poster}
                            alt={reel.caption}
                            className="max-h-[78vh] w-full object-contain"
                        />
                    ) : null}
                </div>

                <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm text-white/80">
                    <span>{reel.caption}</span>
                    <span className="text-xs text-white/50 tabular-nums">
                        {index + 1} / {reels.length}
                    </span>
                </figcaption>
            </figure>
        </div>
    );
}
