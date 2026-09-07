<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /** The confirmation page. Reachable by reference, which is unguessable enough for a receipt. */
    public function show(Order $order): Response
    {
        $order->load('items', 'deliveryZone', 'collectionPoint');

        return Inertia::render('order', [
            'order' => [
                'reference' => $order->reference,
                'status' => $order->status,
                'customerName' => $order->customer_name,
                'email' => $order->email,
                'fulfilmentMethod' => $order->fulfilment_method,
                'zone' => $order->deliveryZone?->only(['name', 'eta']),
                'point' => $order->collectionPoint?->only(['name', 'address', 'hours']),
                'addressLine' => $order->address_line,
                'suburb' => $order->suburb,
                'city' => $order->city,
                'subtotal' => $order->subtotal_cents / 100,
                'deliveryFee' => $order->delivery_fee_cents / 100,
                'total' => $order->total_cents / 100,
                'currency' => $order->currency,
                'paymentMethod' => $order->payment_method,
                'paymentStatus' => $order->payment_status,
                'placedAt' => $order->placed_at?->toDayDateTimeString(),
                'hasCustom' => $order->hasCustomItems(),
                'items' => $order->items->map(fn (OrderItem $item) => [
                    'name' => $item->name,
                    'colourway' => $item->colourway,
                    'size' => $item->size,
                    'custom' => $item->custom_affirmation,
                    'quantity' => $item->quantity,
                    'total' => $item->total_cents / 100,
                ]),
            ],
            'customLeadTime' => config('shop.custom_lead_time'),
        ]);
    }
}
