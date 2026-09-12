import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { readJson, writeJson, STORAGE_KEYS } from '@/utils/asyncStorage';
import { Review, StoredBook } from '@/types/library';

export const REVIEWS_QUERY_KEY = ['reviews'];

export type NewReview = {
    book: StoredBook;
    rating: number;
    comment: string;
};

const getReviews = () => readJson<Review[]>(STORAGE_KEYS.REVIEWS, []);

export const useReviews = () => {
    return useQuery({
        queryKey: REVIEWS_QUERY_KEY,
        queryFn: getReviews,
        // AsyncStorage is the source of truth, not the network.
        staleTime: Infinity,
    });
};

export const useAddReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ book, rating, comment }: NewReview) => {
            const reviews = await getReviews();
            const createdAt = new Date().toISOString();
            const review: Review = {
                id: `${book.openLibraryId}-${Date.now()}`,
                book,
                rating,
                comment: comment.trim(),
                createdAt,
            };
            return writeJson(STORAGE_KEYS.REVIEWS, [review, ...reviews]);
        },
        onSuccess: (reviews) => queryClient.setQueryData(REVIEWS_QUERY_KEY, reviews),
    });
};

export type ReviewEdit = {
    id: string;
    rating: number;
    comment: string;
};

/** Only rating and comment are editable, the reviewed book never changes. */
export const useUpdateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, rating, comment }: ReviewEdit) => {
            const reviews = await getReviews();
            return writeJson(
                STORAGE_KEYS.REVIEWS,
                reviews.map((review) =>
                    review.id === id ? { ...review, rating, comment: comment.trim() } : review,
                ),
            );
        },
        onSuccess: (reviews) => queryClient.setQueryData(REVIEWS_QUERY_KEY, reviews),
    });
};

export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const reviews = await getReviews();
            return writeJson(
                STORAGE_KEYS.REVIEWS,
                reviews.filter((review) => review.id !== id),
            );
        },
        onSuccess: (reviews) => queryClient.setQueryData(REVIEWS_QUERY_KEY, reviews),
    });
};
