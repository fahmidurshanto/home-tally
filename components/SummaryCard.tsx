import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay
} from 'react-native-reanimated';

interface Props {
  title: string;
  amount: string;
  color: string;
  delay?: number;
}

export function SummaryCard({ title, amount, color, delay = 0 }: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, styles.card]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, { color }]}>{amount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    color: '#666666',
    fontSize: 14,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
});
