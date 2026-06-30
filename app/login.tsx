import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet, Image, ImageBackground } from 'react-native';
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
    <ImageBackground
      source={require('../assets/image.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Image
        source={require('../assets/image-removebg-preview.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>{t('login')}</Text>

      <Text style={styles.label}>{t('email')}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="email@example.com"
        placeholderTextColor="#999999"
      />

      <Text style={styles.label}>{t('password')}</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••"
        placeholderTextColor="#999999"
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? t('loading') : t('loginBtn')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.8}>
        <Text style={styles.linkText}>{t('noAccount')}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 96,
  },
  logo: {
    width: 120,
    height: 90,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#64bd71', // Brand green color
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  linkText: {
    color: '#64bd71', // Brand green color
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 8,
  },
});

