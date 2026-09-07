<?php

return [
    /** Displayed and stored against every order. */
    'currency' => env('SHOP_CURRENCY', 'USD'),

    /** Surcharge for a garment printed with the customer's own words. */
    'custom_affirmation_fee_cents' => (int) env('SHOP_CUSTOM_FEE_CENTS', 1200),

    /** Extra time a made-to-order piece adds to delivery. */
    'custom_lead_time' => env('SHOP_CUSTOM_LEAD_TIME', '10–14 days'),

    /** Delivery is waived at or above this order subtotal. */
    'free_delivery_from_cents' => (int) env('SHOP_FREE_DELIVERY_FROM_CENTS', 12000),

    /** Sizes offered across the catalogue. */
    'sizes' => ['XS', 'S', 'M', 'L', 'XL', '2XL'],
];
