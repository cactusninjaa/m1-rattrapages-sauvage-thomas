import { useState } from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Image } from 'expo-image';
import { colors, fonts, pickCoverColor } from '@/constants/theme';
import { StoredBook } from '@/types/library';

type BookCoverProps = {
    book: StoredBook;
    width: DimensionValue;
    height?: DimensionValue;
    /** Taille du titre de la couverture typographique de repli. */
    titleSize?: number;
};

/** Nom de famille seul, l'API renvoie « Austen, Jane ». */
const lastName = (author?: string) => (author ?? '').split(',')[0].trim();

export default function BookCover({ book, width, height, titleSize = 12 }: BookCoverProps) {
    const [failed, setFailed] = useState(false);
    const frame = { width, height, aspectRatio: height === undefined ? 2 / 3 : undefined };

    if (book.coverImage && !failed) {
        return (
            <Image
                source={{ uri: book.coverImage }}
                style={[styles.cover, frame]}
                contentFit="cover"
                transition={180}
                onError={() => setFailed(true)}
            />
        );
    }

    return (
        <View style={[styles.cover, styles.fallback, frame, { backgroundColor: pickCoverColor(book.openLibraryId) }]}>
            <Text numberOfLines={4} style={[styles.fallbackTitle, { fontSize: titleSize }]}>
                {book.title}
            </Text>
            <Text numberOfLines={1} style={[styles.fallbackAuthor, { fontSize: Math.max(6, titleSize * 0.55) }]}>
                {lastName(book.author[0])}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    cover: {
        borderRadius: 4,
        backgroundColor: colors.surface,
        flexShrink: 0,
    },
    fallback: {
        padding: 8,
        justifyContent: 'space-between',
    },
    fallbackTitle: {
        fontFamily: fonts.display,
        lineHeight: 14,
        color: '#F4EDE1',
    },
    fallbackAuthor: {
        fontFamily: fonts.mono,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'rgba(244,237,225,.6)',
    },
});
