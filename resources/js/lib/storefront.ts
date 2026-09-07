import type { Silhouette } from '@/components/storefront/brand';

/**
 * Catalogue shape for the storefront.
 *
 * The brand is a matrix: an *affirmation line* (Soft Wife, Soft Mom…) owns the
 * words, and a *category* (tee, tracksuit, cap) owns the garment. The same line
 * will print across every category, so neither one may hard-code the other.
 *
 * This module is placeholder data until the catalogue moves into the database.
 */

export type Colourway = {
    name: string;
    cloth: string;
    ink: string;
};

export type AffirmationLine = {
    slug: string;
    name: string;
    era: string;
    /** The italic line under the wordmark. Not every line fits "in my soft X era". */
    phrase: string;
    affirmation: string;
    /** Editorial shot for the hero. */
    hero: string;
    /** Hero ground, chosen to echo the garment in `hero`. */
    ground: 'wine' | 'rose' | 'brown' | 'plum' | 'pale';
    /** Product shot for the catalogue card, or null when none exists yet. */
    photo: string | null;
    /** The colourway the photo actually pictures. */
    pictured: string;
    field: string;
    colourways: Colourway[];
    price: number;
    wasPrice: number | null;
    badge: string | null;
};

export type Category = {
    name: string;
    blurb: string;
    silhouette: Silhouette;
    available: boolean;
};

export type Reel = {
    caption: string;
    poster: string | null;
    src: string | null;
    cloth: string;
    ink: string;
};

export const BUTTER = 'var(--color-butter)';
export const CHOC = 'var(--color-choc)';
export const BONE = 'var(--color-bone)';
export const MAGENTA = 'var(--color-magenta)';
export const BLUSH = 'var(--color-blush)';
export const WINE = 'var(--color-wine)';
export const PLUM = 'var(--color-plum)';

const BASE_COLOURWAYS: Colourway[] = [
    { name: 'Butter', cloth: BUTTER, ink: CHOC },
    { name: 'Chocolate', cloth: CHOC, ink: BUTTER },
    { name: 'Bone', cloth: BONE, ink: MAGENTA },
    { name: 'Blush', cloth: BLUSH, ink: CHOC },
    { name: 'Burgundy', cloth: WINE, ink: BUTTER },
    { name: 'Plum', cloth: PLUM, ink: '#ffffff' },
];

export const LINES: AffirmationLine[] = [
    {
        slug: 'soft-wife',
        name: 'Soft Wife',
        era: 'Wife',
        phrase: 'in my soft wife era',
        affirmation:
            'In my soft wife era means I don’t chase. I attract. Demure in my presence, mindful in my heart and unbothered, because God already wrote the best plot twist.',
        hero: '/media/soft-wife-choc-lights.jpg',
        ground: 'brown',
        photo: '/media/soft-wife-choc-affirmation.jpg',
        pictured: 'Chocolate · butter print',
        field: 'var(--color-bone)',
        colourways: BASE_COLOURWAYS,
        price: 35,
        wasPrice: null,
        badge: 'Best seller',
    },
    {
        slug: 'soft-mom',
        name: 'Soft Mom',
        era: 'Mom',
        phrase: 'in my soft mom era',
        affirmation:
            'In my soft mom era because God looked at me and thought me worthy enough to become a mother, to care for His most beautiful creations, to experience the purest form of love.',
        hero: '/media/soft-mom-white-coat.jpg',
        ground: 'wine',
        photo: '/media/soft-mom-white-seated.jpg',
        pictured: 'Bone · burgundy print',
        field: 'var(--color-petal-deep)',
        colourways: [
            BASE_COLOURWAYS[1],
            BASE_COLOURWAYS[4],
            BASE_COLOURWAYS[0],
            BASE_COLOURWAYS[2],
        ],
        price: 35,
        wasPrice: null,
        badge: null,
    },
    {
        slug: 'soft-babe',
        name: 'Soft Babe',
        era: 'Babe',
        phrase: 'in my soft babe era',
        affirmation:
            'I am in my soft babe era because I know my worth, I invest in myself mentally, spiritually and financially, and I keep it cute without competing.',
        hero: '/media/soft-babe-plum-seated.jpg',
        ground: 'plum',
        photo: '/media/soft-babe-plum-standing.jpg',
        pictured: 'Plum · white print',
        field: 'var(--color-petal)',
        colourways: [
            BASE_COLOURWAYS[2],
            BASE_COLOURWAYS[0],
            BASE_COLOURWAYS[3],
        ],
        price: 35,
        wasPrice: null,
        badge: 'New',
    },
    {
        slug: 'becoming-softwife',
        name: 'Becoming Softwife',
        era: 'Her',
        phrase: 'becoming her, softly',
        affirmation:
            'I am becoming her. Softer in my seasons, steadier in my faith, and no longer shrinking to make anyone else comfortable.',
        hero: '/media/soft-wife-white-tashas.jpg',
        ground: 'pale',
        photo: '/media/soft-babe-plum-table.jpg',
        pictured: 'Plum · white print',
        field: 'var(--color-butter)',
        colourways: [
            BASE_COLOURWAYS[4],
            BASE_COLOURWAYS[1],
            BASE_COLOURWAYS[2],
        ],
        price: 40,
        wasPrice: 48,
        badge: null,
    },
];

export const CATEGORIES: Category[] = [
    {
        name: 'Tees',
        blurb: 'The original affirmation tee, in four colourways.',
        silhouette: 'tee',
        available: true,
    },
    {
        name: 'Tracksuits',
        blurb: 'Heavyweight sets for slow mornings and long seasons.',
        silhouette: 'hoodie',
        available: false,
    },
    {
        name: 'Caps',
        blurb: 'Embroidered, structured, quietly said.',
        silhouette: 'cap',
        available: false,
    },
];

export const AFFIRMATIONS = [
    'and if anything, i want to keep my softness without becoming everyone’s favourite person to take advantage of.',
    'i don’t know who needs to hear this, but i’m praying your next chapter is so good you forget how hard the last one was.',
    'sunday slows me down, just enough to feel God again, and that’s my favorite part.',
    'and if anything, i want to remain soft in a world that keeps giving me reasons to harden.',
];

export const RIBBON = [
    'visualise your highest self',
    'then show up as her',
    'softness over survival',
    'comfortable luxury',
];

export const REELS: Reel[] = [
    {
        caption: 'The affirmation, up close',
        poster: '/media/reels/soft-wife-affirmation-print.jpg',
        src: '/media/reels/soft-wife-affirmation-print.mp4',
        cloth: CHOC,
        ink: BUTTER,
    },
    {
        caption: 'Sunday outfit of the day',
        poster: '/media/soft-wife-white-street.jpg',
        src: null,
        cloth: BONE,
        ink: CHOC,
    },
    {
        caption: 'Choosing her scent, unhurried',
        poster: '/media/reels/soft-mom-fragrance-counter.jpg',
        src: '/media/reels/soft-mom-fragrance-counter.mp4',
        cloth: CHOC,
        ink: BUTTER,
    },
    {
        caption: 'Two in their soft wife era',
        poster: '/media/soft-wife-pair-cafe.jpg',
        src: null,
        cloth: CHOC,
        ink: BUTTER,
    },
];

/** The clip that plays inside the manifesto polaroid. */
export const MANIFESTO_REEL: Reel = {
    caption: 'Coffee run, soft wife era',
    poster: '/media/reels/soft-wife-coffee-run.jpg',
    src: '/media/reels/soft-wife-coffee-run.mp4',
    cloth: CHOC,
    ink: BUTTER,
};

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export function formatPrice(amount: number): string {
    return `$${amount}`;
}

export const ROSE = 'var(--color-rose)';

/**
 * The brand's own words. Kept here so copy changes never require touching
 * layout code.
 */
export const MANIFESTO = {
    lead: 'For the woman who finds beauty in the everyday.',
    body: [
        'Softwife Lifestyle is an affirmation and manifestation brand for women choosing softness over survival in every season. We encourage you to romanticize your life, embrace your femininity, love yourself, carry yourself with dignity, and stay open to wealth and prosperity.',
        'Rooted in faith, femininity, self-love, intentional living and abundance, we believe a woman can create a beautiful, prosperous life while trusting God through every season.',
    ],
    closing:
        'Slow down, receive, enjoy, and romanticize the life God has given you.',
};

export const RITUAL = [
    {
        title: 'Choose your words',
        body: 'Pick the affirmation for the season you are in. Wife, mom, babe, or becoming.',
    },
    {
        title: 'Wear them daily',
        body: 'Heavyweight cotton, printed in small runs, made to be lived in rather than saved.',
    },
    {
        title: 'Speak life over yourself',
        body: 'Carry words of faith, love and abundance with you, one affirmation at a time.',
    },
];

export const REVIEWS = [
    {
        quote: 'I bought the Soft Wife tee in my hardest season. Reading those words on myself every morning changed how I spoke to myself. It is more than a t-shirt.',
        name: 'Tendai M.',
    },
    {
        quote: 'The quality surprised me. Heavy cotton, the print has not cracked once, and I get asked where it is from every single time I wear it.',
        name: 'Naledi K.',
    },
    {
        quote: 'I gifted the Soft Mom tee to my sister after her first baby. She cried. It said everything I wanted to say to her.',
        name: 'Chiedza R.',
    },
];
