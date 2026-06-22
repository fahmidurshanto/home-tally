import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Props {
  message: string;
  ctaLabel: string;
  onCta: () => void;
}

export function EmptyState({ message, ctaLabel, onCta }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(500)} className="flex-1 items-center justify-center py-20">
      <View className="w-24 h-24 rounded-2xl bg-bg border-2 border-border items-center justify-center mb-6">
        <Text className="text-5xl">📭</Text>
      </View>
      <Text className="text-textSub text-base text-center mb-4">{message}</Text>
      <TouchableOpacity
        className="bg-primary px-6 py-3 rounded-xl"
        onPress={onCta}
      >
        <Text className="text-white font-semibold">{ctaLabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
