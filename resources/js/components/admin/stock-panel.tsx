import { router } from '@inertiajs/react';
import { PackagePlus, Pencil } from 'lucide-react';
import { useState } from 'react';

export type SizeCell = { id: number; stock: number; isActive: boolean };

export type StockRow = {
    colourwayId: number;
    name: string;
    cloth: string;
    ink: string;
    total: number;
    sizes: Record<string, SizeCell>;
};

export type Batch = {
    id: number;
    reference: string;
    receivedOn: string;
    received: number;
    unitCost: number | null;
    landedUnitCost: number | null;
    supplier: string | null;
    by: string | null;
    note: string | null;
};

export type Supplier = { id: number; name: string };

const cell =
    'border-wine/20 w-full rounded-lg border bg-white/80 px-2 py-1.5 text-center text-sm tabular-nums focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none';

const field =
    'border-wine/20 mt-2 w-full rounded-xl border bg-white/70 px-4 py-2.5 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none';

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span className="block text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
            {children}
        </span>
    );
}

/**
 * Stock, as a colourway-by-size grid.
 *
 * Receiving a batch adds to stock and is what should normally happen. Editing
 * a cell directly is a correction, and is recorded as one.
 */
export function StockPanel({
    productSlug,
    sizes,
    rows: initialRows,
    batches,
    suppliers,
}: {
    productSlug: string;
    sizes: string[];
    rows: StockRow[];
    batches: Batch[];
    suppliers: Supplier[];
}) {
    const [rows, setRows] = useState(initialRows);
    const [mode, setMode] = useState<'receive' | 'correct'>('receive');
    const [busy, setBusy] = useState(false);

    // Batch intake, keyed by variant id.
    const [intake, setIntake] = useState<Record<number, string>>({});
    const [reference, setReference] = useState('');
    const [receivedOn, setReceivedOn] = useState(
        new Date().toISOString().slice(0, 10),
    );
    const [supplierId, setSupplierId] = useState<string>('');
    const [unitCost, setUnitCost] = useState('');
    const [freight, setFreight] = useState('');
    const [duty, setDuty] = useState('');
    const [other, setOther] = useState('');
    const [note, setNote] = useState('');

    const intakeUnits = Object.values(intake).reduce(
        (sum, value) => sum + (Number(value) || 0),
        0,
    );

    const extras =
        (Number(freight) || 0) + (Number(duty) || 0) + (Number(other) || 0);
    const landed = intakeUnits
        ? (Number(unitCost) || 0) + extras / intakeUnits
        : null;

    const setCell = (variantId: number, stock: number) =>
        setRows((current) =>
            current.map((row) => {
                const entry = Object.entries(row.sizes).find(
                    ([, value]) => value.id === variantId,
                );

                if (!entry) {
                    return row;
                }

                return {
                    ...row,
                    sizes: {
                        ...row.sizes,
                        [entry[0]]: { ...entry[1], stock },
                    },
                };
            }),
        );

    const saveCorrections = () => {
        setBusy(true);
        router.put(
            `/admin/products/${productSlug}/stock`,
            {
                variants: rows.flatMap((row) =>
                    Object.values(row.sizes).map((size) => ({
                        id: size.id,
                        stock: size.stock,
                        is_active: size.isActive,
                    })),
                ),
            },
            { onFinish: () => setBusy(false), preserveScroll: true },
        );
    };

    const receive = () => {
        setBusy(true);
        router.post(
            `/admin/products/${productSlug}/batches`,
            {
                reference,
                received_on: receivedOn,
                supplier_id: supplierId || null,
                unit_cost: unitCost || null,
                freight: freight || null,
                duty: duty || null,
                other_cost: other || null,
                note: note || null,
                quantities: intake,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIntake({});
                    setReference('');
                    setUnitCost('');
                    setFreight('');
                    setDuty('');
                    setOther('');
                    setNote('');
                },
                onFinish: () => setBusy(false),
            },
        );
    };

    return (
        <section className="border-wine/12 mt-8 rounded-2xl border bg-white/60 p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-lg font-bold">Stock</h2>
                    <p className="mt-1 text-sm opacity-55">
                        {mode === 'receive'
                            ? 'Enter what arrived. It is added to what is already there.'
                            : 'Set the true count. The difference is recorded as a correction.'}
                    </p>
                </div>

                <div className="border-wine/15 flex rounded-full border p-1">
                    <button
                        type="button"
                        onClick={() => setMode('receive')}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            mode === 'receive'
                                ? 'bg-wine text-white'
                                : 'hover:opacity-60'
                        }`}
                    >
                        <PackagePlus className="h-3.5 w-3.5" />
                        Receive a batch
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('correct')}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            mode === 'correct'
                                ? 'bg-wine text-white'
                                : 'hover:opacity-60'
                        }`}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Correct a count
                    </button>
                </div>
            </div>

            {/* Scrolls rather than running to thirty-six rows. */}
            <div className="mt-6 max-h-[26rem] overflow-auto rounded-xl">
                <table className="w-full min-w-[38rem] border-separate border-spacing-0 text-sm">
                    <thead className="bg-bone sticky top-0 z-10">
                        <tr>
                            <th className="border-wine/12 border-b py-3 pr-4 text-left text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45">
                                Colourway
                            </th>
                            {sizes.map((size) => (
                                <th
                                    key={size}
                                    className="border-wine/12 border-b px-1.5 py-3 text-center text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45"
                                >
                                    {size}
                                </th>
                            ))}
                            <th className="border-wine/12 border-b py-3 pl-4 text-right text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45">
                                {mode === 'receive' ? 'Adding' : 'Total'}
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row) => {
                            const adding = Object.values(row.sizes).reduce(
                                (sum, size) =>
                                    sum + (Number(intake[size.id]) || 0),
                                0,
                            );

                            return (
                                <tr key={row.colourwayId}>
                                    <td className="border-wine/08 border-b py-2.5 pr-4">
                                        <span className="flex items-center gap-2.5">
                                            <span
                                                aria-hidden="true"
                                                className="border-wine/15 h-6 w-6 shrink-0 rounded-full border"
                                                style={{
                                                    backgroundColor: row.cloth,
                                                }}
                                            />
                                            <span className="font-medium whitespace-nowrap">
                                                {row.name}
                                            </span>
                                        </span>
                                    </td>

                                    {sizes.map((size) => {
                                        const variant = row.sizes[size];

                                        if (!variant) {
                                            return (
                                                <td
                                                    key={size}
                                                    className="border-wine/08 border-b px-1.5 py-2.5 text-center opacity-25"
                                                >
                                                    –
                                                </td>
                                            );
                                        }

                                        return (
                                            <td
                                                key={size}
                                                className="border-wine/08 border-b px-1.5 py-2.5"
                                            >
                                                {mode === 'receive' ? (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        placeholder="0"
                                                        aria-label={`${row.name} ${size} received`}
                                                        value={
                                                            intake[
                                                                variant.id
                                                            ] ?? ''
                                                        }
                                                        onChange={(event) =>
                                                            setIntake(
                                                                (current) => ({
                                                                    ...current,
                                                                    [variant.id]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                }),
                                                            )
                                                        }
                                                        className={cell}
                                                    />
                                                ) : (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        aria-label={`${row.name} ${size} stock`}
                                                        value={variant.stock}
                                                        onChange={(event) =>
                                                            setCell(
                                                                variant.id,
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className={`${cell} ${
                                                            variant.stock === 0
                                                                ? 'text-magenta'
                                                                : ''
                                                        }`}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}

                                    <td className="border-wine/08 border-b py-2.5 pl-4 text-right font-medium tabular-nums">
                                        {mode === 'receive' ? (
                                            adding ? (
                                                <span className="text-wine">
                                                    +{adding}
                                                </span>
                                            ) : (
                                                <span className="opacity-25">
                                                    –
                                                </span>
                                            )
                                        ) : (
                                            Object.values(row.sizes).reduce(
                                                (sum, size) => sum + size.stock,
                                                0,
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {mode === 'receive' ? (
                <div className="border-wine/12 mt-7 border-t pt-7">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <label>
                            <Label>Batch reference</Label>
                            <input
                                value={reference}
                                onChange={(event) =>
                                    setReference(event.target.value)
                                }
                                placeholder="AUG-RUN-01"
                                className={field}
                            />
                        </label>

                        <label>
                            <Label>Received on</Label>
                            <input
                                type="date"
                                value={receivedOn}
                                onChange={(event) =>
                                    setReceivedOn(event.target.value)
                                }
                                className={field}
                            />
                        </label>

                        <label>
                            <Label>Supplier</Label>
                            <select
                                value={supplierId}
                                onChange={(event) =>
                                    setSupplierId(event.target.value)
                                }
                                className={field}
                            >
                                <option value="">Not recorded</option>
                                {suppliers.map((supplier) => (
                                    <option
                                        key={supplier.id}
                                        value={supplier.id}
                                    >
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <Label>Cost per piece</Label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={unitCost}
                                onChange={(event) =>
                                    setUnitCost(event.target.value)
                                }
                                placeholder="0.00"
                                className={field}
                            />
                        </label>

                        <label>
                            <Label>Freight (batch)</Label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={freight}
                                onChange={(event) =>
                                    setFreight(event.target.value)
                                }
                                placeholder="0.00"
                                className={field}
                            />
                        </label>

                        <label>
                            <Label>Duty and clearing</Label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={duty}
                                onChange={(event) =>
                                    setDuty(event.target.value)
                                }
                                placeholder="0.00"
                                className={field}
                            />
                        </label>

                        <label>
                            <Label>Anything else</Label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={other}
                                onChange={(event) =>
                                    setOther(event.target.value)
                                }
                                placeholder="0.00"
                                className={field}
                            />
                        </label>

                        <label className="sm:col-span-2">
                            <Label>Note</Label>
                            <input
                                value={note}
                                onChange={(event) =>
                                    setNote(event.target.value)
                                }
                                placeholder="Printer, courier, anything worth remembering"
                                className={field}
                            />
                        </label>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
                        <div className="text-sm">
                            <p>
                                <span className="opacity-55">Receiving</span>{' '}
                                <span className="font-semibold tabular-nums">
                                    {intakeUnits}
                                </span>{' '}
                                <span className="opacity-55">
                                    {intakeUnits === 1 ? 'piece' : 'pieces'}
                                </span>
                            </p>
                            {landed !== null && landed > 0 ? (
                                <p className="mt-1 text-xs opacity-55">
                                    Landed cost{' '}
                                    <span className="font-semibold tabular-nums">
                                        ${landed.toFixed(2)}
                                    </span>{' '}
                                    each, freight and duty included
                                </p>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={receive}
                            disabled={busy || !intakeUnits || !reference.trim()}
                            className="bg-wine hover:bg-wine-soft rounded-full px-8 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy ? 'Receiving…' : 'Receive batch'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-7 flex justify-end">
                    <button
                        type="button"
                        onClick={saveCorrections}
                        disabled={busy}
                        className="bg-wine hover:bg-wine-soft rounded-full px-8 py-3.5 text-sm font-semibold text-white transition disabled:opacity-50"
                    >
                        {busy ? 'Saving…' : 'Save corrections'}
                    </button>
                </div>
            )}

            {batches.length ? (
                <div className="border-wine/12 mt-8 border-t pt-7">
                    <h3 className="text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                        Recent batches
                    </h3>

                    <ul className="mt-4 divide-y divide-[rgba(107,33,55,0.08)]">
                        {batches.map((batch) => (
                            <li
                                key={batch.id}
                                className="flex flex-wrap items-baseline justify-between gap-3 py-3"
                            >
                                <span className="min-w-0">
                                    <span className="text-sm font-semibold">
                                        {batch.reference}
                                    </span>
                                    <span className="ml-2 text-xs opacity-50">
                                        {batch.receivedOn}
                                        {batch.supplier
                                            ? ` · ${batch.supplier}`
                                            : ''}
                                        {batch.by ? ` · ${batch.by}` : ''}
                                    </span>
                                </span>
                                <span className="text-sm tabular-nums">
                                    <span className="font-medium">
                                        {batch.received}
                                    </span>
                                    <span className="opacity-50"> pieces</span>
                                    {batch.landedUnitCost !== null ? (
                                        <span className="opacity-50">
                                            {' '}
                                            · ${batch.landedUnitCost.toFixed(
                                                2,
                                            )}{' '}
                                            landed
                                        </span>
                                    ) : null}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </section>
    );
}
