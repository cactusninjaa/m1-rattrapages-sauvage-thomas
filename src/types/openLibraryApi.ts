export interface OpenLibraryDoc {
    /** Work key, shaped like "/works/OL66554W". */
    key: string;
    title: string;
    author_name?: string[];
    /** Cover id, missing on many works. */
    cover_i?: number;
    first_publish_year?: number;
}

export interface OpenLibrarySearchResponse {
    numFound: number;
    start: number;
    offset: number | null;
    docs: OpenLibraryDoc[];
}
