import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
          {/* Coloured dot indicator */}
          <View style={[styles.dot, { backgroundColor: isIncome ? '#1A7A4A' : '#8B1A1A' }]} />

          {/* Name */}
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Right-side type badge (small, no pill) */}
          <Text style={[styles.typeLabel, { color: isIncome ? '#1A7A4A' : '#8B1A1A' }]}>
            {isIncome ? 'Income' : 'Expense'}
          </Text>

          {/* Edit caret */}
          <Text style={styles.caret}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
    flexShrink: 0,
  },
  nameText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 8,
  },
  caret: {
    fontSize: 20,
    color: '#CCCCCC',
    lineHeight: 22,
  },
});
