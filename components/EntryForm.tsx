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
import { Category } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    particular: string;
    amount: string;
    date: string;
    category_id: string;
  }) => void | Promise<void>;
  categories: Category[];
  initial?: {
    particular: string;
    amount: string;
    date: string;
    category_id: string;
  };
}

export function EntryForm({ visible, onClose, onSave, categories, initial }: Props) {
  const t = useT();
  const translateY = useSharedValue(600);
  const opacity = useSharedValue(0);

  const [particular, setParticular] = React.useState(initial?.particular ?? '');
  const [amount, setAmount] = React.useState(initial?.amount ?? '');
  const [date, setDate] = React.useState(
    initial?.date ?? new Date().toISOString().split('T')[0]
  );
  const [categoryId, setCategoryId] = React.useState(initial?.category_id ?? '');
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
    if (initial) {
      setParticular(initial.particular);
      setAmount(initial.amount);
      setDate(initial.date);
      setCategoryId(initial.category_id);
    } else {
      setParticular('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategoryId('');
    }
  }, [initial, visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleSave = async () => {
    if (!particular.trim()) { Alert.alert(t('particular'), t('required')); return; }
    if (!(parseFloat(amount) > 0)) { Alert.alert(t('amount'), t('amountInvalid')); return; }
    if (!categoryId) { Alert.alert(t('selectCategory')); return; }

    setSaving(true);
    try {
      await onSave({ particular: particular.trim(), amount, date, category_id: categoryId });
      onClose();
    } catch (error: any) {
      console.log('Add Entry Error:', error);
      console.log('Response Data:', error.response?.data);
      console.log('Add Entry State:', { particular, amount, date, categoryId });
      // keep modal open so user can retry
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
          {/* Sheet Title */}
          <Text style={styles.sheetTitle}>
            {initial ? t('editEntry') : t('addEntry')}
          </Text>

          {/* Form fields — flex:1 so buttons always stay in view */}
          <View style={styles.formContent}>
            {/* Particular */}
            <Text style={styles.label}>{t('particular')}</Text>
            <TextInput
              style={styles.input}
              value={particular}
              onChangeText={setParticular}
              placeholder={t('particular')}
              placeholderTextColor="#999999"
            />

            {/* Amount */}
            <Text style={styles.label}>{t('amount')}</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#999999"
            />

            {/* Date */}
            <Text style={styles.label}>{t('date')}</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999999"
            />

            {/* Category selector */}
            <Text style={styles.label}>{t('category')}</Text>
            <View style={styles.categoryRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={[
                    styles.categoryChip,
                    categoryId === cat.id
                      ? styles.categoryChipActive
                      : styles.categoryChipInactive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={
                      categoryId === cat.id
                        ? styles.categoryChipTextActive
                        : styles.categoryChipTextInactive
                    }
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
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
  formContent: {
    // grows to fill space, buttons sit below
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: '#64bd71',
    borderColor: '#64bd71',
  },
  categoryChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  categoryChipTextInactive: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
