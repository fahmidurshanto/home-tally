import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Image,
} from 'react-native';

const DRAWER_WIDTH = 280;

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  onCategoryPress?: () => void;
  onAccountPress?: () => void;
}

export default function Drawer({ visible, onClose, onCategoryPress, onAccountPress }: DrawerProps) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: -DRAWER_WIDTH,
          useNativeDriver: true,
          damping: 20,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <View 
      style={styles.container} 
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1} />
      </Animated.View>
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View style={styles.drawerGradient}>
          <View style={styles.drawerContent}>
            <View style={styles.logoSection}>
              <Image source={require('../assets/icon.png')} style={styles.logo} />
              <Text style={styles.appName}>Home Tally</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.drawerTitle}>Menu</Text>
            <TouchableOpacity style={styles.menuItem} onPress={onAccountPress}>
              <Text style={styles.menuItemText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onCategoryPress}>
              <Text style={styles.menuItemText}>Category</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onClose}>
              <Text style={styles.menuItemText}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onClose}>
              <Text style={styles.menuItemText}>Reminders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={onClose}>
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 20,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerGradient: {
    flex: 1,
    backgroundColor: '#64bd71',
  },
  drawerContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    paddingRight: 16,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 24,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
