import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useT } from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';

export default function RegisterScreen() {
  const t = useT();
  const { register } = useAuth();
  const [firstName, setFirstName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async () => {
    if (!email) { Alert.alert(t('emailRequired')); return; }
    if (password.length < 6) { Alert.alert(t('passwordMin')); return; }
    if (password !== confirmPassword) { Alert.alert(t('passwordMismatch')); return; }
    setLoading(true);
    try {
      await register({ first_name: firstName, mobile, email, password });
      Alert.alert(t('registerSuccess'));
      router.push('/login');
    } catch (e: any) {
      Alert.alert(e.message || t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg px-6 pt-20"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text className="text-2xl font-bold text-textMain mb-8">{t('register')}</Text>

      <Text className="text-textSub text-sm mb-1">{t('firstName')}</Text>
      <TextInput
        className="bg-card rounded-xl px-4 py-3 mb-4 text-textMain border border-border"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text className="text-textSub text-sm mb-1">{t('mobile')}</Text>
      <TextInput
        className="bg-card rounded-xl px-4 py-3 mb-4 text-textMain border border-border"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />

      <Text className="text-textSub text-sm mb-1">{t('email')}</Text>
      <TextInput
        className="bg-card rounded-xl px-4 py-3 mb-4 text-textMain border border-border"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text className="text-textSub text-sm mb-1">{t('password')}</Text>
      <TextInput
        className="bg-card rounded-xl px-4 py-3 mb-4 text-textMain border border-border"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text className="text-textSub text-sm mb-1">{t('confirmPassword')}</Text>
      <TextInput
        className="bg-card rounded-xl px-4 py-3 mb-6 text-textMain border border-border"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        className="bg-primary rounded-xl py-4 items-center mb-4"
      >
        <Text className="text-white font-semibold text-base">
          {loading ? t('loading') : t('registerBtn')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text className="text-primary text-center">{t('haveAccount')}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
