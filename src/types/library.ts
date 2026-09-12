export type StoredBook = {
    title: string;
    /** OpenLibrary work key without its prefix, e.g. "OL66554W". */
    openLibraryId: string;
    /** ISO date: everything round-trips through JSON (AsyncStorage, react-query persister). */
    storedDate: string;
    author: string[];
    coverImage: string;
    firstPublishYear?: number;
};

export type Review = {
    id: string;
    book: StoredBook;
    /** 1 to 5 stars. */
    rating: number;
    comment: string;
    createdAt: string;
};
