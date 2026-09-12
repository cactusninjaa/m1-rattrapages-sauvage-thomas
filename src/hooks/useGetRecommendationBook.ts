import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fetchOpenLibrary, toStoredBook, SEARCH_FIELDS } from "."
import { StoredBook } from "@/types/library";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

/** Vivier de tirage : large, mais borné pour rester dans des offsets valides. */
const RECOMMENDATION_QUERY = 'subject:fiction'
const POOL_SIZE = 10_000

/** Clé du jour en heure locale : le tirage change au passage de minuit. */
const todayKey = () => format(new Date(), 'yyyy-MM-dd')

const getRecommendationBook = async (): Promise<StoredBook> => {
    const offset = Math.floor(Math.random() * POOL_SIZE);
    const data = await fetchOpenLibrary(
        `/search.json?q=${encodeURIComponent(RECOMMENDATION_QUERY)}` +
            `&offset=${offset}&limit=1&fields=${SEARCH_FIELDS}`,
    );

    const doc = data.docs[0];
    if (!doc) {
        throw new Error(`Aucun livre trouvé à l'offset ${offset}`);
    }

    return toStoredBook(doc);
};

export const useGetRecommendationBook = () => {
    return useQuery({
        queryKey: ["recommendation-book", todayKey()],
        queryFn: getRecommendationBook,
        // La clé porte la date, donc le livre est stable toute la journée et
        // un nouveau tirage a lieu au premier lancement du lendemain.
        // Seul le bouton « Changer le livre » force un refetch dans la journée.
        staleTime: Infinity,
        gcTime: ONE_DAY_IN_MILLISECONDS,
        retry: false,
    });
};
