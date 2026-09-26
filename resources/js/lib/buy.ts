import { useState } from 'react';
import { CUSTOM_AFFIRMATION_FEE, useCart } from '@/lib/cart';
import type { AffirmationLine } from '@/lib/storefront';

export const MAX_CUSTOM = 180;

/**
 * Choosing a piece: colourway, size, and optionally your own words.
 *
 * Held here rather than in either of the two places it is rendered — the
 * quick sheet on a card and the product page — because the rules about what
 * may reach the bag should not be written twice.
 */
export function useBuyForm(line: AffirmationLine, onAdded?: () => void) {
    const { add } = useCart();
    const [colourway, setColourway] = useState(0);
    const [size, setSize] = useState<string | null>(null);
    const [wantsCustom, setWantsCustom] = useState(false);
    const [custom, setCustom] = useState('');
    const [added, setAdded] = useState(false);

    const active = line.colourways[colourway];
    const customText = custom.trim();
    // Eight characters is the shortest thing worth printing on a chest.
    const customReady = !wantsCustom || customText.length >= 8;
    const total =
        line.price + (wantsCustom && customText ? CUSTOM_AFFIRMATION_FEE : 0);
    const ready = Boolean(size) && customReady && !added;

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
            photo: line.images[0]?.src ?? line.photo,
            basePrice: line.price,
            custom: wantsCustom && customText ? customText : null,
        });

        setAdded(true);
        window.setTimeout(() => {
            setAdded(false);
            onAdded?.();
        }, 900);
    };

    return {
        colourway,
        setColourway,
        active,
        size,
        setSize,
        wantsCustom,
        setWantsCustom,
        custom,
        setCustom,
        customText,
        customReady,
        total,
        added,
        ready,
        submit,
    };
}
