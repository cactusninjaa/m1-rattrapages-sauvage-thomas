import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
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
