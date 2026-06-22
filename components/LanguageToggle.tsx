import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useLang } from '../hooks/useLang';

export function LanguageToggle() {
  const { state: { lang }, setLang } = useLang();
  const translateX = useSharedValue(lang === 'en' ? 0 : 36);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const toggle = () => {
    const next = lang === 'en' ? 'bn' : 'en';
    translateX.value = withSpring(next === 'en' ? 0 : 36, { damping: 15 });
    setLang(next);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      className="flex-row items-center bg-white border border-border rounded-full px-2 py-1"
      activeOpacity={0.8}
    >
      <Text className={`text-xs font-semibold mr-1 ${lang === 'en' ? 'text-primary' : 'text-textSub'}`}>EN</Text>
      <View className="w-14 h-6 bg-bg rounded-full justify-center">
        <Animated.View style={knobStyle} className="w-6 h-6 bg-primary rounded-full" />
      </View>
      <Text className={`text-xs font-semibold ml-1 ${lang === 'bn' ? 'text-primary' : 'text-textSub'}`}>বাংলা</Text>
    </TouchableOpacity>
  );
}
