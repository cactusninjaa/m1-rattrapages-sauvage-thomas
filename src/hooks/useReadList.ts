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
            if (readList.some((stored) => stored.openLibraryId === book.openLibraryId)) {
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
        mutationFn: async (openLibraryId: string) => {
            const readList = await getReadList();
            return writeJson(
                STORAGE_KEYS.READ_LIST,
                readList.filter((stored) => stored.openLibraryId !== openLibraryId),
            );
        },
        onSuccess: (readList) => queryClient.setQueryData(READ_LIST_QUERY_KEY, readList),
    });
};
