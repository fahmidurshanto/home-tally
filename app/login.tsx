import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useT } from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const t = useT();
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email) { Alert.alert(t('emailRequired')); return; }
    if (!password || password.length < 6) { Alert.alert(t('passwordMin')); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      Alert.alert(e.message || t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-20">
      <Text className="text-2xl font-bold text-textMain mb-8">{t('login')}</Text>

      <Text className="text-textSub text-sm mb-1">{t('email')}</Text>
      <TextInput
        className="bg-card rounded-xl px-4 py-3 mb-4 text-textMain border border-border"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="email@example.com"
      />

      <Text className="text-textSub text-sm mb-1">{t('password')}</Text>
      <TextInput
        className="bg-card rounded-xl px-4 py-3 mb-6 text-textMain border border-border"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••"
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-primary rounded-xl py-4 items-center mb-4"
      >
        <Text className="text-white font-semibold text-base">
          {loading ? t('loading') : t('loginBtn')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text className="text-primary text-center">{t('noAccount')}</Text>
      </TouchableOpacity>
    </View>
  );
}
