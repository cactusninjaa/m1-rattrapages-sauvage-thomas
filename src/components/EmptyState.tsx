import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/theme';

type EmptyStateProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    hint?: string;
};

export default function EmptyState({ icon, title, hint }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={24} color={colors.textFaint} />
            <Text style={styles.title}>{title}</Text>
            {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: 8,
        paddingVertical: 34,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderStrong,
    },
    title: {
        fontSize: 13,
        color: colors.textSoft,
        textAlign: 'center',
    },
    hint: {
        fontSize: 11.5,
        color: colors.textFaint,
        textAlign: 'center',
        lineHeight: 17,
    },
});
