import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useT } from '../hooks/useLang';
import { useAuth } from '../hooks/useAuth';
import { LanguageToggle } from '../components/LanguageToggle';
import { StatusBar } from 'expo-status-bar';

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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Top bar with Language Toggle */}
      <View style={styles.topBar}>
        <View style={{ width: 40 }} />
        <LanguageToggle />
      </View>

      {/* App Title Area (Upper Part) */}
      <View style={styles.titleArea}>
        <Image
          source={require('../assets/image-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>
          {t('welcomeTitle')}
        </Text>
        <Text style={styles.taglineText}>
          {t('appTagline')}
        </Text>
      </View>

      {/* White curved bottom dome (Lower Part) */}
      <View style={styles.bottomDome}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('login')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('register')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2C94C', // Vibrant yellow background
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  logo: {
    width: 160,
    height: 120,
    marginBottom: 16,
  },
  titleArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeText: {
    color: '#1A1A1A',
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 46,
  },
  taglineText: {
    color: 'rgba(26, 26, 26, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  bottomDome: {
    backgroundColor: '#FFFFFF', // Crisp white dome background
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    width: '100%',
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    backgroundColor: '#64bd71', // Soft green color
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // White text
    fontWeight: '700',
    fontSize: 16,
  },
});





