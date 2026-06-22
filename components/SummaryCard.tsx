import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
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
    <Animated.View style={style} className="flex-1 bg-card rounded-xl p-4 shadow-sm">
      <Text className="text-textSub text-sm">{title}</Text>
      <Text className="text-2xl font-bold mt-1" style={{ color }}>{amount}</Text>
    </Animated.View>
  );
}
