export interface OpenLibraryDoc {
    /** Clé d'œuvre, de la forme "/works/OL66554W". */
    key: string;
    title: string;
    author_name?: string[];
    /** Identifiant de couverture, absent pour beaucoup d'ouvrages. */
    cover_i?: number;
    first_publish_year?: number;
}

export interface OpenLibrarySearchResponse {
    numFound: number;
    start: number;
    offset: number | null;
    docs: OpenLibraryDoc[];
}
