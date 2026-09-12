import { forwardRef } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing } from '@/constants/theme';

type SearchBarProps = {
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
};

const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
    { value, onChangeText, placeholder = 'Titre, auteur…' },
    ref,
) {
    return (
        <View style={styles.container}>
            <Ionicons name="search" size={15} color={colors.textMuted} />
            <TextInput
                ref={ref}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="rgba(243,237,227,.42)"
                style={styles.input}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
            />
            {value.length > 0 && (
                <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Effacer la recherche">
                    <Ionicons name="close-circle" size={16} color={colors.textFaint} />
                </Pressable>
            )}
        </View>
    );
});

export default SearchBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        height: 42,
        paddingHorizontal: 13,
        borderRadius: 11,
        backgroundColor: colors.surfaceStrong,
        borderWidth: 1,
        borderColor: 'rgba(243,237,227,.09)',
        marginHorizontal: spacing.screen,
    },
    input: {
        flex: 1,
        fontSize: 13.5,
        color: colors.text,
        padding: 0,
    },
});
