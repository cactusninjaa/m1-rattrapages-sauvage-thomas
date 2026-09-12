import { BASE_URL_API, gutembergHeaders, toStoredBook } from "."
import { Book, Paginated } from "@/types/gutembergApi";
import { StoredBook } from "@/types/library";
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

/** Clé du jour en heure locale : le tirage change au passage de minuit. */
const todayKey = () => format(new Date(), 'yyyy-MM-dd')

const getRecommendationBook = async (): Promise<StoredBook> => {
    const random_id = Math.floor(Math.random() * 1000);
    const response = await fetch(`${BASE_URL_API}/books/${random_id}`, {
        method: "GET",
        headers: gutembergHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status} ${BASE_URL_API}/books/${random_id}`);
    }
    const data = (await response.json()) as Paginated<Book>;

    const book = data.results[0];
    if (!book) {
        throw new Error(`Aucun livre trouvé pour l'id ${random_id}`);
    }

    return toStoredBook(book);
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
