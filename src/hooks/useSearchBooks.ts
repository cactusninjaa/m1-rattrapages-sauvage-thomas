import { useQuery } from '@tanstack/react-query';
import { BASE_URL_API, gutembergHeaders, toStoredBook } from '.';
import { normalizeIsbn } from '@/utils/isbn';
import { Book, Paginated } from '@/types/gutembergApi';
import { StoredBook } from '@/types/library';

export const MIN_SEARCH_LENGTH = 2;

const FIVE_MINUTES_IN_MILLISECONDS = 5 * 60 * 1000;

const OPEN_LIBRARY_API = 'https://openlibrary.org/api/books';

export type IsbnMatch = {
    code: string;
    title: string;
    authors: string[];
};

export type SearchResult = {
    books: StoredBook[];
    /** Renseigné uniquement quand la saisie a été reconnue comme un ISBN. */
    isbn?: IsbnMatch;
};

type OpenLibraryEntry = {
    title?: string;
    authors?: { name: string }[];
};

/**
 * L'API RapidAPI attend `q` : les paramètres `search`, `title` ou `isbn` sont
 * ignorés et renvoient le catalogue complet non filtré.
 */
const searchGutemberg = async (query: string): Promise<StoredBook[]> => {
    const url = `${BASE_URL_API}/books?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { method: 'GET', headers: gutembergHeaders() });

    if (!response.ok) {
        throw new Error(`Response status: ${response.status} ${url}`);
    }

    const data = (await response.json()) as Paginated<Book>;
    return data.results.map(toStoredBook);
};

/**
 * Gutenberg ne connaît pas les ISBN (aucun champ dans ses données, et ses
 * ouvrages sont pour la plupart antérieurs à l'ISBN). On passe donc par
 * OpenLibrary pour traduire l'ISBN en titre, puis on cherche ce titre.
 */
const resolveIsbn = async (isbn: string): Promise<IsbnMatch> => {
    const url = `${OPEN_LIBRARY_API}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`OpenLibrary a répondu ${response.status}`);
    }

    const data = (await response.json()) as Record<string, OpenLibraryEntry | undefined>;
    const entry = data[`ISBN:${isbn}`];

    if (!entry?.title) {
        throw new Error(`Aucun livre connu pour l'ISBN ${isbn}.`);
    }

    return {
        code: isbn,
        title: entry.title,
        authors: entry.authors?.map((author) => author.name) ?? [],
    };
};

const searchBooks = async (query: string): Promise<SearchResult> => {
    const isbn = normalizeIsbn(query);

    if (!isbn) {
        return { books: await searchGutemberg(query) };
    }

    const match = await resolveIsbn(isbn);
    return { books: await searchGutemberg(match.title), isbn: match };
};

export const useSearchBooks = (query: string) => {
    const trimmed = query.trim();

    return useQuery({
        queryKey: ['search-books', trimmed],
        queryFn: () => searchBooks(trimmed),
        enabled: trimmed.length >= MIN_SEARCH_LENGTH,
        staleTime: FIVE_MINUTES_IN_MILLISECONDS,
    });
};
