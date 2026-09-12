import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BookCover from './BookCover';
import { colors } from '@/constants/theme';
import { StoredBook } from '@/types/library';

type BookRowProps = {
    book: StoredBook;
    onPress?: () => void;
    /** Bouton ou icône affiché à droite. */
    action?: ReactNode;
};

export default function BookRow({ book, onPress, action }: BookRowProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
        >
            <BookCover book={book} width={56} height={84} titleSize={11} />
            <View style={styles.info}>
                <Text numberOfLines={2} style={styles.title}>
                    {book.title}
                </Text>
                <Text numberOfLines={1} style={styles.author}>
                    {book.author.join(', ')}
                </Text>
            </View>
            {action}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingVertical: 9,
    },
    pressed: {
        opacity: 0.6,
    },
    info: {
        flex: 1,
        minWidth: 0,
        gap: 3,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    author: {
        fontSize: 11,
        color: colors.textMuted,
    },
});
