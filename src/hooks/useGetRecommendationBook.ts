import { BASE_URL_API, gutembergHeaders, toStoredBook } from "."
import { Book, Paginated } from "@/types/gutembergApi";
import { StoredBook } from "@/types/library";
import { useQuery } from '@tanstack/react-query'

const SEVEN_DAYS_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000

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
        queryKey: ["recommendation-book"],
        queryFn: getRecommendationBook,
        staleTime: SEVEN_DAYS_IN_MILLISECONDS,
        retry: false,
    });
};
