import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#0a0a0f', borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1 },
      tabBarActiveTintColor: '#FF69B4',
      tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
    }}>
      <Tabs.Screen name="dashboard" options={{ tabBarLabel: 'My Globes', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🌍</Text> }} />
      <Tabs.Screen name="create" options={{ tabBarLabel: 'Create', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✨</Text> }} />
    </Tabs>
  );
}
