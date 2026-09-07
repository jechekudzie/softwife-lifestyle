<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CollectionPoint;
use App\Models\DeliveryZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FulfilmentController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/fulfilment', [
            'zones' => DeliveryZone::orderBy('position')->get()->map(fn (DeliveryZone $zone) => [
                'id' => $zone->id,
                'name' => $zone->name,
                'detail' => $zone->detail,
                'fee' => $zone->fee_cents / 100,
                'eta' => $zone->eta,
                'isActive' => $zone->is_active,
            ]),
            'points' => CollectionPoint::orderBy('position')->get()->map(fn (CollectionPoint $point) => [
                'id' => $point->id,
                'name' => $point->name,
                'address' => $point->address,
                'hours' => $point->hours,
                'isActive' => $point->is_active,
            ]),
            'shop' => [
                'currency' => config('shop.currency'),
                'customFee' => config('shop.custom_affirmation_fee_cents') / 100,
                'customLeadTime' => config('shop.custom_lead_time'),
                'freeDeliveryFrom' => config('shop.free_delivery_from_cents') / 100,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'zones' => ['array'],
            'zones.*.id' => ['required', 'exists:delivery_zones,id'],
            'zones.*.name' => ['required', 'string', 'max:80'],
            'zones.*.detail' => ['nullable', 'string', 'max:180'],
            'zones.*.fee' => ['required', 'numeric', 'min:0', 'max:10000'],
            'zones.*.eta' => ['nullable', 'string', 'max:60'],
            'zones.*.is_active' => ['required', 'boolean'],
            'points' => ['array'],
            'points.*.id' => ['required', 'exists:collection_points,id'],
            'points.*.name' => ['required', 'string', 'max:80'],
            'points.*.address' => ['required', 'string', 'max:180'],
            'points.*.hours' => ['nullable', 'string', 'max:120'],
            'points.*.is_active' => ['required', 'boolean'],
        ]);

        foreach ($data['zones'] ?? [] as $row) {
            DeliveryZone::whereKey($row['id'])->update([
                'name' => $row['name'],
                'detail' => $row['detail'] ?? null,
                'fee_cents' => (int) round($row['fee'] * 100),
                'eta' => $row['eta'] ?? null,
                'is_active' => $row['is_active'],
            ]);
        }

        foreach ($data['points'] ?? [] as $row) {
            CollectionPoint::whereKey($row['id'])->update([
                'name' => $row['name'],
                'address' => $row['address'],
                'hours' => $row['hours'] ?? null,
                'is_active' => $row['is_active'],
            ]);
        }

        return back()->with('success', 'Fulfilment updated.');
    }
}
