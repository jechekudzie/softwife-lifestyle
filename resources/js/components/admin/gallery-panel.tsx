import { router } from '@inertiajs/react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

export type GalleryImage = {
    id: number;
    path: string;
    alt: string | null;
    position: number;
    colourwayId: number | null;
};

export type GalleryColourway = { id: number; name: string; cloth: string };

const field =
    'border-wine/20 w-full rounded-lg border bg-white/80 px-3 py-2 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none';

/**
 * The gallery for one product.
 *
 * A photograph usually pictures one colourway, so each one can be tagged with
 * the cloth it shows. The storefront uses that to swap the card and the
 * product page to the frames for whichever swatch a shopper has picked; an
 * untagged shot — a flat lay, a print detail — belongs to the whole line and
 * shows whatever they choose.
 */
export function GalleryPanel({
    productSlug,
    images,
    colourways,
}: {
    productSlug: string;
    images: GalleryImage[];
    colourways: GalleryColourway[];
}) {
    const input = useRef<HTMLInputElement>(null);
    const [colourwayId, setColourwayId] = useState('');
    const [busy, setBusy] = useState(false);

    const upload = (files: FileList | null) => {
        if (!files?.length) {
            return;
        }

        const payload = new FormData();
        Array.from(files).forEach((file) => payload.append('images[]', file));

        if (colourwayId) {
            payload.append('colourway_id', colourwayId);
        }

        setBusy(true);
        router.post(`/admin/products/${productSlug}/images`, payload, {
            preserveScroll: true,
            onFinish: () => {
                setBusy(false);

                if (input.current) {
                    input.current.value = '';
                }
            },
        });
    };

    const retag = (id: number, patch: Record<string, string | number>) =>
        router.put(`/admin/products/${productSlug}/images/${id}`, patch, {
            preserveScroll: true,
        });

    const remove = (id: number) =>
        router.delete(`/admin/products/${productSlug}/images/${id}`, {
            preserveScroll: true,
        });

    return (
        <section className="border-wine/12 mt-8 rounded-2xl border bg-white/60 p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="font-display text-lg font-bold">Gallery</h2>
                    <p className="mt-1 text-sm opacity-55">
                        Tag a shot with the colourway it pictures and the shop
                        will show it when that swatch is chosen.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <label className="text-xs opacity-55">
                        <span className="sr-only">
                            Colourway for the upload
                        </span>
                        <select
                            value={colourwayId}
                            onChange={(event) =>
                                setColourwayId(event.target.value)
                            }
                            className={field}
                        >
                            <option value="">Whole line</option>
                            {colourways.map((colourway) => (
                                <option key={colourway.id} value={colourway.id}>
                                    {colourway.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => input.current?.click()}
                        className="bg-magenta hover:bg-magenta-deep flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold whitespace-nowrap text-white transition disabled:opacity-50"
                    >
                        <ImagePlus className="h-4 w-4" />
                        {busy ? 'Uploading…' : 'Add photographs'}
                    </button>

                    <input
                        ref={input}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        hidden
                        onChange={(event) => upload(event.target.files)}
                    />
                </div>
            </div>

            {images.length ? (
                <ul className="mt-7 grid gap-5 sm:grid-cols-3 xl:grid-cols-4">
                    {images.map((image) => (
                        <li
                            key={image.id}
                            className="border-wine/12 overflow-hidden rounded-xl border bg-white"
                        >
                            <div className="bg-petal aspect-[4/5]">
                                <img
                                    src={image.path}
                                    alt={image.alt ?? ''}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="space-y-2 p-3">
                                <select
                                    aria-label="Colourway pictured"
                                    value={image.colourwayId ?? ''}
                                    onChange={(event) =>
                                        retag(image.id, {
                                            colourway_id: event.target.value,
                                            alt: image.alt ?? '',
                                            position: image.position,
                                        })
                                    }
                                    className={field}
                                >
                                    <option value="">Whole line</option>
                                    {colourways.map((colourway) => (
                                        <option
                                            key={colourway.id}
                                            value={colourway.id}
                                        >
                                            {colourway.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex items-center gap-2">
                                    <input
                                        aria-label="Order"
                                        type="number"
                                        min={0}
                                        defaultValue={image.position}
                                        onBlur={(event) =>
                                            retag(image.id, {
                                                colourway_id:
                                                    image.colourwayId ?? '',
                                                alt: image.alt ?? '',
                                                position: Number(
                                                    event.target.value,
                                                ),
                                            })
                                        }
                                        className={`${field} w-20 tabular-nums`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => remove(image.id)}
                                        className="text-magenta hover:bg-petal ml-auto rounded-full p-2 transition"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">
                                            Remove this photograph
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="border-wine/15 mt-7 rounded-xl border border-dashed px-5 py-14 text-center text-sm opacity-50">
                    No photographs yet. Add a few and they will slide on the
                    card and the product page.
                </p>
            )}
        </section>
    );
}
