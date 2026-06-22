import React from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, runOnJS
} from 'react-native-reanimated';
import { Expense } from '../types';

interface Props {
  item: Expense;
  onDelete: () => void;
  onPress: () => void;
}

export function TransactionItem({ item, onDelete, onPress }: Props) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX < 0) translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -80) {
        runOnJS(onDelete)();
        translateX.value = withSpring(0);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isIncome = item.types === '2';

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={rowStyle}>
        <View className="bg-card rounded-xl px-4 py-3 mb-2 flex-row items-center justify-between shadow-sm">
          <View className="flex-1">
            <Text className="text-textMain font-semibold">{item.particular}</Text>
            <Text className="text-textSub text-xs">{item.category} • {item.date}</Text>
          </View>
          <Text className={`font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
            {isIncome ? '+' : '-'}৳{item.amount}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
