import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useT } from '../hooks/useLang';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; types: string }) => void | Promise<void>;
  initial?: { name: string; types: string };
}

export function CategoryForm({ visible, onClose, onSave, initial }: Props) {
  const t = useT();
  const translateY = useSharedValue(600);
  const opacity = useSharedValue(0);

  const [name, setName] = React.useState('');
  const [types, setTypes] = React.useState('1');
  const [saving, setSaving] = React.useState(false);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(600, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setTypes(initial?.types ?? '1');
    }
  }, [visible, initial]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert(t('categoryName'), t('required')); return; }

    setSaving(true);
    try {
      await onSave({ name: name.trim(), types });
      onClose();
    } catch {
      // keep the modal open so the user can retry
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Semi-transparent overlay */}
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={[overlayStyle, styles.overlay]} />
      </TouchableOpacity>

      {/* Bottom sheet with keyboard avoidance */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <Animated.View style={[sheetStyle, styles.sheet]}>
          {/* Title */}
          <Text style={styles.sheetTitle}>
            {initial ? t('editCategory') : t('addCategory')}
          </Text>

          {/* Form fields */}
          <View style={styles.formContent}>
            <Text style={styles.label}>{t('categoryName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('categoryName')}
              placeholderTextColor="#999999"
            />

            <Text style={styles.label}>{t('type')}</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                onPress={() => setTypes('1')}
                style={[
                  styles.typeChip,
                  types === '1' ? styles.typeChipExpense : styles.typeChipInactive,
                ]}
                activeOpacity={0.8}
              >
                <Text style={types === '1' ? styles.typeChipTextActive : styles.typeChipTextExpense}>
                  {t('expense')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTypes('2')}
                style={[
                  styles.typeChip,
                  types === '2' ? styles.typeChipIncome : styles.typeChipInactive,
                ]}
                activeOpacity={0.8}
              >
                <Text style={types === '2' ? styles.typeChipTextActive : styles.typeChipTextIncome}>
                  {t('income')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buttons always pinned at the bottom of the sheet */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              disabled={saving}
              style={styles.cancelButton}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  formContent: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 6,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F4F6F8',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeChipExpense: {
    backgroundColor: '#8B1A1A',
    borderColor: '#8B1A1A',
  },
  typeChipIncome: {
    backgroundColor: '#1A7A4A',
    borderColor: '#1A7A4A',
  },
  typeChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  typeChipTextExpense: {
    color: '#8B1A1A',
    fontWeight: '700',
    fontSize: 15,
  },
  typeChipTextIncome: {
    color: '#1A7A4A',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '700',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#64bd71',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
