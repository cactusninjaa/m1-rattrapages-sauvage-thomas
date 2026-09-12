import { useQuery } from '@tanstack/react-query';
import { fetchOpenLibrary, toStoredBook, SEARCH_FIELDS } from '.';
import { normalizeIsbn } from '@/utils/isbn';
import { StoredBook } from '@/types/library';

export const MIN_SEARCH_LENGTH = 2;

const FIVE_MINUTES_IN_MILLISECONDS = 5 * 60 * 1000;
const RESULTS_PER_SEARCH = 25;

export type SearchResult = {
    books: StoredBook[];
    /** ISBN normalisé quand la saisie en était un. */
    isbn?: string;
};

const searchBooks = async (query: string): Promise<SearchResult> => {
    const isbn = normalizeIsbn(query);
    // OpenLibrary indexe les ISBN nativement : pas de résolution intermédiaire.
    const filter = isbn ? `isbn=${isbn}` : `q=${encodeURIComponent(query)}`;

    const data = await fetchOpenLibrary(
        `/search.json?${filter}&limit=${RESULTS_PER_SEARCH}&fields=${SEARCH_FIELDS}`,
    );

    return {
        books: data.docs.map(toStoredBook),
        isbn: isbn ?? undefined,
    };
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
