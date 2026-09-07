import { Form, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import {
    StockPanel,
    type Batch,
    type StockRow,
    type Supplier,
} from '@/components/admin/stock-panel';
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
    grounds,
    sizes,
    rows,
    batches,
    suppliers,
}: {
    product: Product;
    categories: { id: number; name: string }[];
    grounds: string[];
    sizes: string[];
    rows: StockRow[];
    batches: Batch[];
    suppliers: Supplier[];
}) {
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

            <StockPanel
                productSlug={product.slug}
                sizes={sizes}
                rows={rows}
                batches={batches}
                suppliers={suppliers}
            />
        </AdminLayout>
    );
}
