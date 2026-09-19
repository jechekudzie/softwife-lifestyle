import { Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type Row = {
    slug: string;
    name: string;
    category: string;
    price: number;
    compareAt: number | null;
    badge: string | null;
    isActive: boolean;
    image: string | null;
    stock: number;
    soldOut: number;
    colourways: { name: string; cloth: string }[];
};

/**
 * The line sheet.
 *
 * Cards rather than rows: with a handful of products the list left most of the
 * screen empty, and the thing you actually recognise a line by is the picture.
 */
function ProductCard({ product }: { product: Row }) {
    return (
        <Link
            href={`/admin/products/${product.slug}`}
            className="border-wine/12 group hover:border-magenta/40 block overflow-hidden rounded-2xl border bg-white/70 transition hover:shadow-[0_24px_48px_-32px_rgba(107,33,55,0.55)]"
        >
            <div className="bg-petal relative aspect-[4/5] overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                ) : null}

                {product.badge || !product.isActive ? (
                    <div className="absolute top-3 left-3 flex gap-1.5">
                        {product.badge ? (
                            <span className="text-magenta rounded-full bg-white/90 px-2.5 py-1 text-[0.55rem] font-semibold tracking-[0.14em] uppercase">
                                {product.badge}
                            </span>
                        ) : null}
                        {!product.isActive ? (
                            <span className="text-wine/70 rounded-full bg-white/90 px-2.5 py-1 text-[0.55rem] font-semibold tracking-[0.14em] uppercase">
                                Hidden
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <div className="px-5 py-4">
                <h2 className="font-display text-lg leading-tight font-bold">
                    {product.name}
                </h2>

                <div className="mt-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-xs opacity-50">
                        {product.category}
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                        ${product.price.toFixed(2)}
                        {product.compareAt ? (
                            <span className="ml-1.5 line-through opacity-35">
                                ${product.compareAt.toFixed(2)}
                            </span>
                        ) : null}
                    </span>
                </div>

                <div className="border-wine/10 mt-4 flex items-center justify-between gap-3 border-t pt-3.5">
                    <ul className="flex -space-x-1.5">
                        {product.colourways.map((colourway) => (
                            <li
                                key={colourway.name}
                                title={colourway.name}
                                className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(107,33,55,0.16)] ring-2 ring-white"
                                style={{ backgroundColor: colourway.cloth }}
                            />
                        ))}
                    </ul>

                    <span className="text-xs tabular-nums">
                        <span
                            className={
                                product.stock === 0
                                    ? 'text-magenta'
                                    : 'opacity-55'
                            }
                        >
                            {product.stock} in stock
                        </span>
                        {product.soldOut > 0 ? (
                            <span className="text-magenta ml-2">
                                · {product.soldOut} out
                            </span>
                        ) : null}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function AdminProducts({ products }: { products: Row[] }) {
    const onHand = products.reduce(
        (total, product) => total + product.stock,
        0,
    );

    return (
        <AdminLayout
            title="Products"
            description={`${products.length} lines · ${onHand} pieces on hand.`}
        >
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {products.map((product) => (
                    <li key={product.slug}>
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </AdminLayout>
    );
}
