import React from 'react';
import { View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, runOnJS
} from 'react-native-reanimated';
import { Category } from '../types';

interface Props {
  item: Category;
  onDelete: () => void;
  onPress: () => void;
}

export function CategoryItem({ item, onDelete, onPress }: Props) {
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
          <Text className="text-textMain font-semibold">{item.name}</Text>
          <Text className={`text-xs font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
            {isIncome ? 'Income' : 'Expense'}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
