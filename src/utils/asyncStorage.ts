import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Version suffix: moving from Gutenberg to OpenLibrary changed the shape of
 * StoredBook (numeric id -> work key). Stale entries are ignored rather than
 * read with an id that is no longer valid.
 */
export const STORAGE_KEYS = {
    READ_LIST: 'readList.v2',
    REVIEWS: 'reviews.v2',
} as const;

export const readJson = async <T>(key: string, fallback: T): Promise<T> => {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        // Corrupted data: fall back instead of crashing the screen.
        return fallback;
    }
};

export const writeJson = async <T>(key: string, value: T): Promise<T> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return value;
};
