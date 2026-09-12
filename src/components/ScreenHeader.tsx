import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '@/constants/theme';

type ScreenHeaderProps = {
    title: string;
    subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 14 }]}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.screen,
        paddingBottom: 14,
    },
    title: {
        fontFamily: fonts.display,
        fontSize: 32,
        color: colors.text,
    },
    subtitle: {
        fontSize: 11.5,
        color: colors.textMuted,
        marginTop: 5,
    },
});
