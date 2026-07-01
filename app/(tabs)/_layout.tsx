import React, { useState } from 'react';
import { router } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import type { TabTriggerSlotProps } from 'expo-router/ui';
import { useT } from '../../hooks/useLang';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import Drawer from '../../components/Drawer';

interface TabButtonProps extends TabTriggerSlotProps {
  icon: string;
  label: string;
}

function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={styles.tabItem}>
      <Text style={{ fontSize: 22, opacity: isFocused ? 1 : 0.5 }}>{icon}</Text>
      <Text style={[styles.tabLabel, { color: isFocused ? '#64bd71' : '#666666' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function TabsLayout() {
  const t = useT();
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tabs>
        <TabSlot style={{ flex: 1 }} />
        <TabList style={styles.tabBar}>
          <TabTrigger name="dashboard" href="/dashboard" asChild>
            <TabButton icon="🏠" label="" />
          </TabTrigger>
          <TabTrigger name="transactions" href="/transactions" style={styles.hiddenTab} />
          <TabTrigger name="categories" href="/categories" style={styles.hiddenTab} />
          <TabTrigger name="module" href="/module" style={styles.hiddenTab} />
          
          <Pressable
            onPress={() => setDrawerVisible(true)}
            style={styles.tabItem}
          >
            <Text style={{ fontSize: 22, opacity: drawerVisible ? 1 : 0.5 }}>📦</Text>
            <Text style={[styles.tabLabel, { color: drawerVisible ? '#64bd71' : '#666666' }]}>
              {t('module')}
            </Text>
          </Pressable>
        </TabList>
      </Tabs>

      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onCategoryPress={() => {
          setDrawerVisible(false);
          router.push('/categories');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    backgroundColor: '#FFFFFF',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  hiddenTab: {
    width: 0,
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
});
