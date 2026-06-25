import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useT } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { useExpenses, useDeleteExpense } from '../../lib/queries';
import { TransactionItem } from '../../components/TransactionItem';
import { EmptyState } from '../../components/EmptyState';
import { EntryForm } from '../../components/EntryForm';
import { AnimatedFAB } from '../../components/AnimatedFAB';
import { useCreateExpense, useUpdateExpense } from '../../lib/queries';
import { isExpenseIncome } from '../../lib/utils';

export default function TransactionsScreen() {
  const t = useT();
  const { state: { user } } = useAuth();
  const { state: { expenses, categories }, dispatch } = useAppData();
  const [filter, setFilter] = useState<'all' | '1' | '2'>('all');
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const company = user?.company ?? '';
  // IMPORTANT: user_id MUST be user.id, NOT user.company. They happen to be
  // equal in the sample account (both "54") but are distinct fields.
  const userId = user?.id ?? '';
  const { data: expData } = useExpenses(company);
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  useEffect(() => {
    if (expData) dispatch({ type: 'SET_EXPENSES', payload: expData });
  }, [expData]);

  // API 8 omits `types` on rows — resolve income vs expense via the category.
  const filtered = expenses.filter(e => {
    if (filter !== 'all') {
      const income = isExpenseIncome(e, categories);
      if (filter === '2' && !income) return false;
      if (filter === '1' && income) return false;
    }
    if (search && !e.particular.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = async (data: { particular: string; amount: string; date: string; category_id: string }) => {
    // Income vs expense is determined by the selected category's `types` (1 = expense, 2 = income).
    const types = categories.find(c => c.id === data.category_id)?.types ?? '1';
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ ...data, row_id: editingItem.id, company, user_id: userId, types });
      } else {
        await createMutation.mutateAsync({ ...data, company, user_id: userId, types });
      }
      Alert.alert(t('entrySaved'));
    } catch (e: any) {
      Alert.alert(e?.message || t('networkError'));
      throw e; // let EntryForm keep the modal open for retry
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('deleteConfirm'),
      '',
      [
        { text: t('no'), style: 'cancel' },
        { text: t('yes'), style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ],
    );
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="bg-primary px-4 pt-14 pb-4">
        <Text className="text-white text-xl font-semibold">{t('transactions')}</Text>
      </View>

      <View className="px-4 pt-3">
        <TextInput
          className="bg-card rounded-xl px-4 py-2 text-textMain border border-border"
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor="#666666"
        />

        <View className="flex-row gap-2 my-3">
          {(['all', '2', '1'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl ${filter === f ? 'bg-primary' : 'bg-card border border-border'}`}
            >
              <Text className={filter === f ? 'text-white' : 'text-textSub'}>
                {f === 'all' ? t('all') : f === '2' ? t('income') : t('expense')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {filtered.length === 0 ? (
          <EmptyState
            message={t('noTransactions')}
            ctaLabel={t('addFirst')}
            onCta={() => setFormVisible(true)}
          />
        ) : (
          filtered.map((item) => (
            <TransactionItem
              key={item.id}
              item={item}
              isIncome={isExpenseIncome(item, categories)}
              onDelete={() => handleDelete(item.id)}
              onPress={() => handleEdit(item)}
            />
          ))
        )}
      </ScrollView>

      <AnimatedFAB onPress={() => { setEditingItem(null); setFormVisible(true); }} />

      <EntryForm
        visible={formVisible}
        onClose={() => { setFormVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        categories={categories}
        initial={editingItem ? { particular: editingItem.particular, amount: editingItem.amount, date: editingItem.date, category_id: editingItem.category_id } : undefined}
      />
    </KeyboardAvoidingView>
  );
}
