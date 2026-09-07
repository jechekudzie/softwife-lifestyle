import { Lockup } from '@/components/storefront/brand';

/**
 * The storefront footer, the same on every page.
 *
 * Link columns sit two-up on a phone rather than stacking into one long
 * ribbon, and widen to three once there is room.
 */
const COLUMNS = [
    {
        heading: 'Shop',
        links: [
            { label: 'Tees', href: '/shop' },
            { label: 'Tracksuits', href: '/shop' },
            { label: 'Caps', href: '/shop' },
            { label: 'Size guide', href: '/shop' },
        ],
    },
    {
        heading: 'The brand',
        links: [
            { label: 'Our story', href: '/#story' },
            { label: 'Affirmations', href: '/#affirmations' },
            { label: 'Lifestyle', href: '/#lifestyle' },
        ],
    },
    {
        heading: 'Help',
        links: [
            { label: 'Delivery', href: '/checkout' },
            { label: 'Returns', href: '/#story' },
            { label: 'Contact us', href: '/#story' },
        ],
    },
];

const SOCIALS = [
    { label: 'Instagram', href: 'https://www.instagram.com/_softwife.co' },
    { label: 'TikTok', href: 'https://www.tiktok.com/tag/softwife' },
];

export function StorefrontFooter() {
    return (
        <footer className="bg-wine text-butter px-6 pt-16 sm:pt-20">
            <div className="mx-auto max-w-6xl">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.6fr)] lg:gap-16">
                    <div>
                        <Lockup
                            color="var(--color-butter)"
                            className="w-48 sm:w-52"
                        />
                        <p className="mt-6 max-w-[26em] text-sm leading-relaxed opacity-60">
                            An affirmation and manifestation brand for women.
                            Comfortable luxury, made to be worn and believed.
                        </p>
                        <p className="font-display mt-7 max-w-[12em] text-xl leading-[1.25] italic sm:text-2xl">
                            Softness over survival, in every season.
                        </p>
                    </div>

                    {/* Two columns on a phone, three once there is room. */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                        {COLUMNS.map((column) => (
                            <div key={column.heading}>
                                <h2 className="text-[0.62rem] font-semibold tracking-[0.28em] uppercase opacity-50">
                                    {column.heading}
                                </h2>
                                <ul className="mt-5 space-y-3 text-sm">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <a
                                                href={link.href}
                                                className="opacity-75 transition hover:opacity-100"
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-14 border-t border-current/15 pt-7 pb-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <ul className="flex flex-wrap items-center gap-6 text-xs">
                            {SOCIALS.map((social) => (
                                <li key={social.label}>
                                    <a
                                        href={social.href}
                                        className="opacity-60 transition hover:opacity-100"
                                    >
                                        {social.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <p className="text-xs opacity-50">
                            Prices in USD · Shipping regionally
                        </p>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 text-xs opacity-40 sm:flex-row sm:items-center sm:justify-between">
                        <p>© 2025 Softwife Lifestyle. Est. 2025.</p>
                        <p>
                            Developed by{' '}
                            <a
                                href="https://leadingdigital.africa"
                                className="underline-offset-2 transition hover:underline hover:opacity-100"
                            >
                                Leading Digital
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
