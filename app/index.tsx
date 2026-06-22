import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useT } from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';
import { LanguageToggle } from '../components/LanguageToggle';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const t = useT();
  const { state: { isAuthenticated, isLoading } } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return null;
  if (isAuthenticated) return null;

  return (
    <View className="flex-1 bg-primary items-center justify-center px-6">
      <View className="absolute top-14 right-6">
        <LanguageToggle />
      </View>

      <Animated.View entering={FadeIn.duration(600)}>
        <Text className="text-white text-4xl font-bold text-center">{t('appName')}</Text>
        <Text className="text-white/80 text-lg text-center mt-2">{t('appTagline')}</Text>
      </Animated.View>

      <View className="mt-16 w-full gap-3">
        <TouchableOpacity
          className="bg-white rounded-xl py-4 items-center"
          onPress={() => router.push('/login')}
        >
          <Text className="text-primary font-semibold text-base">{t('login')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-white rounded-xl py-4 items-center"
          onPress={() => router.push('/register')}
        >
          <Text className="text-white font-semibold text-base">{t('register')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
