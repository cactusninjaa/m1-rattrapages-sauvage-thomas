import { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import BookCover from './BookCover';
import StarRating from './StarRating';
import SectionLabel from './SectionLabel';
import { colors, fonts } from '@/constants/theme';
import { Review } from '@/types/library';

type EditReviewSheetProps = {
    /** L'avis en cours d'édition, `null` quand la feuille est fermée. */
    review: Review | null;
    onClose: () => void;
    onSave: (rating: number, comment: string) => void;
    isSaving?: boolean;
};

export default function EditReviewSheet({
    review,
    onClose,
    onSave,
    isSaving = false,
}: EditReviewSheetProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    // Réinitialise le formulaire à chaque avis ouvert, pas à chaque rendu.
    useEffect(() => {
        if (review) {
            setRating(review.rating);
            setComment(review.comment);
        }
    }, [review]);

    return (
        <Modal visible={review !== null} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.sheetWrapper}
            >
                <View style={styles.sheet}>
                    <View style={styles.grabber} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Modifier l&apos;avis</Text>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <Text style={styles.close}>Annuler</Text>
                        </Pressable>
                    </View>

                    {review ? (
                        <View style={styles.bookCard}>
                            <BookCover book={review.book} width={52} height={78} titleSize={10} />
                            <View style={styles.bookInfo}>
                                <SectionLabel>Livre noté</SectionLabel>
                                <Text numberOfLines={2} style={styles.bookTitle}>
                                    {review.book.title}
                                </Text>
                                <Text numberOfLines={1} style={styles.bookAuthor}>
                                    {review.book.author.join(', ')}
                                </Text>
                            </View>
                        </View>
                    ) : null}

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
                        onPress={() => onSave(rating, comment)}
                        disabled={rating === 0 || isSaving}
                        style={[styles.saveButton, (rating === 0 || isSaving) && styles.saveButtonDisabled]}
                    >
                        <Text style={styles.saveLabel}>
                            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10,9,11,.62)',
    },
    sheetWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    sheet: {
        backgroundColor: '#1D1A1E',
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderTopWidth: 1,
        borderTopColor: 'rgba(243,237,227,.12)',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 30,
        gap: 14,
    },
    grabber: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(243,237,227,.22)',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 19,
        color: colors.text,
    },
    close: {
        fontSize: 11.5,
        color: colors.textMuted,
    },
    bookCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        padding: 13,
        borderRadius: 13,
        backgroundColor: 'rgba(243,237,227,.06)',
        borderWidth: 1,
        borderColor: 'rgba(243,237,227,.1)',
    },
    bookInfo: {
        flex: 1,
        minWidth: 0,
        gap: 3,
    },
    bookTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
    },
    bookAuthor: {
        fontSize: 11.5,
        color: colors.textMuted,
    },
    ratingBlock: {
        gap: 10,
    },
    fieldLabel: {
        fontSize: 11,
        color: colors.textMuted,
    },
    commentInput: {
        minHeight: 88,
        padding: 13,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: 'rgba(243,237,227,.12)',
        backgroundColor: 'rgba(243,237,227,.03)',
        fontSize: 13,
        lineHeight: 19,
        color: colors.text,
    },
    saveButton: {
        height: 46,
        borderRadius: 11,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.4,
    },
    saveLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.onAccent,
    },
});
