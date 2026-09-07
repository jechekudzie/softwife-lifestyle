<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StockBatch;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/suppliers', [
            'suppliers' => Supplier::withCount('batches')
                ->orderBy('position')
                ->orderBy('name')
                ->get()
                ->map(fn (Supplier $supplier) => [
                    'slug' => $supplier->slug,
                    'name' => $supplier->name,
                    'contactName' => $supplier->contact_name,
                    'email' => $supplier->email,
                    'phone' => $supplier->phone,
                    'city' => $supplier->city,
                    'country' => $supplier->country,
                    'note' => $supplier->note,
                    'isActive' => $supplier->is_active,
                    'batches' => $supplier->batches_count,
                    'spend' => $this->spend($supplier) / 100,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Supplier::create($data + ['slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(4))]);

        return back()->with('success', "{$data['name']} added.");
    }

    public function update(Request $request, Supplier $supplier): RedirectResponse
    {
        $supplier->update($this->validated($request, $supplier));

        return back()->with('success', "{$supplier->name} saved.");
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Supplier $supplier = null): array
    {
        return $request->validate([
            'name' => [
                'required', 'string', 'max:80',
                Rule::unique('suppliers', 'name')->ignore($supplier),
            ],
            'contact_name' => ['nullable', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40'],
            'city' => ['nullable', 'string', 'max:80'],
            'country' => ['nullable', 'string', 'max:80'],
            'note' => ['nullable', 'string', 'max:500'],
            'is_active' => ['required', 'boolean'],
        ]);
    }

    /** What has been spent with a supplier, landed. */
    private function spend(Supplier $supplier): int
    {
        return $supplier->batches
            ->sum(fn (StockBatch $batch) => $batch->landedTotalCents() ?? 0);
    }
}
