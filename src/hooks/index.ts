import { OpenLibraryDoc, OpenLibrarySearchResponse } from '@/types/openLibraryApi';
import { StoredBook } from '@/types/library';

export const BASE_URL_API = 'https://openlibrary.org';

const COVERS_URL = 'https://covers.openlibrary.org/b/id';

/**
 * OpenLibrary needs no API key, but triples the quota (1 -> 3 req/s) for
 * clients that identify themselves.
 */
const openLibraryHeaders = () => ({
    Accept: 'application/json',
    'User-Agent': 'bookshelf-expo-app/1.0 (student project)',
});

/** The default response carries dozens of fields we do not need here. */
export const SEARCH_FIELDS = 'key,title,author_name,cover_i,first_publish_year';

export const fetchOpenLibrary = async (path: string): Promise<OpenLibrarySearchResponse> => {
    const url = `${BASE_URL_API}${path}`;
    const response = await fetch(url, { method: 'GET', headers: openLibraryHeaders() });

    if (!response.ok) {
        throw new Error(`OpenLibrary a répondu ${response.status}`);
    }

    return (await response.json()) as OpenLibrarySearchResponse;
};

export const toStoredBook = (doc: OpenLibraryDoc): StoredBook => ({
    title: doc.title,
    openLibraryId: doc.key.replace('/works/', ''),
    storedDate: new Date().toISOString(),
    author: doc.author_name?.length ? doc.author_name : ['Inconnu'],
    coverImage: doc.cover_i ? `${COVERS_URL}/${doc.cover_i}-M.jpg` : '',
    firstPublishYear: doc.first_publish_year,
});
