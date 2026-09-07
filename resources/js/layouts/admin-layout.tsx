import { Head, Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Package, Receipt, Truck } from 'lucide-react';
import { SMark, Wordmark } from '@/components/storefront/brand';

const NAV = [
    {
        href: '/admin',
        label: 'Overview',
        icon: LayoutDashboard,
        match: /^\/admin$/,
    },
    {
        href: '/admin/products',
        label: 'Products',
        icon: Package,
        match: /^\/admin\/products/,
    },
    {
        href: '/admin/orders',
        label: 'Orders',
        icon: Receipt,
        match: /^\/admin\/orders/,
    },
    {
        href: '/admin/fulfilment',
        label: 'Fulfilment',
        icon: Truck,
        match: /^\/admin\/fulfilment/,
    },
];

/** A flash message set by a controller, shown once at the top of the page. */
function Flash() {
    const flash = usePage().props.flash as { success?: string } | undefined;

    if (!flash?.success) {
        return null;
    }

    return (
        <div className="border-wine/20 bg-petal text-wine mb-8 rounded-xl border px-5 py-3.5 text-sm">
            {flash.success}
        </div>
    );
}

export default function AdminLayout({
    title,
    description,
    actions,
    children,
}: {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) {
    const url = usePage().url.split('?')[0];

    return (
        <>
            <Head title={`${title} · Admin`} />

            <div className="bg-bone text-choc min-h-screen font-sans lg:flex">
                <aside className="bg-wine text-butter lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0">
                    <div className="flex items-center gap-2.5 px-6 py-6">
                        <SMark color="var(--color-rose)" className="h-6 w-6" />
                        <Wordmark
                            color="var(--color-butter)"
                            className="h-3 w-24"
                        />
                    </div>

                    <nav className="px-3 pb-6">
                        <ul className="space-y-1">
                            {NAV.map(({ href, label, icon: Icon, match }) => {
                                const active = match.test(url);

                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                                                active
                                                    ? 'bg-butter/15 font-semibold'
                                                    : 'opacity-70 hover:bg-white/10 hover:opacity-100'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="border-butter/15 mt-6 border-t pt-4">
                            <a
                                href="/"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm opacity-60 transition hover:opacity-100"
                            >
                                <LogOut className="h-4 w-4" />
                                Back to the shop
                            </a>
                        </div>
                    </nav>
                </aside>

                <main className="min-w-0 flex-1 px-6 py-10 sm:px-10">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
                            <div>
                                <h1 className="font-display text-3xl font-bold">
                                    {title}
                                </h1>
                                {description ? (
                                    <p className="mt-1.5 text-sm opacity-55">
                                        {description}
                                    </p>
                                ) : null}
                            </div>
                            {actions}
                        </div>

                        <Flash />
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
