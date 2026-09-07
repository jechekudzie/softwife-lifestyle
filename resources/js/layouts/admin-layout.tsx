import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    ChartNoAxesColumn,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Package,
    Receipt,
    Store,
    Truck,
    UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SMark, Wordmark } from '@/components/storefront/brand';

type Alerts = {
    newOrders: number;
    unpaid: number;
    lowStock: number;
} | null;

type Auth = { user: { name: string; email: string } | null };

/** Closes a panel on Escape or a click outside it. */
function useDismiss(onClose: () => void) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const onClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('keydown', onKey);
        const timer = window.setTimeout(
            () => document.addEventListener('mousedown', onClick),
            0,
        );

        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
            window.clearTimeout(timer);
        };
    }, [onClose]);

    return ref;
}

function Notifications({ alerts }: { alerts: Alerts }) {
    const [open, setOpen] = useState(false);
    const ref = useDismiss(() => setOpen(false));

    const total =
        (alerts?.newOrders ?? 0) +
        (alerts?.unpaid ?? 0) +
        (alerts?.lowStock ?? 0);

    const rows = [
        {
            href: '/admin/orders?status=pending',
            label: 'orders awaiting action',
            count: alerts?.newOrders ?? 0,
            icon: Receipt,
        },
        {
            href: '/admin/orders',
            label: 'orders still unpaid',
            count: alerts?.unpaid ?? 0,
            icon: AlertTriangle,
        },
        {
            href: '/admin/products',
            label: 'variants running low',
            count: alerts?.lowStock ?? 0,
            icon: Package,
        },
    ].filter((row) => row.count > 0);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="border-wine/15 hover:border-wine/40 relative flex h-10 w-10 items-center justify-center rounded-full border transition"
            >
                <Bell className="h-4 w-4" />
                {total > 0 ? (
                    <span className="bg-magenta absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.6rem] font-semibold text-white tabular-nums">
                        {total > 99 ? '99+' : total}
                    </span>
                ) : null}
                <span className="sr-only">Notifications</span>
            </button>

            {open ? (
                <div className="border-wine/12 absolute right-0 z-20 mt-3 w-72 overflow-hidden rounded-2xl border bg-white shadow-[0_30px_60px_-30px_rgba(39,24,20,0.5)]">
                    <p className="border-wine/10 border-b px-5 py-3.5 text-[0.6rem] font-semibold tracking-[0.24em] uppercase opacity-45">
                        Needs you
                    </p>

                    {rows.length ? (
                        <ul className="divide-y divide-[rgba(107,33,55,0.08)]">
                            {rows.map(({ href, label, count, icon: Icon }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        onClick={() => setOpen(false)}
                                        className="hover:bg-petal/60 flex items-center gap-3 px-5 py-3.5 text-sm transition"
                                    >
                                        <Icon className="text-magenta h-4 w-4 shrink-0" />
                                        <span>
                                            <span className="font-semibold tabular-nums">
                                                {count}
                                            </span>{' '}
                                            {label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-5 py-8 text-center text-sm opacity-45">
                            Nothing needs you right now.
                        </p>
                    )}
                </div>
            ) : null}
        </div>
    );
}

function UserMenu({ auth }: { auth: Auth }) {
    const [open, setOpen] = useState(false);
    const ref = useDismiss(() => setOpen(false));
    const name = auth?.user?.name ?? 'Account';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                className="border-wine/15 hover:border-wine/40 flex items-center gap-2.5 rounded-full border py-1.5 pr-3 pl-1.5 transition"
            >
                <span className="bg-wine flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white">
                    {name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium sm:inline">
                    {name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </button>

            {open ? (
                <div className="border-wine/12 absolute right-0 z-20 mt-3 w-60 overflow-hidden rounded-2xl border bg-white shadow-[0_30px_60px_-30px_rgba(39,24,20,0.5)]">
                    <div className="border-wine/10 border-b px-5 py-4">
                        <p className="text-sm font-semibold">{name}</p>
                        <p className="mt-0.5 truncate text-xs opacity-50">
                            {auth?.user?.email}
                        </p>
                    </div>

                    <ul className="py-1.5 text-sm">
                        <li>
                            <Link
                                href="/settings/profile"
                                className="hover:bg-petal/60 flex items-center gap-3 px-5 py-2.5 transition"
                            >
                                <UserRound className="h-4 w-4 opacity-55" />
                                My profile
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/settings/security"
                                className="hover:bg-petal/60 flex items-center gap-3 px-5 py-2.5 transition"
                            >
                                <AlertTriangle className="h-4 w-4 opacity-55" />
                                Password and security
                            </Link>
                        </li>
                        <li>
                            <a
                                href="/"
                                className="hover:bg-petal/60 flex items-center gap-3 px-5 py-2.5 transition"
                            >
                                <Store className="h-4 w-4 opacity-55" />
                                View the shop
                            </a>
                        </li>
                    </ul>

                    <div className="border-wine/10 border-t py-1.5">
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="hover:bg-petal/60 flex w-full items-center gap-3 px-5 py-2.5 text-sm transition"
                        >
                            <LogOut className="h-4 w-4 opacity-55" />
                            Log out
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

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
        href: '/admin/analytics',
        label: 'Analytics',
        icon: ChartNoAxesColumn,
        match: /^\/admin\/analytics/,
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
    const page = usePage();
    const url = page.url.split('?')[0];
    const alerts = page.props.adminAlerts as Alerts;
    const auth = page.props.auth as Auth;

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

                <main className="min-w-0 flex-1">
                    <div className="border-wine/10 flex items-center justify-end gap-3 border-b px-6 py-3.5 sm:px-10">
                        <Notifications alerts={alerts} />
                        <UserMenu auth={auth} />
                    </div>

                    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
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
