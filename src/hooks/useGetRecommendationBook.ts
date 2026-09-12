import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fetchOpenLibrary, toStoredBook, SEARCH_FIELDS } from "."
import { StoredBook } from "@/types/library";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

/** Draw pool: wide, but bounded to stay within valid offsets. */
const RECOMMENDATION_QUERY = 'subject:fiction'
const POOL_SIZE = 10_000

/** Local day key: the draw changes at midnight. */
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
        // The key carries the date, so the book stays stable all day and a new
        // draw happens on the next day's first launch. Only the "change book"
        // button forces a refetch within the day.
        staleTime: Infinity,
        gcTime: ONE_DAY_IN_MILLISECONDS,
        retry: false,
    });
};
