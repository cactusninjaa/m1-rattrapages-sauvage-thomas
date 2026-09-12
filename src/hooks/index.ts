import { OpenLibraryDoc, OpenLibrarySearchResponse } from '@/types/openLibraryApi';
import { StoredBook } from '@/types/library';

export const BASE_URL_API = 'https://openlibrary.org';

const COVERS_URL = 'https://covers.openlibrary.org/b/id';

/**
 * OpenLibrary ne demande pas de clé, mais triple le quota (1 → 3 req/s) pour
 * les clients qui s'identifient.
 */
const openLibraryHeaders = () => ({
    Accept: 'application/json',
    'User-Agent': 'bookshelf-expo-app/1.0 (projet etudiant)',
});

/** La réponse par défaut embarque des dizaines de champs inutiles ici. */
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
