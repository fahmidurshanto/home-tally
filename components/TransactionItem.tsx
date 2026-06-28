import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, runOnJS
} from 'react-native-reanimated';
import { Expense } from '../types';

interface Props {
  item: Expense;
  isIncome: boolean;
  onDelete: () => void;
  onPress: () => void;
}

export function TransactionItem({ item, isIncome, onDelete, onPress }: Props) {
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

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={rowStyle}>
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
          {/* Left card-like logo container */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>{isIncome ? '💰' : '💸'}</Text>
          </View>

          {/* Middle Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.particularText} numberOfLines={1}>
              {item.particular}
            </Text>
            <Text style={styles.dateText}>
              {item.category} • {item.date}
            </Text>
          </View>

          {/* Right styled balance/amount button */}
          <View style={[styles.amountButton, { backgroundColor: isIncome ? '#1A7A4A' : '#8B1A1A' }]}>
            <Text style={styles.amountButtonText}>
              {isIncome ? '+' : '-'}৳{item.amount}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logoText: {
    fontSize: 24,
  },
  detailsContainer: {
    flex: 1,
  },
  particularText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  amountButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});

