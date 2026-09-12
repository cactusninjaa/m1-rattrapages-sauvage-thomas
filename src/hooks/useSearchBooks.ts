import { useQuery } from '@tanstack/react-query';
import { BASE_URL_API, gutembergHeaders, toStoredBook } from '.';
import { Book, Paginated } from '@/types/gutembergApi';
import { StoredBook } from '@/types/library';

export const MIN_SEARCH_LENGTH = 2;

const FIVE_MINUTES_IN_MILLISECONDS = 5 * 60 * 1000;

/**
 * L'API RapidAPI attend `q` : les paramètres `search`, `title` ou `query` sont
 * ignorés et renvoient le catalogue complet non filtré.
 */
const searchBooks = async (query: string): Promise<StoredBook[]> => {
    const url = `${BASE_URL_API}/books?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { method: 'GET', headers: gutembergHeaders() });

    if (!response.ok) {
        throw new Error(`Response status: ${response.status} ${url}`);
    }

    const data = (await response.json()) as Paginated<Book>;
    return data.results.map(toStoredBook);
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
