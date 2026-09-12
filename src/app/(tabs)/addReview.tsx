import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeader from '@/components/ScreenHeader';
import SearchBar from '@/components/SearchBar';
import BookRow from '@/components/BookRow';
import BookCover from '@/components/BookCover';
import StarRating from '@/components/StarRating';
import SectionLabel from '@/components/SectionLabel';
import EmptyState from '@/components/EmptyState';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchBooks, MIN_SEARCH_LENGTH } from '@/hooks/useSearchBooks';
import { useReadList } from '@/hooks/useReadList';
import { useAddReview } from '@/hooks/useReviews';
import { colors, fonts, spacing } from '@/constants/theme';
import { StoredBook } from '@/types/library';

export default function AddReview() {
    const router = useRouter();

    const [query, setQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState<StoredBook | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const debouncedQuery = useDebouncedValue(query);
    const search = useSearchBooks(debouncedQuery);
    const { data: readList = [] } = useReadList();
    const addReview = useAddReview();

    const isSearching = debouncedQuery.trim().length >= MIN_SEARCH_LENGTH;
    const canPublish = selectedBook !== null && rating > 0 && !addReview.isPending;

    const selectBook = (book: StoredBook) => {
        setSelectedBook(book);
        setQuery('');
    };

    const resetForm = () => {
        setSelectedBook(null);
        setRating(0);
        setComment('');
        setQuery('');
    };

    const publish = () => {
        if (!selectedBook || rating === 0) return;

        addReview.mutate(
            { book: selectedBook, rating, comment },
            {
                onSuccess: () => {
                    resetForm();
                    router.push('/reviews');
                },
            },
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScreenHeader title="Ajouter un avis" />
            <SearchBar value={query} onChangeText={setQuery} placeholder="Chercher un livre…" />

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                {isSearching ? (
                    <View style={styles.section}>
                        <SectionLabel>Résultats</SectionLabel>
                        {search.isLoading ? (
                            <ActivityIndicator color={colors.accent} style={styles.loader} />
                        ) : search.isError ? (
                            <EmptyState
                                icon="cloud-offline-outline"
                                title="Recherche impossible"
                                hint={search.error.message}
                            />
                        ) : search.data?.length === 0 ? (
                            <EmptyState
                                icon="search-outline"
                                title={`Aucun livre pour « ${debouncedQuery.trim()} »`}
                                hint="Essayez un autre titre ou un nom d'auteur."
                            />
                        ) : (
                            search.data?.map((book) => (
                                <BookRow
                                    key={book.gutembergId}
                                    book={book}
                                    onPress={() => selectBook(book)}
                                    action={
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={colors.textFaint}
                                        />
                                    }
                                />
                            ))
                        )}
                    </View>
                ) : null}

                {!isSearching && !selectedBook && readList.length > 0 ? (
                    <View style={styles.section}>
                        <SectionLabel>Dans votre ReadList</SectionLabel>
                        {readList.map((book) => (
                            <BookRow
                                key={book.gutembergId}
                                book={book}
                                onPress={() => selectBook(book)}
                                action={
                                    <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
                                }
                            />
                        ))}
                    </View>
                ) : null}

                {!isSearching && !selectedBook && readList.length === 0 ? (
                    <EmptyState
                        icon="create-outline"
                        title="Choisissez un livre à noter"
                        hint="Cherchez-le ci-dessus, ou ajoutez-en un à votre ReadList."
                    />
                ) : null}

                {selectedBook ? (
                    <View style={styles.section}>
                        <View style={styles.selectedCard}>
                            <BookCover book={selectedBook} width={52} height={78} titleSize={10} />
                            <View style={styles.selectedInfo}>
                                <SectionLabel style={styles.selectedLabel}>Livre sélectionné</SectionLabel>
                                <Text numberOfLines={2} style={styles.selectedTitle}>
                                    {selectedBook.title}
                                </Text>
                                <Text numberOfLines={1} style={styles.selectedAuthor}>
                                    {selectedBook.author.join(', ')}
                                </Text>
                            </View>
                            <Pressable
                                onPress={resetForm}
                                hitSlop={8}
                                accessibilityLabel="Changer de livre"
                            >
                                <Ionicons name="close" size={18} color={colors.textFaint} />
                            </Pressable>
                        </View>

                        <View style={styles.ratingBlock}>
                            <Text style={styles.fieldLabel}>Votre note</Text>
                            <StarRating value={rating} size={30} onChange={setRating} />
                        </View>

                        <TextInput
                            value={comment}
                            onChangeText={setComment}
                            placeholder="Votre avis (facultatif)…"
                            placeholderTextColor="rgba(243,237,227,.38)"
                            style={styles.commentInput}
                            multiline
                            textAlignVertical="top"
                        />

                        <Pressable
                            onPress={publish}
                            disabled={!canPublish}
                            style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
                        >
                            <Text style={styles.publishLabel}>
                                {addReview.isPending ? 'Publication…' : "Publier l'avis"}
                            </Text>
                        </Pressable>

                        {rating === 0 ? (
                            <Text style={styles.hint}>Attribuez une note pour publier.</Text>
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.screen,
        paddingBottom: 40,
        gap: 18,
    },
    section: {
        gap: 8,
    },
    loader: {
        marginTop: 24,
    },
    selectedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        padding: 13,
        borderRadius: 13,
        backgroundColor: 'rgba(243,237,227,.06)',
        borderWidth: 1,
        borderColor: 'rgba(243,237,227,.1)',
    },
    selectedInfo: {
        flex: 1,
        minWidth: 0,
        gap: 3,
    },
    selectedLabel: {
        color: colors.green,
    },
    selectedTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
    },
    selectedAuthor: {
        fontSize: 11.5,
        color: colors.textMuted,
    },
    ratingBlock: {
        gap: 10,
        marginTop: 6,
    },
    fieldLabel: {
        fontSize: 11,
        color: colors.textMuted,
    },
    commentInput: {
        minHeight: 92,
        padding: 13,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: 'rgba(243,237,227,.12)',
        backgroundColor: 'rgba(243,237,227,.03)',
        fontSize: 13,
        lineHeight: 19,
        color: colors.text,
    },
    publishButton: {
        height: 46,
        borderRadius: 11,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    publishButtonDisabled: {
        opacity: 0.4,
    },
    publishLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.onAccent,
    },
    hint: {
        fontFamily: fonts.mono,
        fontSize: 10,
        color: colors.textFaint,
        textAlign: 'center',
    },
});
