import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming
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
      // Parent surfaces the network error; we only close on success.
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
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={overlayStyle} className="flex-1 bg-black/40" />
      </TouchableOpacity>
      <Animated.View style={sheetStyle} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
        <Text className="text-textMain text-lg font-bold mb-4">{initial ? t('editCategory') : t('addCategory')}</Text>

        <Text className="text-textSub text-sm mb-1">{t('categoryName')}</Text>
        <TextInput
          className="bg-bg rounded-xl px-4 py-3 mb-3 text-textMain"
          value={name}
          onChangeText={setName}
          placeholder={t('categoryName')}
          placeholderTextColor="#666666"
        />

        <Text className="text-textSub text-sm mb-1">{t('type')}</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => setTypes('1')}
            className={`flex-1 py-3 rounded-xl border items-center ${types === '1' ? 'bg-expense border-expense' : 'bg-white border-border'}`}
          >
            <Text className={types === '1' ? 'text-white' : 'text-expense'}>{t('expense')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTypes('2')}
            className={`flex-1 py-3 rounded-xl border items-center ${types === '2' ? 'bg-income border-income' : 'bg-white border-border'}`}
          >
            <Text className={types === '2' ? 'text-white' : 'text-income'}>{t('income')}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity onPress={onClose} disabled={saving} className="flex-1 border border-border rounded-xl py-3 items-center">
            <Text className="text-textSub">{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} disabled={saving} className={`flex-1 rounded-xl py-3 items-center ${saving ? 'bg-primary/60' : 'bg-primary'}`}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">{t('save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
