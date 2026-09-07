import { Form, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

type Product = {
    slug: string;
    name: string;
    categoryId: number;
    era: string;
    phrase: string;
    affirmation: string;
    price: number;
    compareAt: number | null;
    badge: string | null;
    heroImage: string | null;
    heroGround: string;
    cardImage: string | null;
    picturedLabel: string | null;
    isActive: boolean;
};

type Variant = {
    id: number;
    colourway: string;
    size: string;
    sku: string;
    stock: number;
    isActive: boolean;
};

function Label({
    htmlFor,
    children,
}: {
    htmlFor: string;
    children: React.ReactNode;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-[0.6rem] font-semibold tracking-[0.22em] uppercase opacity-45"
        >
            {children}
        </label>
    );
}

const input =
    'border-wine/20 mt-2 w-full rounded-xl border bg-white/70 px-4 py-3 text-sm focus-visible:ring-4 focus-visible:ring-[var(--color-rose)] focus-visible:outline-none';

export default function EditProduct({
    product,
    categories,
    variants,
    grounds,
}: {
    product: Product;
    categories: { id: number; name: string }[];
    variants: Variant[];
    grounds: string[];
}) {
    const [stock, setStock] = useState(variants);
    const [savingStock, setSavingStock] = useState(false);

    const saveStock = () => {
        setSavingStock(true);
        router.put(
            `/admin/products/${product.slug}/stock`,
            {
                variants: stock.map((variant) => ({
                    id: variant.id,
                    stock: variant.stock,
                    is_active: variant.isActive,
                })),
            },
            { onFinish: () => setSavingStock(false), preserveScroll: true },
        );
    };

    const setRow = (id: number, patch: Partial<Variant>) =>
        setStock((rows) =>
            rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );

    return (
        <AdminLayout
            title={product.name}
            description="Wording, pricing and stock."
            actions={
                <Link
                    href="/admin/products"
                    className="border-wine/25 hover:bg-wine flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    All products
                </Link>
            }
        >
            <Form
                method="put"
                action={`/admin/products/${product.slug}`}
                className="border-wine/12 rounded-2xl border bg-white/60 p-7"
            >
                {({ errors, processing }) => (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <input
                                    id="name"
                                    name="name"
                                    defaultValue={product.name}
                                    className={input}
                                />
                                {errors.name ? (
                                    <p className="text-magenta mt-1.5 text-xs">
                                        {errors.name}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <Label htmlFor="category_id">Category</Label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    defaultValue={product.categoryId}
                                    className={input}
                                >
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="price">Price</Label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={product.price}
                                    className={input}
                                />
                                {errors.price ? (
                                    <p className="text-magenta mt-1.5 text-xs">
                                        {errors.price}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <Label htmlFor="compare_at">
                                    Was price (optional)
                                </Label>
                                <input
                                    id="compare_at"
                                    name="compare_at"
                                    type="number"
                                    step="0.01"
                                    defaultValue={product.compareAt ?? ''}
                                    className={input}
                                />
                                {errors.compare_at ? (
                                    <p className="text-magenta mt-1.5 text-xs">
                                        {errors.compare_at}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <Label htmlFor="era">Era word</Label>
                                <input
                                    id="era"
                                    name="era"
                                    defaultValue={product.era}
                                    className={input}
                                />
                            </div>

                            <div>
                                <Label htmlFor="phrase">Hero phrase</Label>
                                <input
                                    id="phrase"
                                    name="phrase"
                                    defaultValue={product.phrase}
                                    className={input}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="affirmation">
                                    Printed affirmation
                                </Label>
                                <textarea
                                    id="affirmation"
                                    name="affirmation"
                                    rows={3}
                                    defaultValue={product.affirmation}
                                    className={input}
                                />
                                {errors.affirmation ? (
                                    <p className="text-magenta mt-1.5 text-xs">
                                        {errors.affirmation}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <Label htmlFor="badge">Badge (optional)</Label>
                                <input
                                    id="badge"
                                    name="badge"
                                    defaultValue={product.badge ?? ''}
                                    className={input}
                                />
                            </div>

                            <div>
                                <Label htmlFor="hero_ground">Hero ground</Label>
                                <select
                                    id="hero_ground"
                                    name="hero_ground"
                                    defaultValue={product.heroGround}
                                    className={input}
                                >
                                    {grounds.map((ground) => (
                                        <option key={ground} value={ground}>
                                            {ground}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="hero_image">Hero image</Label>
                                <input
                                    id="hero_image"
                                    name="hero_image"
                                    defaultValue={product.heroImage ?? ''}
                                    placeholder="/media/…"
                                    className={input}
                                />
                            </div>

                            <div>
                                <Label htmlFor="card_image">Card image</Label>
                                <input
                                    id="card_image"
                                    name="card_image"
                                    defaultValue={product.cardImage ?? ''}
                                    placeholder="/media/…"
                                    className={input}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="pictured_label">
                                    Colourway pictured
                                </Label>
                                <input
                                    id="pictured_label"
                                    name="pictured_label"
                                    defaultValue={product.picturedLabel ?? ''}
                                    placeholder="Chocolate · butter print"
                                    className={input}
                                />
                            </div>
                        </div>

                        <label className="mt-7 flex items-center gap-3 text-sm">
                            <input type="hidden" name="is_active" value="0" />
                            <input
                                type="checkbox"
                                name="is_active"
                                value="1"
                                defaultChecked={product.isActive}
                                className="accent-wine h-4 w-4"
                            />
                            Show this product in the shop
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-wine hover:bg-wine-soft mt-8 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save product'}
                        </button>
                    </>
                )}
            </Form>

            <section className="border-wine/12 mt-8 rounded-2xl border bg-white/60 p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="font-display text-lg font-bold">
                            Stock
                        </h2>
                        <p className="mt-1 text-sm opacity-55">
                            One row per colourway and size. Zero means sold out.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={saveStock}
                        disabled={savingStock}
                        className="bg-wine hover:bg-wine-soft rounded-full px-7 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                    >
                        {savingStock ? 'Saving…' : 'Save stock'}
                    </button>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-[34rem] text-sm">
                        <thead>
                            <tr className="border-wine/12 border-b text-left">
                                <th className="pb-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45">
                                    Colourway
                                </th>
                                <th className="pb-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45">
                                    Size
                                </th>
                                <th className="pb-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45">
                                    SKU
                                </th>
                                <th className="pb-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45">
                                    Stock
                                </th>
                                <th className="pb-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase opacity-45">
                                    Sell
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(107,33,55,0.08)]">
                            {stock.map((variant) => (
                                <tr key={variant.id}>
                                    <td className="py-2.5">
                                        {variant.colourway}
                                    </td>
                                    <td className="py-2.5">{variant.size}</td>
                                    <td className="py-2.5 text-xs opacity-45">
                                        {variant.sku}
                                    </td>
                                    <td className="py-2.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={variant.stock}
                                            onChange={(event) =>
                                                setRow(variant.id, {
                                                    stock: Number(
                                                        event.target.value,
                                                    ),
                                                })
                                            }
                                            className={`border-wine/20 w-20 rounded-lg border bg-white/80 px-3 py-1.5 tabular-nums ${
                                                variant.stock === 0
                                                    ? 'text-magenta'
                                                    : ''
                                            }`}
                                        />
                                    </td>
                                    <td className="py-2.5">
                                        <input
                                            type="checkbox"
                                            checked={variant.isActive}
                                            onChange={(event) =>
                                                setRow(variant.id, {
                                                    isActive:
                                                        event.target.checked,
                                                })
                                            }
                                            className="accent-wine h-4 w-4"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </AdminLayout>
    );
}
