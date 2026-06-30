import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useT } from '../../hooks/useLang';

export default function ModuleScreen() {
  const t = useT();

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('module')}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
});
