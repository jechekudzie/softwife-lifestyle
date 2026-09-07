import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from 'react';

/**
 * The bag.
 *
 * Client-side and persisted to localStorage until the orders table exists.
 * When the backend lands, this provider is the only thing that changes: the
 * shape below is what the API should return.
 */

/** Surcharge for a garment printed with the customer's own words. */
export const CUSTOM_AFFIRMATION_FEE = 12;

/** Made to order, so it does not ship with the rest of the run. */
export const CUSTOM_LEAD_TIME = '10–14 days';

export type CartItem = {
    /** Stable per variant, so the same variant stacks instead of duplicating. */
    id: string;
    slug: string;
    name: string;
    colourway: string;
    cloth: string;
    ink: string;
    size: string;
    photo: string | null;
    basePrice: number;
    /** The customer's own affirmation, when they asked for one. */
    custom: string | null;
    quantity: number;
};

type CartState = { items: CartItem[]; hydrated: boolean };

type CartAction =
    | { type: 'hydrate'; items: CartItem[] }
    | { type: 'add'; item: Omit<CartItem, 'id' | 'quantity'>; quantity: number }
    | { type: 'remove'; id: string }
    | { type: 'quantity'; id: string; quantity: number }
    | { type: 'clear' };

const STORAGE_KEY = 'softwife.bag.v1';

function itemId(item: Omit<CartItem, 'id' | 'quantity'>) {
    // Custom wording makes a distinct line, so two customs never merge.
    const custom = item.custom ? `|${item.custom.trim().toLowerCase()}` : '';

    return `${item.slug}|${item.colourway}|${item.size}${custom}`;
}

export function unitPrice(item: CartItem) {
    return item.basePrice + (item.custom ? CUSTOM_AFFIRMATION_FEE : 0);
}

function reducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'hydrate':
            return { items: action.items, hydrated: true };

        case 'add': {
            const id = itemId(action.item);
            const existing = state.items.find((item) => item.id === id);

            if (existing) {
                return {
                    ...state,
                    items: state.items.map((item) =>
                        item.id === id
                            ? {
                                  ...item,
                                  quantity: item.quantity + action.quantity,
                              }
                            : item,
                    ),
                };
            }

            return {
                ...state,
                items: [
                    ...state.items,
                    { ...action.item, id, quantity: action.quantity },
                ],
            };
        }

        case 'remove':
            return {
                ...state,
                items: state.items.filter((item) => item.id !== action.id),
            };

        case 'quantity':
            return {
                ...state,
                items: state.items
                    .map((item) =>
                        item.id === action.id
                            ? { ...item, quantity: action.quantity }
                            : item,
                    )
                    .filter((item) => item.quantity > 0),
            };

        case 'clear':
            return { ...state, items: [] };
    }
}

type CartValue = {
    items: CartItem[];
    hydrated: boolean;
    count: number;
    subtotal: number;
    customCount: number;
    add: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
    remove: (id: string) => void;
    setQuantity: (id: string, quantity: number) => void;
    clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, {
        items: [],
        hydrated: false,
    });

    useEffect(() => {
        let items: CartItem[] = [];

        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            items = stored ? (JSON.parse(stored) as CartItem[]) : [];
        } catch {
            items = [];
        }

        dispatch({ type: 'hydrate', items });
    }, []);

    useEffect(() => {
        if (!state.hydrated) {
            return;
        }

        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state.items),
            );
        } catch {
            // A private window can refuse storage; the bag still works in memory.
        }
    }, [state.items, state.hydrated]);

    const add = useCallback(
        (item: Omit<CartItem, 'id' | 'quantity'>, quantity = 1) =>
            dispatch({ type: 'add', item, quantity }),
        [],
    );

    const remove = useCallback(
        (id: string) => dispatch({ type: 'remove', id }),
        [],
    );

    const setQuantity = useCallback(
        (id: string, quantity: number) =>
            dispatch({ type: 'quantity', id, quantity }),
        [],
    );

    const clear = useCallback(() => dispatch({ type: 'clear' }), []);

    const value = useMemo<CartValue>(() => {
        const count = state.items.reduce(
            (total, item) => total + item.quantity,
            0,
        );
        const subtotal = state.items.reduce(
            (total, item) => total + unitPrice(item) * item.quantity,
            0,
        );
        const customCount = state.items.reduce(
            (total, item) => total + (item.custom ? item.quantity : 0),
            0,
        );

        return {
            items: state.items,
            hydrated: state.hydrated,
            count,
            subtotal,
            customCount,
            add,
            remove,
            setQuantity,
            clear,
        };
    }, [state.items, state.hydrated, add, remove, setQuantity, clear]);

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used inside a CartProvider');
    }

    return context;
}
