import { useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    ActivityIndicator,
    Alert,
    StyleSheet,
    TextInput,
    useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeader from '@/components/ScreenHeader';
import SearchBar from '@/components/SearchBar';
import BookRow from '@/components/BookRow';
import BookCover from '@/components/BookCover';
import EmptyState from '@/components/EmptyState';
import SectionLabel from '@/components/SectionLabel';
import BarcodeScannerSheet from '@/components/BarcodeScannerSheet';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchBooks, MIN_SEARCH_LENGTH } from '@/hooks/useSearchBooks';
import { useReadList, useAddToReadList, useRemoveFromReadList } from '@/hooks/useReadList';
import { colors, spacing } from '@/constants/theme';
import { StoredBook } from '@/types/library';

const COLUMNS = 3;
const GRID_GAP = 10;

/** Sentinelle pour la tuile « Ajouter » en dernière cellule de la grille. */
const ADD_TILE = 'add-tile' as const;
type GridItem = StoredBook | typeof ADD_TILE;

export default function ReadList() {
    const [query, setQuery] = useState('');
    const [scannerVisible, setScannerVisible] = useState(false);
    const debouncedQuery = useDebouncedValue(query);
    const searchInput = useRef<TextInput>(null);
    const { width } = useWindowDimensions();

    const coverWidth = (width - spacing.screen * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

    const search = useSearchBooks(debouncedQuery);
    const { data: readList = [] } = useReadList();
    const addToReadList = useAddToReadList();
    const removeFromReadList = useRemoveFromReadList();

    const isSearching = debouncedQuery.trim().length >= MIN_SEARCH_LENGTH;
    const isbnMatch = search.data?.isbn;

    const confirmRemove = (book: StoredBook) => {
        Alert.alert('Retirer de la ReadList ?', book.title, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Retirer',
                style: 'destructive',
                onPress: () => removeFromReadList.mutate(book.openLibraryId),
            },
        ]);
    };

    const renderSearchResult = ({ item }: { item: StoredBook }) => {
        const alreadyAdded = readList.some((stored) => stored.openLibraryId === item.openLibraryId);

        return (
            <BookRow
                book={item}
                onPress={alreadyAdded ? undefined : () => addToReadList.mutate(item)}
                action={
                    <Pressable
                        onPress={() => addToReadList.mutate(item)}
                        disabled={alreadyAdded}
                        hitSlop={8}
                        style={[styles.addButton, alreadyAdded && styles.addButtonDone]}
                        accessibilityLabel={alreadyAdded ? 'Déjà dans la ReadList' : `Ajouter ${item.title}`}
                    >
                        <Ionicons
                            name={alreadyAdded ? 'checkmark' : 'add'}
                            size={18}
                            color={alreadyAdded ? colors.green : colors.onAccent}
                        />
                    </Pressable>
                }
            />
        );
    };

    const renderGridItem = ({ item }: { item: GridItem }) => {
        if (item === ADD_TILE) {
            return (
                <Pressable
                    onPress={() => searchInput.current?.focus()}
                    style={[styles.addTile, { width: coverWidth }]}
                    accessibilityLabel="Ajouter un livre"
                >
                    <Ionicons name="add" size={20} color={colors.textFaint} />
                    <Text style={styles.addTileLabel}>Ajouter</Text>
                </Pressable>
            );
        }

        return (
            <View>
                <BookCover book={item} width={coverWidth} />
                <Pressable
                    onPress={() => confirmRemove(item)}
                    hitSlop={8}
                    style={styles.removeBadge}
                    accessibilityRole="button"
                    accessibilityLabel={`Retirer ${item.title} de la ReadList`}
                >
                    <Ionicons name="close" size={13} color={colors.text} />
                </Pressable>
            </View>
        );
    };

    return (
        <View style={styles.screen}>
            <ScreenHeader
                title="ReadList"
                subtitle={`${readList.length} ${readList.length > 1 ? 'livres' : 'livre'} en attente`}
            />
            <SearchBar
                ref={searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Titre, auteur, ISBN…"
                onScanPress={() => setScannerVisible(true)}
            />

            <BarcodeScannerSheet
                visible={scannerVisible}
                onClose={() => setScannerVisible(false)}
                onScanned={(isbn) => {
                    setScannerVisible(false);
                    setQuery(isbn);
                }}
            />

            {isSearching ? (
                <FlatList
                    data={search.data?.books ?? []}
                    keyExtractor={(item) => item.openLibraryId}
                    renderItem={renderSearchResult}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                    ListHeaderComponent={
                        <SectionLabel style={styles.sectionLabel}>
                            {isbnMatch ? `ISBN ${isbnMatch}` : 'Résultats'}
                        </SectionLabel>
                    }
                    ListEmptyComponent={
                        search.isLoading ? (
                            <ActivityIndicator color={colors.accent} style={styles.loader} />
                        ) : search.isError ? (
                            <EmptyState
                                icon="cloud-offline-outline"
                                title="Recherche impossible"
                                hint={search.error.message}
                            />
                        ) : isbnMatch ? (
                            <EmptyState
                                icon="barcode-outline"
                                title={`Aucun livre pour l'ISBN ${isbnMatch}`}
                                hint="Vérifiez le code, ou cherchez plutôt par titre."
                            />
                        ) : (
                            <EmptyState
                                icon="search-outline"
                                title={`Aucun livre pour « ${debouncedQuery.trim()} »`}
                                hint="Essayez un autre titre ou un nom d'auteur."
                            />
                        )
                    }
                />
            ) : (
                <FlatList<GridItem>
                    data={readList.length > 0 ? [...readList, ADD_TILE] : []}
                    key="grid"
                    numColumns={COLUMNS}
                    keyExtractor={(item) => (item === ADD_TILE ? ADD_TILE : item.openLibraryId)}
                    renderItem={renderGridItem}
                    columnWrapperStyle={styles.gridRow}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="book-outline"
                            title="Votre ReadList est vide"
                            hint="Cherchez un livre ci-dessus pour l'ajouter."
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.screen,
        paddingBottom: 40,
        gap: GRID_GAP,
    },
    sectionLabel: {
        marginBottom: 4,
    },
    loader: {
        marginTop: 28,
    },
    gridRow: {
        gap: GRID_GAP,
    },
    removeBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(10,9,11,.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addTile: {
        aspectRatio: 2 / 3,
        borderRadius: 4,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(243,237,227,.2)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    addTileLabel: {
        fontSize: 9,
        color: colors.textFaint,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonDone: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.borderStrong,
    },
});
