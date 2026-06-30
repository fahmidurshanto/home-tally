import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet, Image, ImageBackground } from 'react-native';
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
      console.log('--- REGISTRATION ERROR DETAILS START ---');
      console.log('Error object:', e);
      if (e.response) {
        console.log('Response Status:', e.response.status);
        console.log('Response Headers:', e.response.headers);
        console.log('Response Data:', e.response.data);
      }
      console.log('--- REGISTRATION ERROR DETAILS END ---');
      Alert.alert(e.message || t('networkError'));
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
      <Text style={styles.title}>{t('register')}</Text>

      <Text style={styles.label}>{t('firstName')}</Text>
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="John"
        placeholderTextColor="#999999"
      />

      <Text style={styles.label}>{t('mobile')}</Text>
      <TextInput
        style={styles.input}
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        placeholder="017xxxxxxxx"
        placeholderTextColor="#999999"
      />

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

      <Text style={styles.label}>{t('confirmPassword')}</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholder="••••••"
        placeholderTextColor="#999999"
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? t('loading') : t('registerBtn')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.8}>
        <Text style={styles.linkText}>{t('haveAccount')}</Text>
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
    paddingTop: 80,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#64bd71', // Brand green color
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
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
    marginTop: 4,
  },
});

