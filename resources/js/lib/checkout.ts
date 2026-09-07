/**
 * Fulfilment shapes shared by the checkout screens.
 *
 * Zones, collection points and fees now come from the database through the
 * controller. Payment methods stay here until a provider is connected.
 */

/** Which fulfilment the shopper chose, and the option they picked within it. */
export type Fulfilment =
    | { method: 'collection'; pointId: string }
    | { method: 'delivery'; zoneId: string };

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
