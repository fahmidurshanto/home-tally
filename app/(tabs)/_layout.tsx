import { Tabs } from 'expo-router';
import { useT } from '../../hooks/useLang';
import { Text } from 'react-native';

export default function TabsLayout() {
  const t = useT();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#64bd71',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: { 
          borderTopColor: '#E0E0E0',
          backgroundColor: '#FFFFFF',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          title: t('thisMonth'),
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🏠</Text>
          )
        }} 
      />
      <Tabs.Screen 
        name="transactions" 
        options={{ 
          title: t('transactions'),
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>💳</Text>
          )
        }} 
      />
      <Tabs.Screen 
        name="categories" 
        options={{ 
          title: t('categories'),
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>🏷️</Text>
          )
        }} 
      />
    </Tabs>
  );
}


