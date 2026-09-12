import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { colors, fonts } from '@/constants/theme';

type SectionLabelProps = {
    children: string;
    /** Amber for highlighted sections, grey otherwise. */
    highlighted?: boolean;
    style?: StyleProp<TextStyle>;
};

export default function SectionLabel({ children, highlighted = false, style }: SectionLabelProps) {
    return (
        <Text style={[styles.label, { color: highlighted ? colors.accent : colors.textMuted }, style]}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    label: {
        fontFamily: fonts.mono,
        fontSize: 9.5,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
});
