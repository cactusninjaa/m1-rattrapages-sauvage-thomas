/** Retire tirets, espaces et points, et met le X final en majuscule. */
const clean = (input: string) => input.replace(/[\s\-.]/g, '').toUpperCase();

const isValidIsbn10 = (isbn: string) => {
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;
    const sum = [...isbn].reduce((total, char, index) => {
        const digit = char === 'X' ? 10 : Number(char);
        return total + digit * (10 - index);
    }, 0);
    return sum % 11 === 0;
};

const isValidIsbn13 = (isbn: string) => {
    if (!/^\d{13}$/.test(isbn)) return false;
    const sum = [...isbn].reduce(
        (total, char, index) => total + Number(char) * (index % 2 === 0 ? 1 : 3),
        0,
    );
    return sum % 10 === 0;
};

/**
 * Renvoie l'ISBN normalisé si la saisie en est un, `null` sinon.
 * La clé de contrôle est vérifiée : une suite de 13 chiffres quelconque
 * ne part pas en requête réseau.
 */
export const normalizeIsbn = (input: string): string | null => {
    const candidate = clean(input);
    if (isValidIsbn10(candidate) || isValidIsbn13(candidate)) return candidate;
    return null;
};
