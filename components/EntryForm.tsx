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
  Modal,
  ScrollView,
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
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

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

            {/* Category selector — Dropdown */}
            <Text style={styles.label}>{t('category')}</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={categoryId ? styles.dropdownValueText : styles.dropdownPlaceholderText}>
                {categoryId
                  ? categories.find((c) => c.id === categoryId)?.name ?? t('selectCategory')
                  : t('selectCategory')}
              </Text>
              <Text style={styles.dropdownArrow}>▾</Text>
            </TouchableOpacity>

            {/* Dropdown Modal */}
            <Modal
              visible={dropdownOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setDropdownOpen(false)}
            >
              <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setDropdownOpen(false)}
              >
                <View style={styles.dropdownList}>
                  <Text style={styles.dropdownListTitle}>{t('selectCategory')}</Text>
                  <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.dropdownItem,
                          categoryId === cat.id && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setCategoryId(cat.id);
                          setDropdownOpen(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          categoryId === cat.id && styles.dropdownItemTextActive,
                        ]}>
                          {cat.name}
                        </Text>
                        {categoryId === cat.id && (
                          <Text style={styles.dropdownCheckmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
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
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  dropdownTrigger: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValueText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
  },
  dropdownPlaceholderText: {
    fontSize: 15,
    color: '#999999',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#64bd71',
    fontWeight: '700',
    marginLeft: 8,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    width: '100%',
    maxHeight: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  dropdownItemActive: {
    backgroundColor: '#F0FBF2',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#64bd71',
    fontWeight: '700',
  },
  dropdownCheckmark: {
    fontSize: 16,
    color: '#64bd71',
    fontWeight: '800',
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
