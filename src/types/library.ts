export type StoredBook = {
    title: string;
    /** Clé d'œuvre OpenLibrary sans son préfixe, ex. "OL66554W". */
    openLibraryId: string;
    /** Date ISO : tout passe par du JSON (AsyncStorage, persister react-query). */
    storedDate: string;
    author: Array<string>;
    coverImage: string;
    firstPublishYear?: number;
};

export type Review = {
    id: string;
    book: StoredBook;
    /** 1 à 5 étoiles. */
    rating: number;
    comment: string;
    createdAt: string;
};
