import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import ReanimatedSwipeable, {
    SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, fonts } from '@/constants/theme';

export type SwipeAction = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    background: string;
    tint: string;
    onPress: () => void;
};

type SwipeableRowProps = {
    children: ReactNode;
    /** Révélées par un glissement vers la gauche. */
    actions: SwipeAction[];
};

const ACTION_WIDTH = 72;

export default function SwipeableRow({ children, actions }: SwipeableRowProps) {
    const renderRightActions = (
        _progress: unknown,
        _translation: unknown,
        swipeable: SwipeableMethods,
    ) => (
        <View style={[styles.actions, { width: ACTION_WIDTH * actions.length }]}>
            {actions.map((action) => (
                <Pressable
                    key={action.label}
                    onPress={() => {
                        // On referme d'abord : sinon la ligne reste ouverte
                        // derrière l'alerte ou la feuille d'édition.
                        swipeable.close();
                        action.onPress();
                    }}
                    style={[styles.action, { backgroundColor: action.background }]}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                >
                    <Ionicons name={action.icon} size={19} color={action.tint} />
                    <Text style={[styles.actionLabel, { color: action.tint }]}>{action.label}</Text>
                </Pressable>
            ))}
        </View>
    );

    return (
        <ReanimatedSwipeable
            renderRightActions={renderRightActions}
            rightThreshold={ACTION_WIDTH / 2}
            overshootRight={false}
            friction={2}
        >
            {children}
        </ReanimatedSwipeable>
    );
}

const styles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
    },
    action: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    actionLabel: {
        fontFamily: fonts.mono,
        fontSize: 8.5,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
});

export const EDIT_ACTION_COLORS = {
    background: 'rgba(243,237,227,.08)',
    tint: colors.text,
};

export const DELETE_ACTION_COLORS = {
    background: '#7A3B33',
    tint: '#F6E7E3',
};
