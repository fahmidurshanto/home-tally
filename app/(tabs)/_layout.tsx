import { Tabs } from 'expo-router';
import { useT } from '../../hooks/useLang';
import { Text } from 'react-native';

export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E3A5F',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: { borderTopColor: '#E0E0E0' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: t('thisMonth') }} />
      <Tabs.Screen name="transactions" options={{ title: t('transactions') }} />
      <Tabs.Screen name="categories" options={{ title: t('categories') }} />
    </Tabs>
  );
}
