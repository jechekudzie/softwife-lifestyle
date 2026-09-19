import { Store, Truck } from 'lucide-react';

/**
 * The shared vocabulary for how an order reads at a glance.
 *
 * Three identical outlined pills in a row tell you nothing, so each of the
 * three facts is drawn differently: the stage is a tinted pill, payment is a
 * dot and a word, and the method is an icon. Loudness tracks what still needs
 * a hand — a printing order shouts, a collected one recedes.
 */
const STAGES: Record<string, string> = {
    pending: 'bg-[#fbf0d6] text-[#8a5a12]',
    printing: 'bg-petal-deep text-wine',
    ready: 'bg-magenta text-white',
    shipped: 'text-wine/55 ring-wine/15 ring-1 ring-inset',
    collected: 'text-wine/55 ring-wine/15 ring-1 ring-inset',
    cancelled: 'text-wine/40 ring-wine/12 ring-1 ring-inset',
};

export function StageTag({ status }: { status: string }) {
    return (
        <span
            className={`inline-block rounded-full px-2.5 py-1 text-center text-[0.6rem] font-semibold tracking-[0.14em] uppercase sm:min-w-[5.5rem] ${
                STAGES[status] ?? STAGES.pending
            }`}
        >
            {status}
        </span>
    );
}

/** Paid is the resting state, so only unpaid earns any colour. */
export function PaymentTag({ status }: { status: string }) {
    const settled = status === 'paid';

    return (
        <span
            className={`flex items-center gap-1.5 text-[0.62rem] font-medium tracking-[0.1em] uppercase sm:w-[4.5rem] ${
                settled ? 'text-wine/45' : 'text-magenta'
            }`}
        >
            <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                    settled ? 'bg-wine/25' : 'bg-magenta'
                }`}
            />
            {status}
        </span>
    );
}

export function MethodTag({ method }: { method: string }) {
    const Icon = method === 'collection' ? Store : Truck;

    return (
        <span className="text-wine/50 flex items-center gap-1.5 text-[0.62rem] tracking-[0.1em] uppercase sm:w-[6.5rem]">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {method}
        </span>
    );
}
