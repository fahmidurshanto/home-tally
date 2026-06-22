import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming
} from 'react-native-reanimated';
import { useT } from '../hooks/useLang';
import { Category } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { particular: string; amount: string; date: string; category_id: string }) => void;
  categories: Category[];
  initial?: { particular: string; amount: string; date: string; category_id: string };
}

export function EntryForm({ visible, onClose, onSave, categories, initial }: Props) {
  const t = useT();
  const translateY = useSharedValue(600);
  const opacity = useSharedValue(0);

  const [particular, setParticular] = React.useState(initial?.particular ?? '');
  const [amount, setAmount] = React.useState(initial?.amount ?? '');
  const [date, setDate] = React.useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = React.useState(initial?.category_id ?? '');

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

  const handleSave = () => {
    onSave({ particular, amount, date, category_id: categoryId });
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View style={overlayStyle} className="flex-1 bg-black/40" />
      </TouchableOpacity>
      <Animated.View style={sheetStyle} className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6">
        <Text className="text-textMain text-lg font-bold mb-4">{initial ? t('editEntry') : t('addEntry')}</Text>

        <Text className="text-textSub text-sm mb-1">{t('particular')}</Text>
        <TextInput
          className="bg-bg rounded-xl px-4 py-3 mb-3 text-textMain"
          value={particular}
          onChangeText={setParticular}
          placeholder={t('particular')}
        />

        <Text className="text-textSub text-sm mb-1">{t('amount')}</Text>
        <TextInput
          className="bg-bg rounded-xl px-4 py-3 mb-3 text-textMain"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0"
        />

        <Text className="text-textSub text-sm mb-1">{t('date')}</Text>
        <TextInput
          className="bg-bg rounded-xl px-4 py-3 mb-3 text-textMain"
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        <Text className="text-textSub text-sm mb-1">{t('category')}</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              className={`px-3 py-2 rounded-xl border ${categoryId === cat.id ? 'bg-primary border-primary' : 'bg-white border-border'}`}
            >
              <Text className={categoryId === cat.id ? 'text-white' : 'text-textMain'}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity onPress={onClose} className="flex-1 border border-border rounded-xl py-3 items-center">
            <Text className="text-textSub">{t('cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} className="flex-1 bg-primary rounded-xl py-3 items-center">
            <Text className="text-white font-semibold">{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
