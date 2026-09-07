import { Check, PenLine, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Garment, Print } from '@/components/storefront/brand';
import { CUSTOM_AFFIRMATION_FEE, CUSTOM_LEAD_TIME, useCart } from '@/lib/cart';
import { formatPrice, SIZES, type AffirmationLine } from '@/lib/storefront';

const MAX_CUSTOM = 180;

/**
 * The add-to-bag sheet.
 *
 * Rendered through a portal: the product card it opens from carries a
 * transform, which would otherwise become the containing block for a fixed
 * child and trap the sheet inside the card.
 *
 * Size is required, so nothing reaches the bag unbuyable. Custom wording is
 * opt-in and carries a surcharge, because it is printed to order rather than
 * pulled from a run.
 */
export function AddToBag({
    line,
    onClose,
}: {
    line: AffirmationLine;
    onClose: () => void;
}) {
    const { add } = useCart();
    const [colourway, setColourway] = useState(0);
    const [size, setSize] = useState<string | null>(null);
    const [wantsCustom, setWantsCustom] = useState(false);
    const [custom, setCustom] = useState('');
    const [added, setAdded] = useState(false);

    const active = line.colourways[colourway];
    const customText = custom.trim();
    const customReady = !wantsCustom || customText.length >= 8;
    const total =
        line.price + (wantsCustom && customText ? CUSTOM_AFFIRMATION_FEE : 0);

    useEffect(() => {
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

    const submit = () => {
        if (!size || !customReady) {
            return;
        }

        add({
            slug: line.slug,
            name: line.name,
            colourway: active.name,
            cloth: active.cloth,
            ink: active.ink,
            size,
            photo: line.photo,
            basePrice: line.price,
            custom: wantsCustom && customText ? customText : null,
        });

        setAdded(true);
        window.setTimeout(onClose, 900);
    };

    const sheet = (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Add ${line.name} to your bag`}
            className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 bg-[rgba(39,24,20,0.55)] backdrop-blur-sm"
            />

            <div className="bg-bone text-choc relative max-h-[92vh] w-full overflow-y-auto rounded-t-[1.5rem] p-6 sm:max-w-lg sm:rounded-[1.5rem] sm:p-8">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h2 className="font-display text-2xl font-bold">
                            {line.name}
                        </h2>
                        <p className="mt-1 text-sm opacity-55">
                            {active.name} · affirmation print
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="-m-2 rounded-full p-2 transition hover:opacity-60"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="mt-6 flex gap-5">
                    <div
                        className="w-28 shrink-0 overflow-hidden rounded-2xl"
                        style={{ backgroundColor: line.field }}
                    >
                        {line.photo ? (
                            <img
                                src={line.photo}
                                alt=""
                                className="aspect-[4/5] w-full object-cover"
                            />
                        ) : (
                            <div className="flex aspect-[4/5] items-center justify-center p-3">
                                <Garment cloth={active.cloth} shadow={false}>
                                    <Print
                                        name={line.name}
                                        affirmation={line.affirmation}
                                        ink={active.ink}
                                    />
                                </Garment>
                            </div>
                        )}
                    </div>

                    <p className="flex-1 text-sm leading-relaxed opacity-65">
                        {wantsCustom && customText
                            ? customText
                            : line.affirmation}
                    </p>
                </div>

                <fieldset className="mt-7">
                    <legend className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                        Colourway
                    </legend>
                    <ul className="mt-3 flex flex-wrap gap-2.5">
                        {line.colourways.map((option, index) => (
                            <li key={option.name}>
                                <button
                                    type="button"
                                    onClick={() => setColourway(index)}
                                    aria-pressed={index === colourway}
                                    title={option.name}
                                    className="block h-8 w-8 rounded-full transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                                    style={{
                                        backgroundColor: option.cloth,
                                        boxShadow:
                                            index === colourway
                                                ? '0 0 0 2px var(--color-wine)'
                                                : '0 0 0 1px rgba(39,24,20,0.18)',
                                    }}
                                >
                                    <span className="sr-only">
                                        {option.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <fieldset className="mt-7">
                    <legend className="text-[0.6rem] font-semibold tracking-[0.28em] uppercase opacity-45">
                        Size
                    </legend>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {SIZES.map((option) => (
                            <li key={option}>
                                <button
                                    type="button"
                                    onClick={() => setSize(option)}
                                    aria-pressed={size === option}
                                    className={`min-w-12 rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none ${
                                        size === option
                                            ? 'border-wine bg-wine text-white'
                                            : 'border-wine/20 hover:border-wine/60'
                                    }`}
                                >
                                    {option}
                                </button>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                {/* Custom wording, printed to order. */}
                <div className="border-wine/15 mt-7 rounded-2xl border p-5">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={wantsCustom}
                            onChange={(event) =>
                                setWantsCustom(event.target.checked)
                            }
                            className="accent-wine mt-0.5 h-4 w-4"
                        />
                        <span>
                            <span className="flex items-center gap-2 text-sm font-semibold">
                                <PenLine className="text-magenta h-4 w-4" />
                                Print my own affirmation
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed opacity-60">
                                Your words in the same layout, printed to order.
                                Adds {formatPrice(
                                    CUSTOM_AFFIRMATION_FEE,
                                )} and{' '}
                                {CUSTOM_LEAD_TIME} to your delivery.
                            </span>
                        </span>
                    </label>

                    {wantsCustom ? (
                        <div className="mt-4">
                            <label
                                htmlFor="custom-affirmation"
                                className="sr-only"
                            >
                                Your affirmation
                            </label>
                            <textarea
                                id="custom-affirmation"
                                rows={3}
                                maxLength={MAX_CUSTOM}
                                value={custom}
                                onChange={(event) =>
                                    setCustom(event.target.value)
                                }
                                placeholder="In my soft era because…"
                                className="border-wine/20 placeholder:text-choc/35 w-full rounded-xl border bg-white/70 px-4 py-3 text-sm leading-relaxed focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none"
                            />
                            <p className="mt-2 flex items-center justify-between text-xs opacity-50">
                                <span>
                                    {customText.length < 8
                                        ? 'At least 8 characters.'
                                        : 'We will send a proof before printing.'}
                                </span>
                                <span className="tabular-nums">
                                    {custom.length}/{MAX_CUSTOM}
                                </span>
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="mt-7 flex items-center justify-between gap-4">
                    <p className="text-sm">
                        <span className="opacity-55">Total</span>{' '}
                        <span className="font-display ml-1 text-xl font-bold">
                            {formatPrice(total)}
                        </span>
                    </p>

                    <button
                        type="button"
                        onClick={submit}
                        disabled={!size || !customReady || added}
                        className="bg-wine hover:bg-wine-soft flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {added ? (
                            <>
                                <Check className="h-4 w-4" />
                                Added
                            </>
                        ) : (
                            'Add to bag'
                        )}
                    </button>
                </div>

                {!size ? (
                    <p className="mt-3 text-right text-xs opacity-50">
                        Choose a size first.
                    </p>
                ) : null}
            </div>
        </div>
    );

    return typeof document === 'undefined'
        ? sheet
        : createPortal(sheet, document.body);
}
