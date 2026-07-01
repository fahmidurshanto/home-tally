import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useT } from '../hooks/useLang';
import { Expense, Category } from '../types';
import { isExpenseIncome } from '../lib/utils';

interface Props {
  expenses: Expense[];
  categories: Category[];
}

export function MonthlyBarChart({ expenses, categories }: Props) {
  const t = useT();

  // 1. Generate the last 12 months in YYYY-MM and display format MMM,YYYY
  const monthsList = React.useMemo(() => {
    const list = [];
    const now = new Date();
    // Get month names matching the screenshot's format (e.g., Jun,2026)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const label = `${monthNames[monthIndex]},${year}`;
      list.push({ key, label });
    }
    return list;
  }, []);

  // 2. Sum income transactions for each of the last 12 months
  const chartData = React.useMemo(() => {
    return monthsList.map((m) => {
      const monthlyIncome = expenses
        .filter((e) => e.date && e.date.startsWith(m.key) && isExpenseIncome(e, categories))
        .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
      return {
        label: m.label,
        value: monthlyIncome,
      };
    });
  }, [expenses, categories, monthsList]);

  // 3. Calculate max value and dynamic ticks
  const maxVal = React.useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value), 0);
    return max === 0 ? 100000 : max; // Default to 100k if no data to draw a standard scale
  }, [chartData]);

  // Calculate clean step values for 4 intervals
  const yTicks = React.useMemo(() => {
    const ticksCount = 4;
    const rawStep = maxVal / ticksCount;
    let step = 1;
    
    if (rawStep > 0) {
      const order = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const normalized = rawStep / order;
      let roundedNormalized = 1;
      if (normalized <= 1) roundedNormalized = 1;
      else if (normalized <= 2) roundedNormalized = 2;
      else if (normalized <= 2.5) roundedNormalized = 2.5;
      else if (normalized <= 5) roundedNormalized = 5;
      else roundedNormalized = 10;
      step = roundedNormalized * order;
    }

    const cleanMax = step * ticksCount;
    const ticks = [];
    for (let i = ticksCount; i >= 0; i--) {
      ticks.push(step * i);
    }
    return { ticks, cleanMax };
  }, [maxVal]);

  // Format tick labels (e.g., 100000 -> 100k, 0 -> 0)
  const formatTick = (val: number) => {
    if (val === 0) return '0';
    if (val >= 1000) {
      const kVal = val / 1000;
      // If it has decimal places (e.g., 2.5k), keep 1 decimal, else none
      return kVal % 1 === 0 ? `${kVal}k` : `${kVal.toFixed(1)}k`;
    }
    return String(val);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.mainLayout}>
        {/* Left Side: Vertical Rotated Label */}
        <View style={styles.verticalTitleContainer}>
          <Text style={styles.verticalTitleText} numberOfLines={1}>
            {t('monthlyChartTitle')}
          </Text>
        </View>

        {/* Y-Axis Labels */}
        <View style={styles.yAxisContainer}>
          {yTicks.ticks.map((tick, index) => (
            <Text key={index} style={styles.yAxisLabel}>
              {formatTick(tick)}
            </Text>
          ))}
        </View>

        {/* Right Side: Grid and Bars */}
        <View style={styles.chartArea}>
          {/* Horizontal Grid Lines */}
          <View style={styles.gridLinesContainer}>
            {yTicks.ticks.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.gridLine,
                  index === yTicks.ticks.length - 1 ? styles.gridLineBottom : null,
                ]}
              />
            ))}
          </View>

          {/* Bar Columns */}
          <View style={styles.barsContainer}>
            {chartData.map((data, index) => {
              // Calculate height percentage relative to cleanMax
              const heightPct = yTicks.cleanMax > 0 
                ? `${Math.min((data.value / yTicks.cleanMax) * 100, 100)}%` 
                : '0%';

              return (
                <View key={index} style={styles.barColumn}>
                  {/* The actual Bar */}
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { height: heightPct as any },
                        data.value > 0 ? styles.barActive : styles.barZero,
                      ]}
                    />

                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* X-Axis Labels Row */}
      <View style={styles.xAxisRow}>
        {/* Empty placeholder to align with Left Title and Y-Axis */}
        <View style={styles.xAxisLeftOffset} />
        
        {/* X-Axis Labels Container */}
        <View style={styles.xAxisLabelsContainer}>
          {chartData.map((data, index) => (
            <View key={index} style={styles.xAxisLabelWrapper}>
              <Text style={styles.xAxisLabelText} numberOfLines={1}>
                {data.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 8,
  },
  mainLayout: {
    flexDirection: 'row',
    height: 180,
  },
  verticalTitleContainer: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  verticalTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    // Rotate to match the vertical text format in the screenshot
    transform: [{ rotate: '-90deg' }],
    width: 140,
    textAlign: 'center',
  },
  yAxisContainer: {
    width: 38,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingVertical: 2, // Align with grid lines
  },
  yAxisLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridLinesContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    paddingVertical: 8, // align lines with ticks
  },
  gridLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
    opacity: 0.7,
  },
  gridLineBottom: {
    backgroundColor: '#999999',
    opacity: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 8, // sit slightly above the bottom axis line
    zIndex: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '75%', // bar width proportional to space
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barActive: {
    backgroundColor: '#78B5F5', // Light blue matching screenshot
  },
  barZero: {
    backgroundColor: 'transparent',
  },
  xAxisRow: {
    flexDirection: 'row',
    marginTop: 8,
    // Add extra bottom margin to accommodate rotated labels
    marginBottom: 16,
  },
  xAxisLeftOffset: {
    width: 66, // verticalTitleContainer (24) + yAxisContainer (38) + spacing
  },
  xAxisLabelsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  xAxisLabelWrapper: {
    flex: 1,
    alignItems: 'center',
    // Rotate 45 degrees as shown in screenshot
    transform: [{ rotate: '-45deg' }, { translateY: 2 }, { translateX: -8 }],
  },
  xAxisLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
    width: 60,
  },
});
