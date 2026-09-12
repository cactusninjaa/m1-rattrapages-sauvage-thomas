import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Suffixe de version : le passage de Gutenberg à OpenLibrary a changé la forme
 * de StoredBook (id numérique → clé d'œuvre). Les anciennes entrées sont
 * ignorées plutôt que lues avec un identifiant devenu invalide.
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
        // Donnée corrompue : on repart du fallback plutôt que de faire planter l'écran.
        return fallback;
    }
};

export const writeJson = async <T>(key: string, value: T): Promise<T> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return value;
};
