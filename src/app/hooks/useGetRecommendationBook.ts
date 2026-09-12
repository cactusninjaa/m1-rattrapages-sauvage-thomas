import { BASE_URL_API } from "."
import { Book, Paginated } from "../types/gutembergApi";
import { useQuery } from '@tanstack/react-query'

type StoredBook = {
    title: string,
    gutembergId: number,
    storedDate: Date,
    author: Array<string>
    coverImage: string,
}

const SEVEN_DAYS_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000

const getRecommendationBook = async (): Promise<StoredBook> => {
    const now = new Date();
    const random_id = Math.floor(Math.random() * 1000);
    const response = await fetch(`${BASE_URL_API}/books/${random_id}`, {
        method: "GET",
        headers: {
            'x-rapidapi-key': process.env.EXPO_PUBLIC_GUTEMBERG_API_KEY!,
            'x-rapidapi-host': 'project-gutenberg-free-books-api1.p.rapidapi.com',
            'Content-Type': "application/json"
        }
    });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status} ${BASE_URL_API}/books/${random_id}`);
    }
    const data = (await response.json()) as Paginated<Book>;

    const book = data.results[0];
    if (!book) {
        throw new Error(`Aucun livre trouvé pour l'id ${random_id}`);
    }

    return {
        title: book.title,
        gutembergId: book.id,
        storedDate: now,
        author: book.authors.length ? book.authors.map((author) => author.name) : ['Inconnu'],
        coverImage: book.cover_image,
    };
};

export const useGetRecommendationBook = () => {
    return useQuery({
        queryKey: ["recommendation-book"],
        queryFn: getRecommendationBook,
        staleTime: SEVEN_DAYS_IN_MILLISECONDS,
        retry: false,
    });
};
