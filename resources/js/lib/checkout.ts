/**
 * Fulfilment options.
 *
 * Zones, fees and the collection point are placeholders until the real ones
 * are confirmed. They live here so changing them never touches layout code,
 * and so they can move to the database unchanged.
 */

export type DeliveryZone = {
    id: string;
    label: string;
    detail: string;
    fee: number;
    /** Working days, quoted to the customer before they pay. */
    eta: string;
};

export type CollectionPoint = {
    id: string;
    label: string;
    address: string;
    hours: string;
};

export const DELIVERY_ZONES: DeliveryZone[] = [
    {
        id: 'harare',
        label: 'Harare',
        detail: 'CBD and surrounding suburbs',
        fee: 5,
        eta: '1–2 days',
    },
    {
        id: 'greater-harare',
        label: 'Greater Harare',
        detail: 'Chitungwiza, Norton, Ruwa, Epworth',
        fee: 8,
        eta: '2–3 days',
    },
    {
        id: 'national',
        label: 'Elsewhere in Zimbabwe',
        detail: 'Bulawayo, Mutare, Gweru, Victoria Falls and beyond',
        fee: 12,
        eta: '3–5 days',
    },
    {
        id: 'regional',
        label: 'Regional',
        detail: 'South Africa, Zambia, Botswana, Namibia',
        fee: 25,
        eta: '7–10 days',
    },
];

export const COLLECTION_POINTS: CollectionPoint[] = [
    {
        id: 'harare-studio',
        label: 'Harare studio',
        address: 'Address to be confirmed, Harare',
        hours: 'Mon–Fri, 9am–5pm · Sat, 9am–1pm',
    },
];

/** Orders at or above this are delivered without a fee. */
export const FREE_DELIVERY_FROM = 120;

export type Fulfilment =
    | { method: 'collection'; pointId: string }
    | { method: 'delivery'; zoneId: string };

export function zoneById(id: string) {
    return DELIVERY_ZONES.find((zone) => zone.id === id) ?? null;
}

export function pointById(id: string) {
    return COLLECTION_POINTS.find((point) => point.id === id) ?? null;
}

/** Collection is always free; delivery is free once the order is large enough. */
export function deliveryFee(fulfilment: Fulfilment, subtotal: number): number {
    if (fulfilment.method === 'collection') {
        return 0;
    }

    if (subtotal >= FREE_DELIVERY_FROM) {
        return 0;
    }

    return zoneById(fulfilment.zoneId)?.fee ?? 0;
}

export type PaymentMethod = {
    id: string;
    label: string;
    detail: string;
    /** False until the account is actually connected. */
    live: boolean;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'ecocash',
        label: 'EcoCash',
        detail: 'Pay from your mobile wallet',
        live: false,
    },
    {
        id: 'innbucks',
        label: 'InnBucks',
        detail: 'Scan and pay',
        live: false,
    },
    {
        id: 'transfer',
        label: 'Bank transfer',
        detail: 'We send details and confirm on receipt',
        live: false,
    },
    {
        id: 'on-collection',
        label: 'Pay on collection',
        detail: 'Cash or swipe when you pick up',
        live: false,
    },
];
