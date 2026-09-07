import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Wordmark } from '@/components/storefront/brand';
import type { Reel } from '@/lib/storefront';

/**
 * A vertical reel.
 *
 * Plays muted while it is on screen and pauses when it leaves, so a wall of
 * them never decodes more video than the reader can see. Reduced-motion gets
 * the poster and an explicit play control instead.
 */
export function ReelTile({ reel }: { reel: Reel }) {
    const video = useRef<HTMLVideoElement>(null);
    const frame = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        setReduced(
            window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        );
    }, []);

    useEffect(() => {
        const el = frame.current;

        if (
            !el ||
            !reel.src ||
            reduced ||
            !('IntersectionObserver' in window)
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const player = video.current;

                if (!player) {
                    return;
                }

                if (entry.isIntersecting) {
                    void player.play().catch(() => undefined);
                } else {
                    player.pause();
                }
            },
            { threshold: 0.55 },
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [reel.src, reduced]);

    const toggle = () => {
        const player = video.current;

        if (!player) {
            return;
        }

        if (player.paused) {
            void player.play().catch(() => undefined);
        } else {
            player.pause();
        }
    };

    return (
        <figure className="group">
            <div
                ref={frame}
                className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.5rem]"
                style={{ backgroundColor: reel.cloth }}
            >
                {reel.src ? (
                    <>
                        <video
                            ref={video}
                            className="h-full w-full object-cover"
                            src={reel.src}
                            poster={reel.poster ?? undefined}
                            muted={muted}
                            loop
                            playsInline
                            preload="metadata"
                            onPlay={() => setPlaying(true)}
                            onPause={() => setPlaying(false)}
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(39,24,20,0.45)] via-transparent to-transparent" />

                        <button
                            type="button"
                            onClick={toggle}
                            className="absolute inset-0 focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none focus-visible:ring-inset"
                        >
                            <span className="sr-only">
                                {playing ? 'Pause' : 'Play'} {reel.caption}
                            </span>
                            <span
                                aria-hidden="true"
                                className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/22 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
                            >
                                {playing ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMuted((value) => !value)}
                            className="absolute right-4 bottom-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/22 text-white backdrop-blur-sm transition hover:bg-white/35 focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none"
                        >
                            {muted ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                {muted ? 'Unmute' : 'Mute'} {reel.caption}
                            </span>
                        </button>
                    </>
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
            </div>
            <figcaption className="mt-4 text-sm leading-snug opacity-60">
                {reel.caption}
            </figcaption>
        </figure>
    );
}
