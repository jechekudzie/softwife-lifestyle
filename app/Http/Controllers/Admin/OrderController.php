<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public const STATUSES = ['pending', 'printing', 'ready', 'shipped', 'collected', 'cancelled'];

    public const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();

        $orders = Order::query()
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($search !== '', function ($query) use ($search) {
                /**
                 * Lowercased on both sides: `like` is case-sensitive on
                 * PostgreSQL, so searching "tendai" would otherwise miss
                 * "Tendai Moyo" in production while working locally.
                 */
                $term = '%'.mb_strtolower($search).'%';

                $query->where(fn ($inner) => $inner
                    ->whereRaw('lower(reference) like ?', [$term])
                    ->orWhereRaw('lower(customer_name) like ?', [$term])
                    ->orWhereRaw('lower(email) like ?', [$term]));
            })
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders->through(fn (Order $order) => [
                'reference' => $order->reference,
                'customerName' => $order->customer_name,
                'email' => $order->email,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'fulfilmentMethod' => $order->fulfilment_method,
                'total' => $order->total_cents / 100,
                'placedAt' => $order->created_at?->toDayDateTimeString(),
            ]),
            'filters' => ['status' => $status, 'search' => $search],
            'statuses' => self::STATUSES,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load('items', 'deliveryZone', 'collectionPoint');

        return Inertia::render('admin/orders/show', [
            'order' => [
                'reference' => $order->reference,
                'status' => $order->status,
                'paymentStatus' => $order->payment_status,
                'paymentMethod' => $order->payment_method,
                'paymentReference' => $order->payment_reference,
                'customerName' => $order->customer_name,
                'email' => $order->email,
                'phone' => $order->phone,
                'fulfilmentMethod' => $order->fulfilment_method,
                'zone' => $order->deliveryZone?->only(['name', 'eta']),
                'point' => $order->collectionPoint?->only(['name', 'address']),
                'addressLine' => $order->address_line,
                'suburb' => $order->suburb,
                'city' => $order->city,
                'notes' => $order->notes,
                'subtotal' => $order->subtotal_cents / 100,
                'deliveryFee' => $order->delivery_fee_cents / 100,
                'total' => $order->total_cents / 100,
                'currency' => $order->currency,
                'placedAt' => $order->created_at?->toDayDateTimeString(),
                'items' => $order->items->map(fn (OrderItem $item) => [
                    'name' => $item->name,
                    'colourway' => $item->colourway,
                    'size' => $item->size,
                    'sku' => $item->sku,
                    'custom' => $item->custom_affirmation,
                    'quantity' => $item->quantity,
                    'unitPrice' => $item->unit_price_cents / 100,
                    'total' => $item->total_cents / 100,
                ]),
            ],
            'statuses' => self::STATUSES,
            'paymentStatuses' => self::PAYMENT_STATUSES,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
            'payment_status' => ['required', Rule::in(self::PAYMENT_STATUSES)],
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $order->update($data);

        return back()->with('success', "{$order->reference} updated.");
    }
}
