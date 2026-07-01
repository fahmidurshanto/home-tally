import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useT } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { isExpenseIncome } from '../../lib/utils';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AccountScreen() {
  const t = useT();
  const { state: { user } } = useAuth();
  const { state: { expenses, categories } } = useAppData();

  // Date range states (Default to last 30 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());

  // Picker visibility states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Helper to format date like "29 Jun 2026"
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Helper to format date for the buttons like "16-06-2026"
  const formatDateButton = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper to format BDT with comma and BDT suffix
  const formatAmount = (amountStr: string) => {
    const amt = parseFloat(amountStr || '0');
    return amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' BDT';
  };

  // Raw mock statement data matching the screenshot
  const initialTransactions = [
    { id: '1', date: '29 Jun 2026', rawDate: '2026-06-29', narration: 'ATM CASH WITHDRAWAL FROM CASA ON-US', amount: '3000.00', isIncome: false },
    { id: '2', date: '28 Jun 2026', rawDate: '2026-06-28', narration: 'ATM CASH WITHDRAWAL FROM CASA ON-US', amount: '2000.00', isIncome: false },
    { id: '3', date: '28 Jun 2026', rawDate: '2026-06-28', narration: 'ATM CASH WITHDRAWAL FROM CASA ON-US', amount: '2000.00', isIncome: false },
    { id: '4', date: '26 Jun 2026', rawDate: '2026-06-26', narration: 'ATM CASH WITHDRAWAL FROM CASA ON-US', amount: '2500.00', isIncome: false },
    { id: '5', date: '25 Jun 2026', rawDate: '2026-06-25', narration: 'ACCOUNT MAINTENANCE FEE INCL. VAT', amount: '230.00', isIncome: false },
    { id: '6', date: '20 Jun 2026', rawDate: '2026-06-20', narration: 'ATM CASH WITHDRAWAL FROM CASA ON-US', amount: '2500.00', isIncome: false },
    { id: '7', date: '16 Jun 2026', rawDate: '2026-06-16', narration: 'ATM CASH WITHDRAWAL FROM CASA ON-US', amount: '4500.00', isIncome: false },
  ];

  // Base list of all items (real database transactions or mock statement fallback)
  const displayTransactions = React.useMemo(() => {
    return expenses.length > 0 
      ? expenses.map(e => ({
          id: e.id,
          date: formatDateString(e.date),
          rawDate: e.date,
          narration: e.particular || e.category || 'Transaction',
          amount: (isExpenseIncome(e, categories) ? '' : '-') + formatAmount(e.amount),
          isIncome: isExpenseIncome(e, categories),
        }))
      : initialTransactions.map(tx => ({
          id: tx.id,
          date: tx.date,
          rawDate: tx.rawDate,
          narration: tx.narration,
          amount: '-' + formatAmount(tx.amount),
          isIncome: tx.isIncome,
        }));
  }, [expenses, categories]);

  // State containing the filtered list
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Update filtered list when base display list changes
  useEffect(() => {
    setFilteredData(displayTransactions);
  }, [displayTransactions]);

  // Search logic to filter rows between start and end dates
  const handleSearch = () => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = displayTransactions.filter((tx) => {
      const txDate = new Date(tx.rawDate);
      return txDate >= start && txDate <= end;
    });

    setFilteredData(filtered);
  };

  const onChangeStart = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onChangeEnd = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/image.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Top Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <Image
              source={require('../../assets/image-removebg-preview.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>{t('appName')}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {t('hello')}, {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'} !
          </Text>
        </View>

        {/* 3 Green Buttons under the header: Start Date, End Date, Search */}
        <View style={styles.blocksRow}>
          {/* Start Date Picker Button */}
          <TouchableOpacity 
            style={styles.greenBlockButton} 
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonLabel}>Start</Text>
            <Text style={styles.buttonValue}>{formatDateButton(startDate)}</Text>
          </TouchableOpacity>

          {/* End Date Picker Button */}
          <TouchableOpacity 
            style={styles.greenBlockButton} 
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonLabel}>End</Text>
            <Text style={styles.buttonValue}>{formatDateButton(endDate)}</Text>
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity 
            style={styles.searchBlockButton} 
            onPress={handleSearch}
            activeOpacity={0.8}
          >
            <Text style={styles.searchText}>{t('search')}</Text>
          </TouchableOpacity>
        </View>

        {/* Native DateTimePickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onChangeStart}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onChangeEnd}
          />
        )}

        {/* Statement / Ledger Card */}
        <View style={styles.ledgerCard}>
          {/* Table Headers */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.columnHeader, styles.dateCol]}>Date</Text>
            <Text style={[styles.columnHeader, styles.narrationCol]}>Narration</Text>
            <Text style={[styles.columnHeader, styles.amountCol]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {filteredData.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>{t('noTransactions')}</Text>
            </View>
          ) : (
            filteredData.map((tx) => (
              <View key={tx.id} style={styles.tableRow}>
                <Text style={[styles.rowText, styles.dateCol]}>
                  {tx.date}
                </Text>
                <Text style={[styles.rowText, styles.narrationCol]}>
                  {tx.narration}
                </Text>
                <Text 
                  style={[
                    styles.rowText, 
                    styles.amountCol, 
                    tx.isIncome ? styles.positiveAmount : styles.negativeAmount
                  ]}
                >
                  {tx.amount}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: '#64bd71',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerLogo: {
    width: 32,
    height: 32,
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
  blocksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  greenBlockButton: {
    flex: 1,
    height: 42,
    backgroundColor: '#64bd71',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    paddingVertical: 2,
  },
  searchBlockButton: {
    flex: 1,
    height: 42,
    backgroundColor: '#64bd71', // Matches layout screenshot exactly
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  buttonValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  searchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  columnHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  rowText: {
    fontSize: 11,
    color: '#333333',
    textAlign: 'center',
  },
  dateCol: {
    flex: 1.2,
  },
  narrationCol: {
    flex: 2,
    paddingHorizontal: 4,
  },
  amountCol: {
    flex: 1.3,
  },
  negativeAmount: {
    color: '#8B1A1A',
    fontWeight: '700',
  },
  positiveAmount: {
    color: '#1A7A4A',
    fontWeight: '700',
  },
  emptyStateContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
});
