import { useState } from 'react';

/**
 * Charts for the admin.
 *
 * Hand-drawn SVG rather than a charting dependency: the forms here are simple
 * and the project should not gain a package for three of them.
 *
 * Colours are validated against the bone chart surface for lightness, chroma,
 * colour-vision separation and contrast. Do not substitute the darker brand
 * tones here — chocolate and plum fail separation against each other.
 */
export const SERIES = '#ce3c84';
export const SERIES_ALT = '#b8791f';

const AXIS = 'rgba(39,24,20,0.45)';
const GRID = 'rgba(107,33,55,0.10)';

export type DailyPoint = {
    date: string;
    label: string;
    revenue: number;
    orders: number;
};

const money = (value: number) =>
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/**
 * Revenue over time. One series, so it carries no legend — the heading names
 * it — and a crosshair reads the exact day.
 */
export function RevenueChart({ data }: { data: DailyPoint[] }) {
    const [hover, setHover] = useState<number | null>(null);

    const width = 720;
    const height = 240;
    const pad = { top: 16, right: 16, bottom: 28, left: 48 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;

    const peak = Math.max(...data.map((point) => point.revenue), 1);
    // A round ceiling keeps the gridline labels readable.
    const ceiling = Math.ceil(peak / 50) * 50 || 50;

    const x = (index: number) =>
        pad.left + (index / Math.max(data.length - 1, 1)) * plotW;
    const y = (value: number) => pad.top + plotH - (value / ceiling) * plotH;

    const line = data
        .map(
            (point, index) =>
                `${index ? 'L' : 'M'}${x(index)},${y(point.revenue)}`,
        )
        .join(' ');
    const area = `${line} L${x(data.length - 1)},${pad.top + plotH} L${pad.left},${pad.top + plotH} Z`;

    const ticks = [0, 0.5, 1].map((fraction) => fraction * ceiling);
    const active = hover !== null ? data[hover] : null;

    return (
        <figure className="relative">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full"
                role="img"
                aria-label="Revenue per day"
                onMouseLeave={() => setHover(null)}
            >
                <defs>
                    <linearGradient
                        id="revenueFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor={SERIES}
                            stopOpacity="0.18"
                        />
                        <stop
                            offset="100%"
                            stopColor={SERIES}
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>

                {ticks.map((tick) => (
                    <g key={tick}>
                        <line
                            x1={pad.left}
                            x2={width - pad.right}
                            y1={y(tick)}
                            y2={y(tick)}
                            stroke={GRID}
                            strokeWidth="1"
                        />
                        <text
                            x={pad.left - 10}
                            y={y(tick) + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill={AXIS}
                        >
                            {money(tick)}
                        </text>
                    </g>
                ))}

                <path d={area} fill="url(#revenueFill)" />
                <path
                    d={line}
                    fill="none"
                    stroke={SERIES}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {active && hover !== null ? (
                    <g>
                        <line
                            x1={x(hover)}
                            x2={x(hover)}
                            y1={pad.top}
                            y2={pad.top + plotH}
                            stroke={SERIES}
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                        <circle
                            cx={x(hover)}
                            cy={y(active.revenue)}
                            r="5"
                            fill={SERIES}
                            stroke="#fbf9f4"
                            strokeWidth="2"
                        />
                    </g>
                ) : null}

                {/* Wide invisible targets, so the pointer never has to find a 2px line. */}
                {data.map((point, index) => (
                    <rect
                        key={point.date}
                        x={x(index) - plotW / Math.max(data.length - 1, 1) / 2}
                        y={pad.top}
                        width={plotW / Math.max(data.length - 1, 1)}
                        height={plotH}
                        fill="transparent"
                        onMouseEnter={() => setHover(index)}
                    />
                ))}

                {data.map((point, index) =>
                    index === 0 ||
                    index === data.length - 1 ||
                    index === Math.floor(data.length / 2) ? (
                        <text
                            key={`label-${point.date}`}
                            x={x(index)}
                            y={height - 8}
                            textAnchor={
                                index === 0
                                    ? 'start'
                                    : index === data.length - 1
                                      ? 'end'
                                      : 'middle'
                            }
                            fontSize="11"
                            fill={AXIS}
                        >
                            {point.label}
                        </text>
                    ) : null,
                )}
            </svg>

            {active ? (
                <div
                    className="border-wine/12 pointer-events-none absolute top-2 rounded-xl border bg-white px-3.5 py-2.5 text-xs shadow-lg"
                    style={{
                        left: `${(x(hover ?? 0) / width) * 100}%`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <p className="font-semibold">{active.label}</p>
                    <p className="mt-1 tabular-nums opacity-70">
                        ${active.revenue.toFixed(2)}
                    </p>
                    <p className="tabular-nums opacity-50">
                        {active.orders}{' '}
                        {active.orders === 1 ? 'order' : 'orders'}
                    </p>
                </div>
            ) : null}
        </figure>
    );
}

/** A compact revenue trace for the overview. No axes, no tooltip. */
export function Sparkline({ data }: { data: DailyPoint[] }) {
    const width = 260;
    const height = 56;
    const peak = Math.max(...data.map((point) => point.revenue), 1);

    const x = (index: number) => (index / Math.max(data.length - 1, 1)) * width;
    const y = (value: number) => height - (value / peak) * (height - 6) - 3;

    const line = data
        .map(
            (point, index) =>
                `${index ? 'L' : 'M'}${x(index)},${y(point.revenue)}`,
        )
        .join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full"
            aria-hidden="true"
            preserveAspectRatio="none"
        >
            <path
                d={`${line} L${width},${height} L0,${height} Z`}
                fill={SERIES}
                fillOpacity="0.12"
            />
            <path
                d={line}
                fill="none"
                stroke={SERIES}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

/**
 * Ranked magnitude. Horizontal bars because the labels are words, and every
 * bar is labelled directly, so nothing depends on colour to be read.
 */
export function BarList({
    rows,
    format = money,
}: {
    rows: { label: string; value: number; sub?: string }[];
    format?: (value: number) => string;
}) {
    const peak = Math.max(...rows.map((row) => row.value), 1);

    if (!rows.length) {
        return (
            <p className="py-10 text-center text-sm opacity-45">
                Nothing sold in this window.
            </p>
        );
    }

    return (
        <ul className="space-y-4">
            {rows.map((row) => (
                <li key={row.label}>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className="min-w-0 truncate">
                            {row.label}
                            {row.sub ? (
                                <span className="ml-2 text-xs opacity-45">
                                    {row.sub}
                                </span>
                            ) : null}
                        </span>
                        <span className="font-medium tabular-nums">
                            {format(row.value)}
                        </span>
                    </div>
                    <div
                        className="mt-2 h-2 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: GRID }}
                    >
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${Math.max((row.value / peak) * 100, 2)}%`,
                                backgroundColor: SERIES,
                            }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/**
 * A two-part split as one bar. Both parts are directly labelled and separated
 * by a surface gap, so identity never rests on colour alone.
 */
export function SplitBar({
    parts,
}: {
    parts: { label: string; value: number }[];
}) {
    const total = parts.reduce((sum, part) => sum + part.value, 0);

    if (!total) {
        return (
            <p className="py-8 text-center text-sm opacity-45">
                No orders in this window.
            </p>
        );
    }

    const colours = [SERIES, SERIES_ALT];

    return (
        <div>
            <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
                {parts.map((part, index) => (
                    <div
                        key={part.label}
                        style={{
                            width: `${(part.value / total) * 100}%`,
                            backgroundColor: colours[index % colours.length],
                        }}
                    />
                ))}
            </div>

            <ul className="mt-4 space-y-2 text-sm">
                {parts.map((part, index) => (
                    <li
                        key={part.label}
                        className="flex items-center justify-between gap-4"
                    >
                        <span className="flex items-center gap-2.5">
                            <span
                                aria-hidden="true"
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                    backgroundColor:
                                        colours[index % colours.length],
                                }}
                            />
                            <span className="capitalize">{part.label}</span>
                        </span>
                        <span className="tabular-nums opacity-65">
                            {part.value} ·{' '}
                            {Math.round((part.value / total) * 100)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
