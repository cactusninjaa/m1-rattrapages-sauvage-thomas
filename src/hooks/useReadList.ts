import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { readJson, writeJson, STORAGE_KEYS } from '@/utils/asyncStorage';
import { StoredBook } from '@/types/library';

export const READ_LIST_QUERY_KEY = ['read-list'];

const getReadList = () => readJson<StoredBook[]>(STORAGE_KEYS.READ_LIST, []);

export const useReadList = () => {
    return useQuery({
        queryKey: READ_LIST_QUERY_KEY,
        queryFn: getReadList,
        // La source de vérité est AsyncStorage, pas le réseau.
        staleTime: Infinity,
    });
};

export const useAddToReadList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (book: StoredBook) => {
            const readList = await getReadList();
            if (readList.some((stored) => stored.gutembergId === book.gutembergId)) {
                return readList;
            }
            return writeJson(STORAGE_KEYS.READ_LIST, [
                { ...book, storedDate: new Date().toISOString() },
                ...readList,
            ]);
        },
        onSuccess: (readList) => queryClient.setQueryData(READ_LIST_QUERY_KEY, readList),
    });
};

export const useRemoveFromReadList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (gutembergId: number) => {
            const readList = await getReadList();
            return writeJson(
                STORAGE_KEYS.READ_LIST,
                readList.filter((stored) => stored.gutembergId !== gutembergId),
            );
        },
        onSuccess: (readList) => queryClient.setQueryData(READ_LIST_QUERY_KEY, readList),
    });
};
