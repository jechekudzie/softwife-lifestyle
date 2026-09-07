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
};

export default function AdminProducts({ products }: { products: Row[] }) {
    return (
        <AdminLayout
            title="Products"
            description="Prices, wording and stock for every line."
        >
            <ul className="border-wine/12 divide-y divide-[rgba(107,33,55,0.10)] overflow-hidden rounded-2xl border bg-white/60">
                {products.map((product) => (
                    <li key={product.slug}>
                        <Link
                            href={`/admin/products/${product.slug}`}
                            className="hover:bg-petal/60 flex items-center gap-5 px-5 py-4 transition"
                        >
                            <span
                                className="bg-petal h-16 w-14 shrink-0 overflow-hidden rounded-xl"
                                aria-hidden="true"
                            >
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : null}
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                    <span className="font-display font-bold">
                                        {product.name}
                                    </span>
                                    {product.badge ? (
                                        <span className="bg-petal rounded-full px-2 py-0.5 text-[0.55rem] tracking-[0.14em] uppercase opacity-70">
                                            {product.badge}
                                        </span>
                                    ) : null}
                                    {!product.isActive ? (
                                        <span className="border-wine/25 rounded-full border px-2 py-0.5 text-[0.55rem] tracking-[0.14em] uppercase opacity-50">
                                            Hidden
                                        </span>
                                    ) : null}
                                </span>
                                <span className="mt-0.5 block text-xs opacity-50">
                                    {product.category}
                                </span>
                            </span>

                            <span className="text-right">
                                <span className="block text-sm font-medium tabular-nums">
                                    ${product.price.toFixed(2)}
                                    {product.compareAt ? (
                                        <span className="ml-2 line-through opacity-35">
                                            ${product.compareAt.toFixed(2)}
                                        </span>
                                    ) : null}
                                </span>
                                <span
                                    className={`mt-0.5 block text-xs tabular-nums ${
                                        product.stock === 0
                                            ? 'text-magenta'
                                            : 'opacity-50'
                                    }`}
                                >
                                    {product.stock} in stock
                                </span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </AdminLayout>
    );
}
