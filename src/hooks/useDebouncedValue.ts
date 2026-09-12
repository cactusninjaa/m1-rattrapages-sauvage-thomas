import { useEffect, useState } from 'react';

/** Évite de lancer une requête à chaque frappe. */
export const useDebouncedValue = <T>(value: T, delay = 350): T => {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return debounced;
};
