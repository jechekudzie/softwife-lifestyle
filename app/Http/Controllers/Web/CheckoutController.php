<?php

namespace App\Http\Controllers\Web;

use App\Actions\PlaceOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\CollectionPoint;
use App\Models\DeliveryZone;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('checkout', [
            'zones' => DeliveryZone::active()->get()->map(fn (DeliveryZone $zone) => [
                'slug' => $zone->slug,
                'name' => $zone->name,
                'detail' => $zone->detail,
                'fee' => $zone->fee_cents / 100,
                'eta' => $zone->eta,
            ]),
            'points' => CollectionPoint::active()->get()->map(fn (CollectionPoint $point) => [
                'slug' => $point->slug,
                'name' => $point->name,
                'address' => $point->address,
                'hours' => $point->hours,
            ]),
            'shop' => [
                'currency' => config('shop.currency'),
                'customFee' => config('shop.custom_affirmation_fee_cents') / 100,
                'customLeadTime' => config('shop.custom_lead_time'),
                'freeDeliveryFrom' => config('shop.free_delivery_from_cents') / 100,
            ],
        ]);
    }

    public function store(PlaceOrderRequest $request, PlaceOrder $placeOrder): RedirectResponse
    {
        $order = $placeOrder->handle($request->validated());

        return to_route('orders.show', $order)->with('success', 'Your order is in.');
    }
}
