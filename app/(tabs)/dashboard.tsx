import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Image } from 'react-native';
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
    const types = categories.find(c => c.id === data.category_id)?.types ?? '1';
    try {
      await createMutation.mutateAsync({ ...data, company, user_id: userId, types });
      Alert.alert(t('entrySaved'));
    } catch (e: any) {
      Alert.alert(e?.message || t('networkError'));
      throw e;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerBrand}>
            <Image
              source={require('../../assets/image-removebg-preview.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>{t('appName')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addCardButton} 
            onPress={() => setFormVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addCardButtonText}>+ {t('addEntry')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>{t('hello')}, {user?.first_name}!</Text>
      </View>

      {/* Filter Row directly below Header */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.activeFilterChip} activeOpacity={0.8}>
          <Text style={styles.activeFilterText}>{t('all')}</Text>
        </TouchableOpacity>
        
        <View style={styles.headerControls}>
          <LanguageToggle />
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>{t('logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard title={t('totalIncome')} amount={formatBDT(totalIncome)} color="#1A7A4A" delay={0} />
          <SummaryCard title={t('totalExpense')} amount={formatBDT(totalExpense)} color="#8B1A1A" delay={100} />
          <SummaryCard title={t('balance')} amount={formatBDT(balance)} color="#64bd71" delay={200} />
        </View>

        <Text style={styles.sectionTitle}>{t('recentTx')}</Text>

        {recent.length === 0 ? (
          <EmptyState
            message={t('noTransactions')}
            ctaLabel={t('addFirst')}
            onCta={() => setFormVisible(true)}
          />
        ) : (
          recent.map((item) => {
            const isIncome = isExpenseIncome(item, categories);
            return (
              <View key={item.id} style={styles.groupContainer}>
                {/* Category Header with Details Link */}
                <View style={styles.groupHeaderRow}>
                  <Text style={styles.groupHeaderTitle}>{item.category || t('category')}</Text>
                  <TouchableOpacity onPress={() => router.push('/transactions')} activeOpacity={0.8}>
                    <Text style={styles.detailsLinkText}>Details &gt;</Text>
                  </TouchableOpacity>
                </View>

                <TransactionItem
                  item={item}
                  isIncome={isIncome}
                  onDelete={() => {}}
                  onPress={() => {}}
                />
              </View>
            );
          })
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Solid light grey
  },
  headerCard: {
    backgroundColor: '#64bd71', // Brand green header
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  addCardButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  addCardButtonText: {
    color: '#64bd71',
    fontWeight: '800',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  activeFilterChip: {
    backgroundColor: 'rgba(100, 189, 113, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#64bd71',
  },
  activeFilterText: {
    color: '#64bd71',
    fontWeight: '700',
    fontSize: 14,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  logoutButtonText: {
    color: '#666666',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detailsLinkText: {
    color: '#64bd71',
    fontSize: 13,
    fontWeight: '700',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardLogoText: {
    fontSize: 24,
  },
  cardDetailsContainer: {
    flex: 1,
  },
  cardParticularText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDateText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  balanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
