import { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import BookCover from '@/components/BookCover';
import StarRating from '@/components/StarRating';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';
import EditReviewSheet from '@/components/EditReviewSheet';
import SwipeableRow, {
    EDIT_ACTION_COLORS,
    DELETE_ACTION_COLORS,
} from '@/components/SwipeableRow';
import { useReviews, useDeleteReview, useUpdateReview } from '@/hooks/useReviews';
import { useReadList } from '@/hooks/useReadList';
import { colors, fonts, spacing } from '@/constants/theme';
import { Review } from '@/types/library';

const RATINGS = [1, 2, 3, 4, 5];
const HISTOGRAM_HEIGHT = 42;

export default function Reviews() {
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [editedId, setEditedId] = useState<string | null>(null);

    const { data: reviews = [] } = useReviews();
    const { data: readList = [] } = useReadList();
    const deleteReview = useDeleteReview();
    const updateReview = useUpdateReview();

    // On garde l'id plutôt que l'objet : la feuille reste synchrone avec le
    // cache si l'avis change pendant l'édition.
    const editedReview = reviews.find((review) => review.id === editedId) ?? null;

    const { average, countByRating } = useMemo(() => {
        const counts = RATINGS.map((rating) => reviews.filter((r) => r.rating === rating).length);
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return {
            average: reviews.length ? total / reviews.length : 0,
            countByRating: counts,
        };
    }, [reviews]);

    const maxCount = Math.max(...countByRating, 1);

    const visibleReviews = ratingFilter
        ? reviews.filter((review) => review.rating === ratingFilter)
        : reviews;

    const confirmDelete = (review: Review) => {
        Alert.alert('Supprimer cet avis ?', review.book.title, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: () => deleteReview.mutate(review.id),
            },
        ]);
    };

    const renderReview = ({ item }: { item: Review }) => (
        <SwipeableRow
            actions={[
                {
                    icon: 'pencil',
                    label: 'Modifier',
                    ...EDIT_ACTION_COLORS,
                    onPress: () => setEditedId(item.id),
                },
                {
                    icon: 'trash-outline',
                    label: 'Supprimer',
                    ...DELETE_ACTION_COLORS,
                    onPress: () => confirmDelete(item),
                },
            ]}
        >
            <View
                style={styles.reviewRow}
                accessibilityLabel={`${item.book.title}, ${item.rating} sur 5. Glissez vers la gauche pour modifier ou supprimer.`}
            >
                <BookCover book={item.book} width={52} height={78} titleSize={10} />
                <View style={styles.reviewBody}>
                    <View style={styles.reviewTop}>
                        <Text numberOfLines={2} style={styles.reviewTitle}>
                            {item.book.title}
                        </Text>
                        <Text style={styles.reviewDate}>
                            {format(new Date(item.createdAt), 'dd MMM', { locale: fr }).toUpperCase()}
                        </Text>
                    </View>
                    <Text numberOfLines={1} style={styles.reviewAuthor}>
                        {item.book.author.join(', ')}
                    </Text>
                    <StarRating value={item.rating} size={13} />
                    {item.comment ? <Text style={styles.reviewComment}>{item.comment}</Text> : null}
                </View>
            </View>
        </SwipeableRow>
    );

    return (
        <View style={styles.screen}>
            <EditReviewSheet
                review={editedReview}
                onClose={() => setEditedId(null)}
                isSaving={updateReview.isPending}
                onSave={(rating, comment) => {
                    if (!editedReview) return;
                    updateReview.mutate(
                        { id: editedReview.id, rating, comment },
                        { onSuccess: () => setEditedId(null) },
                    );
                }}
            />

            <FlatList
                data={visibleReviews}
                keyExtractor={(item) => item.id}
                renderItem={renderReview}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View>
                        <ScreenHeader title="Mes avis" />

                        <View style={styles.stats}>
                            <StatCard value={String(reviews.length)} label="avis publiés" />
                            <StatCard value={String(readList.length)} label="livres en ReadList" />
                            <StatCard
                                value={reviews.length ? average.toFixed(1).replace('.', ',') : '—'}
                                label="note moyenne"
                                highlighted
                            />
                        </View>

                        {reviews.length > 0 ? (
                            <View style={styles.histogramBlock}>
                                <View style={styles.histogram}>
                                    {RATINGS.map((rating, index) => {
                                        const count = countByRating[index];
                                        const active = ratingFilter === rating;
                                        return (
                                            <Pressable
                                                key={rating}
                                                style={styles.histogramColumn}
                                                onPress={() => setRatingFilter(active ? null : rating)}
                                                accessibilityLabel={`${count} avis à ${rating} étoiles`}
                                            >
                                                <View
                                                    style={[
                                                        styles.histogramBar,
                                                        {
                                                            height: Math.max(
                                                                4,
                                                                (count / maxCount) * HISTOGRAM_HEIGHT,
                                                            ),
                                                            backgroundColor: active
                                                                ? colors.accent
                                                                : colors.track,
                                                        },
                                                    ]}
                                                />
                                                <Text
                                                    style={[
                                                        styles.histogramLabel,
                                                        active && styles.histogramLabelActive,
                                                    ]}
                                                >
                                                    {'★'.repeat(rating)}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                                <Text style={styles.filterCaption}>
                                    {ratingFilter
                                        ? `Filtre actif : ${ratingFilter} ${ratingFilter > 1 ? 'étoiles' : 'étoile'} · ${visibleReviews.length} avis — appuyez de nouveau pour tout voir`
                                        : 'Appuyez sur une barre pour filtrer · glissez un avis vers la gauche pour le modifier'}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyWrapper}>
                        <EmptyState
                            icon={reviews.length ? 'funnel-outline' : 'star-outline'}
                            title={
                                reviews.length
                                    ? 'Aucun avis à cette note'
                                    : "Vous n'avez pas encore publié d'avis"
                            }
                            hint={
                                reviews.length
                                    ? 'Touchez la barre active pour retirer le filtre.'
                                    : "Rendez-vous dans l'onglet Ajouter pour noter un livre."
                            }
                        />
                    </View>
                }
            />
        </View>
    );
}

function StatCard({
    value,
    label,
    highlighted = false,
}: {
    value: string;
    label: string;
    highlighted?: boolean;
}) {
    return (
        <View style={styles.statCard}>
            <Text style={[styles.statValue, highlighted && styles.statValueHighlighted]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        paddingBottom: 40,
    },
    stats: {
        flexDirection: 'row',
        gap: 9,
        paddingHorizontal: spacing.screen,
    },
    statCard: {
        flex: 1,
        padding: 11,
        borderRadius: 11,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: {
        fontFamily: fonts.display,
        fontSize: 24,
        color: colors.text,
    },
    statValueHighlighted: {
        color: colors.accent,
    },
    statLabel: {
        fontSize: 9.5,
        color: colors.textMuted,
        marginTop: 3,
    },
    histogramBlock: {
        paddingHorizontal: spacing.screen,
        paddingTop: 16,
    },
    histogram: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        height: HISTOGRAM_HEIGHT + 18,
    },
    histogramColumn: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
        justifyContent: 'flex-end',
    },
    histogramBar: {
        width: '100%',
        borderRadius: 2,
    },
    histogramLabel: {
        fontSize: 8,
        color: colors.textMuted,
    },
    histogramLabelActive: {
        color: colors.accent,
    },
    filterCaption: {
        fontSize: 10,
        color: colors.textFaint,
        marginTop: 8,
        lineHeight: 15,
    },
    emptyWrapper: {
        paddingHorizontal: spacing.screen,
        paddingTop: 24,
    },
    reviewRow: {
        flexDirection: 'row',
        gap: 13,
        // Padding plutôt que marge : la ligne occupe toute la largeur pour que
        // les actions glissées atteignent le bord de l'écran.
        paddingHorizontal: spacing.screen,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(243,237,227,.09)',
        // Opaque, sinon les actions transparaissent sous la ligne pendant le glissement.
        backgroundColor: colors.background,
    },
    reviewBody: {
        flex: 1,
        minWidth: 0,
        gap: 6,
    },
    reviewTop: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 8,
    },
    reviewTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    reviewDate: {
        fontFamily: fonts.mono,
        fontSize: 9,
        color: colors.textFaint,
    },
    reviewAuthor: {
        fontSize: 11,
        color: colors.textMuted,
    },
    reviewComment: {
        fontSize: 11.5,
        lineHeight: 17,
        color: colors.textSoft,
    },
});
