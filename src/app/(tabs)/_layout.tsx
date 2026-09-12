import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Chaque écran porte son propre titre, pas de header natif.
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: 'rgba(243,237,227,.38)',
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 9,
        },
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="readList"
        options={{
          title: 'ReadList',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="addReview"
        options={{
          title: 'Ajouter',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'add-sharp' : 'add-circle-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: 'Mes avis',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'star-sharp' : 'star-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
