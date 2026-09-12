import { BASE_URL_API } from "."
import { Book } from "../types/gutembergApi";
import { ASYNC_STORAGE_KEYS, storage } from "../utils/asyncStorage"
import { differenceInDays } from "date-fns";


type StoredBook = {
    title: string,
    gutembergId: number,
    storedDate: Date,
    author: Array<string>
    coverImage: string,
}

const getNewRecommendationBook = async (): Promise<StoredBook> => {
    const now = new Date();
    const random_id = Math.floor(Math.random() * 1000)
    const response = await fetch(`${BASE_URL_API}/books/${random_id}`)
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const newRecommendationBook = await response.json() as Book;

    const mappedNewRecommendationBook: StoredBook = {
        title: newRecommendationBook.title,
        gutembergId: newRecommendationBook.id,
        storedDate: now,
        author: newRecommendationBook.authors.map((author) => author.name),
        coverImage: newRecommendationBook.cover_image,
    }

    await storage.setItem(ASYNC_STORAGE_KEYS.BOOK_RECOMMENDATION, JSON.stringify(mappedNewRecommendationBook))

    return mappedNewRecommendationBook
}


export const useGetRecommendationBook = async (): Promise<StoredBook> => {
    const storedBook = await storage.getItem(ASYNC_STORAGE_KEYS.BOOK_RECOMMENDATION)
    const now = new Date()
    if (storedBook !== null) {
        const parsedStoredBook: StoredBook = JSON.parse(storedBook)
        if (differenceInDays(parsedStoredBook.storedDate, now) > 7) {
            return getNewRecommendationBook()
        }
        return parsedStoredBook
    }
    return getNewRecommendationBook()
}