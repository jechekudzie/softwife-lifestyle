import { router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

type Zone = {
    id: number;
    name: string;
    detail: string | null;
    fee: number;
    eta: string | null;
    isActive: boolean;
};

type Point = {
    id: number;
    name: string;
    address: string;
    hours: string | null;
    isActive: boolean;
};

type Shop = {
    currency: string;
    customFee: number;
    customLeadTime: string;
    freeDeliveryFrom: number;
};

const cell =
    'border-wine/20 w-full rounded-lg border bg-white/80 px-3 py-2 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none';

export default function Fulfilment({
    zones: initialZones,
    points: initialPoints,
    shop,
}: {
    zones: Zone[];
    points: Point[];
    shop: Shop;
}) {
    const [zones, setZones] = useState(initialZones);
    const [points, setPoints] = useState(initialPoints);
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        router.put(
            '/admin/fulfilment',
            {
                zones: zones.map((zone) => ({
                    id: zone.id,
                    name: zone.name,
                    detail: zone.detail,
                    fee: zone.fee,
                    eta: zone.eta,
                    is_active: zone.isActive,
                })),
                points: points.map((point) => ({
                    id: point.id,
                    name: point.name,
                    address: point.address,
                    hours: point.hours,
                    is_active: point.isActive,
                })),
            },
            { onFinish: () => setSaving(false), preserveScroll: true },
        );
    };

    const setZone = (id: number, patch: Partial<Zone>) =>
        setZones((rows) =>
            rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );

    const setPoint = (id: number, patch: Partial<Point>) =>
        setPoints((rows) =>
            rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );

    return (
        <AdminLayout
            title="Fulfilment"
            description="Where you deliver, what it costs, and where people collect."
            actions={
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="bg-wine hover:bg-wine-soft rounded-full px-7 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                >
                    {saving ? 'Saving…' : 'Save changes'}
                </button>
            }
        >
            <section className="border-wine/12 rounded-2xl border bg-white/60 p-7">
                <h2 className="font-display text-lg font-bold">
                    Delivery zones
                </h2>

                <ul className="mt-6 space-y-5">
                    {zones.map((zone) => (
                        <li
                            key={zone.id}
                            className="border-wine/10 grid gap-3 border-b pb-5 last:border-0 last:pb-0 sm:grid-cols-[1.2fr_1.6fr_0.6fr_0.8fr_auto] sm:items-center"
                        >
                            <input
                                aria-label="Zone name"
                                value={zone.name}
                                onChange={(event) =>
                                    setZone(zone.id, {
                                        name: event.target.value,
                                    })
                                }
                                className={cell}
                            />
                            <input
                                aria-label="Zone detail"
                                value={zone.detail ?? ''}
                                onChange={(event) =>
                                    setZone(zone.id, {
                                        detail: event.target.value,
                                    })
                                }
                                placeholder="Suburbs covered"
                                className={cell}
                            />
                            <input
                                aria-label="Fee"
                                type="number"
                                step="0.01"
                                min={0}
                                value={zone.fee}
                                onChange={(event) =>
                                    setZone(zone.id, {
                                        fee: Number(event.target.value),
                                    })
                                }
                                className={`${cell} tabular-nums`}
                            />
                            <input
                                aria-label="Arrival window"
                                value={zone.eta ?? ''}
                                onChange={(event) =>
                                    setZone(zone.id, {
                                        eta: event.target.value,
                                    })
                                }
                                placeholder="1–2 days"
                                className={cell}
                            />
                            <label className="flex items-center gap-2 text-xs whitespace-nowrap opacity-65">
                                <input
                                    type="checkbox"
                                    checked={zone.isActive}
                                    onChange={(event) =>
                                        setZone(zone.id, {
                                            isActive: event.target.checked,
                                        })
                                    }
                                    className="accent-wine h-4 w-4"
                                />
                                Offer
                            </label>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="border-wine/12 mt-8 rounded-2xl border bg-white/60 p-7">
                <h2 className="font-display text-lg font-bold">
                    Collection points
                </h2>

                <ul className="mt-6 space-y-5">
                    {points.map((point) => (
                        <li
                            key={point.id}
                            className="border-wine/10 grid gap-3 border-b pb-5 last:border-0 last:pb-0 sm:grid-cols-[1fr_1.6fr_1fr_auto] sm:items-center"
                        >
                            <input
                                aria-label="Point name"
                                value={point.name}
                                onChange={(event) =>
                                    setPoint(point.id, {
                                        name: event.target.value,
                                    })
                                }
                                className={cell}
                            />
                            <input
                                aria-label="Address"
                                value={point.address}
                                onChange={(event) =>
                                    setPoint(point.id, {
                                        address: event.target.value,
                                    })
                                }
                                className={cell}
                            />
                            <input
                                aria-label="Hours"
                                value={point.hours ?? ''}
                                onChange={(event) =>
                                    setPoint(point.id, {
                                        hours: event.target.value,
                                    })
                                }
                                className={cell}
                            />
                            <label className="flex items-center gap-2 text-xs whitespace-nowrap opacity-65">
                                <input
                                    type="checkbox"
                                    checked={point.isActive}
                                    onChange={(event) =>
                                        setPoint(point.id, {
                                            isActive: event.target.checked,
                                        })
                                    }
                                    className="accent-wine h-4 w-4"
                                />
                                Offer
                            </label>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="border-wine/12 mt-8 rounded-2xl border border-dashed p-7">
                <h2 className="font-display text-lg font-bold">
                    Set in configuration
                </h2>
                <p className="mt-2 text-sm opacity-55">
                    These live in <code>config/shop.php</code> and their
                    matching <code>.env</code> keys, so they change per
                    environment rather than per click.
                </p>

                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="opacity-50">Currency</dt>
                        <dd className="font-medium">{shop.currency}</dd>
                    </div>
                    <div>
                        <dt className="opacity-50">Free delivery from</dt>
                        <dd className="font-medium tabular-nums">
                            ${shop.freeDeliveryFrom.toFixed(2)}
                        </dd>
                    </div>
                    <div>
                        <dt className="opacity-50">Custom affirmation fee</dt>
                        <dd className="font-medium tabular-nums">
                            ${shop.customFee.toFixed(2)}
                        </dd>
                    </div>
                    <div>
                        <dt className="opacity-50">Custom lead time</dt>
                        <dd className="font-medium">{shop.customLeadTime}</dd>
                    </div>
                </dl>
            </section>
        </AdminLayout>
    );
}
