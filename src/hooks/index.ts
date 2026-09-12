import { Book } from '@/types/gutembergApi';
import { StoredBook } from '@/types/library';

export const BASE_URL_API = 'https://project-gutenberg-free-books-api1.p.rapidapi.com'

const RAPIDAPI_HOST = 'project-gutenberg-free-books-api1.p.rapidapi.com'

export const gutembergHeaders = () => ({
    'x-rapidapi-key': process.env.EXPO_PUBLIC_GUTEMBERG_API_KEY!,
    'x-rapidapi-host': RAPIDAPI_HOST,
    'Content-Type': 'application/json',
});

export const toStoredBook = (book: Book): StoredBook => ({
    title: book.title,
    gutembergId: book.id,
    storedDate: new Date().toISOString(),
    author: book.authors.length ? book.authors.map((author) => author.name) : ['Inconnu'],
    coverImage: book.cover_image,
});
