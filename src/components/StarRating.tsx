import { View, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/theme';

type StarRatingProps = {
    value: number;
    size?: number;
    /** Absent = lecture seule. */
    onChange?: (rating: number) => void;
};

const STARS = [1, 2, 3, 4, 5];

export default function StarRating({ value, size = 14, onChange }: StarRatingProps) {
    return (
        <View style={[styles.row, { gap: size * 0.35 }]}>
            {STARS.map((star) => {
                const icon = star <= value ? 'star' : 'star-outline';
                const color = star <= value ? colors.accent : 'rgba(243,237,227,.2)';

                if (!onChange) {
                    return <Ionicons key={star} name={icon} size={size} color={color} />;
                }

                return (
                    <Pressable
                        key={star}
                        onPress={() => onChange(star)}
                        hitSlop={6}
                        accessibilityRole="button"
                        accessibilityLabel={`Noter ${star} sur 5`}
                    >
                        <Ionicons name={icon} size={size} color={color} />
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
