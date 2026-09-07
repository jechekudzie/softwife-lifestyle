import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

type Supplier = {
    slug: string;
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    note: string | null;
    isActive: boolean;
    batches: number;
    spend: number;
};

const field =
    'border-wine/20 w-full rounded-xl border bg-white/70 px-4 py-2.5 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none';

function Row({ supplier }: { supplier: Supplier }) {
    const [draft, setDraft] = useState(supplier);
    const [busy, setBusy] = useState(false);

    const save = () => {
        setBusy(true);
        router.put(
            `/admin/suppliers/${supplier.slug}`,
            {
                name: draft.name,
                contact_name: draft.contactName,
                email: draft.email,
                phone: draft.phone,
                city: draft.city,
                country: draft.country,
                note: draft.note,
                is_active: draft.isActive,
            },
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };

    return (
        <li className="border-wine/12 rounded-2xl border bg-white/60 p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label>
                    <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                        Supplier
                    </span>
                    <input
                        value={draft.name}
                        onChange={(event) =>
                            setDraft({ ...draft, name: event.target.value })
                        }
                        className={`${field} mt-2`}
                    />
                </label>

                <label>
                    <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                        Contact
                    </span>
                    <input
                        value={draft.contactName ?? ''}
                        onChange={(event) =>
                            setDraft({
                                ...draft,
                                contactName: event.target.value,
                            })
                        }
                        className={`${field} mt-2`}
                    />
                </label>

                <label>
                    <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                        Phone
                    </span>
                    <input
                        value={draft.phone ?? ''}
                        onChange={(event) =>
                            setDraft({ ...draft, phone: event.target.value })
                        }
                        className={`${field} mt-2`}
                    />
                </label>

                <label>
                    <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                        Email
                    </span>
                    <input
                        type="email"
                        value={draft.email ?? ''}
                        onChange={(event) =>
                            setDraft({ ...draft, email: event.target.value })
                        }
                        className={`${field} mt-2`}
                    />
                </label>

                <label>
                    <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                        City
                    </span>
                    <input
                        value={draft.city ?? ''}
                        onChange={(event) =>
                            setDraft({ ...draft, city: event.target.value })
                        }
                        className={`${field} mt-2`}
                    />
                </label>

                <label>
                    <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                        Country
                    </span>
                    <input
                        value={draft.country ?? ''}
                        onChange={(event) =>
                            setDraft({ ...draft, country: event.target.value })
                        }
                        className={`${field} mt-2`}
                    />
                </label>

                <label className="sm:col-span-2 lg:col-span-3">
                    <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                        Note
                    </span>
                    <input
                        value={draft.note ?? ''}
                        onChange={(event) =>
                            setDraft({ ...draft, note: event.target.value })
                        }
                        placeholder="Lead times, minimums, anything worth remembering"
                        className={`${field} mt-2`}
                    />
                </label>
            </div>

            <div className="border-wine/10 mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                <div className="flex flex-wrap items-center gap-5 text-xs">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={draft.isActive}
                            onChange={(event) =>
                                setDraft({
                                    ...draft,
                                    isActive: event.target.checked,
                                })
                            }
                            className="accent-wine h-4 w-4"
                        />
                        Still using them
                    </label>
                    <span className="opacity-50">
                        {supplier.batches}{' '}
                        {supplier.batches === 1 ? 'batch' : 'batches'} ·{' '}
                        <span className="tabular-nums">
                            ${supplier.spend.toFixed(2)}
                        </span>{' '}
                        landed
                    </span>
                </div>

                <button
                    type="button"
                    onClick={save}
                    disabled={busy}
                    className="bg-wine hover:bg-wine-soft rounded-full px-7 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                >
                    {busy ? 'Saving…' : 'Save'}
                </button>
            </div>
        </li>
    );
}

export default function Suppliers({ suppliers }: { suppliers: Supplier[] }) {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);

    const create = () => {
        setBusy(true);
        router.post(
            '/admin/suppliers',
            { name, is_active: true },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setName('');
                    setAdding(false);
                },
                onFinish: () => setBusy(false),
            },
        );
    };

    return (
        <AdminLayout
            title="Suppliers"
            description="Who prints and ships for you, and what you have spent with them."
            actions={
                <button
                    type="button"
                    onClick={() => setAdding((value) => !value)}
                    className="bg-wine hover:bg-wine-soft flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition"
                >
                    <Plus className="h-4 w-4" />
                    Add a supplier
                </button>
            }
        >
            {adding ? (
                <div className="border-wine/12 mb-6 flex flex-wrap items-end gap-4 rounded-2xl border bg-white/60 p-6">
                    <label className="flex-1">
                        <span className="text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45">
                            Supplier name
                        </span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Harare Print Co"
                            className={`${field} mt-2`}
                        />
                    </label>
                    <button
                        type="button"
                        onClick={create}
                        disabled={busy || name.trim().length < 2}
                        className="bg-wine hover:bg-wine-soft rounded-full px-7 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
                    >
                        {busy ? 'Adding…' : 'Add'}
                    </button>
                </div>
            ) : null}

            {suppliers.length ? (
                <ul className="space-y-5">
                    {suppliers.map((supplier) => (
                        <Row key={supplier.slug} supplier={supplier} />
                    ))}
                </ul>
            ) : (
                <p className="border-wine/12 rounded-2xl border bg-white/60 px-5 py-16 text-center text-sm opacity-50">
                    No suppliers yet. Add the printer you use.
                </p>
            )}
        </AdminLayout>
    );
}
