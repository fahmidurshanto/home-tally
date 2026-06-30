import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet, Image, ImageBackground } from 'react-native';
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
    <ImageBackground
      source={require('../../assets/image.png')}
      style={styles.container}
      resizeMode="cover"
    >
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image
            source={require('../../assets/image-removebg-preview.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{t('transactions')}</Text>
        </View>
      </View>

      {/* Filter and Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor="#999999"
        />

        <View style={styles.filterRow}>
          {(['all', '2', '1'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                filter === f ? styles.filterChipActive : styles.filterChipInactive
              ]}
              activeOpacity={0.8}
            >
              <Text style={filter === f ? styles.filterTextActive : styles.filterTextInactive}>
                {f === 'all' ? t('all') : f === '2' ? t('income') : t('expense')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 24 }}>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    backgroundColor: '#64bd71', // Brand green header
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#64bd71', // Brand green active state
    borderColor: '#64bd71',
  },
  filterChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterTextInactive: {
    color: '#666666',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

