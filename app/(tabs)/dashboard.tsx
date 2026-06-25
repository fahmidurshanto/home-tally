import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useT } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { useCategories, useExpenses, useCreateExpense } from '../../lib/queries';
import { LanguageToggle } from '../../components/LanguageToggle';
import { SummaryCard } from '../../components/SummaryCard';
import { AnimatedFAB } from '../../components/AnimatedFAB';
import { TransactionItem } from '../../components/TransactionItem';
import { EmptyState } from '../../components/EmptyState';
import { EntryForm } from '../../components/EntryForm';
import { formatBDT, formatDate, isExpenseIncome } from '../../lib/utils';

export default function DashboardScreen() {
  const t = useT();
  const { state: { user }, logout } = useAuth();
  const { state: { expenses, categories }, dispatch } = useAppData();
  const [formVisible, setFormVisible] = useState(false);

  const company = user?.company ?? '';
  // IMPORTANT: user_id MUST be user.id, NOT user.company. They happen to be
  // equal in the sample account (both "54") but are distinct fields.
  const userId = user?.id ?? '';
  const { data: catData } = useCategories(company);
  const { data: expData } = useExpenses(company);
  const createMutation = useCreateExpense();

  useEffect(() => {
    if (catData) dispatch({ type: 'SET_CATEGORIES', payload: catData });
  }, [catData]);

  useEffect(() => {
    if (expData) dispatch({ type: 'SET_EXPENSES', payload: expData });
  }, [expData]);

  // API 8 omits `types` on rows — resolve via the entry's category instead.
  const totalIncome = expenses
    .filter(e => isExpenseIncome(e, categories))
    .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
  const totalExpense = expenses
    .filter(e => !isExpenseIncome(e, categories))
    .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
  const balance = totalIncome - totalExpense;
  const recent = expenses.slice(0, 5);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleSave = async (data: { particular: string; amount: string; date: string; category_id: string }) => {
    // Income vs expense is determined by the selected category's `types` (1 = expense, 2 = income).
    const types = categories.find(c => c.id === data.category_id)?.types ?? '1';
    try {
      await createMutation.mutateAsync({ ...data, company, user_id: userId, types });
      Alert.alert(t('entrySaved'));
    } catch (e: any) {
      Alert.alert(e?.message || t('networkError'));
      throw e; // let EntryForm keep the modal open for retry
    }
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 bg-primary">
        <Text className="text-white text-xl font-semibold">
          {t('hello')}, {user?.first_name}!
        </Text>
        <View className="flex-row items-center gap-3">
          <LanguageToggle />
          <TouchableOpacity onPress={handleLogout}>
            <Text className="text-white text-sm">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row gap-3 mb-6">
          <SummaryCard title={t('totalIncome')} amount={formatBDT(totalIncome)} color="#1A7A4A" delay={0} />
          <SummaryCard title={t('totalExpense')} amount={formatBDT(totalExpense)} color="#8B1A1A" delay={100} />
          <SummaryCard title={t('balance')} amount={formatBDT(balance)} color="#1E3A5F" delay={200} />
        </View>

        <Text className="text-textMain font-semibold text-base mb-3">{t('recentTx')}</Text>

        {recent.length === 0 ? (
          <EmptyState
            message={t('noTransactions')}
            ctaLabel={t('addFirst')}
            onCta={() => setFormVisible(true)}
          />
        ) : (
          recent.map((item) => (
            <TransactionItem
              key={item.id}
              item={item}
              isIncome={isExpenseIncome(item, categories)}
              onDelete={() => {}}
              onPress={() => {}}
            />
          ))
        )}
      </ScrollView>

      <AnimatedFAB onPress={() => setFormVisible(true)} />

      <EntryForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        categories={categories}
      />
    </View>
  );
}
