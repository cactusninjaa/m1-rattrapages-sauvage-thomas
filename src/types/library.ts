export type StoredBook = {
    title: string;
    gutembergId: number;
    /** Date ISO : tout passe par du JSON (AsyncStorage, persister react-query). */
    storedDate: string;
    author: Array<string>;
    coverImage: string;
};

export type Review = {
    id: string;
    book: StoredBook;
    /** 1 à 5 étoiles. */
    rating: number;
    comment: string;
    createdAt: string;
};
