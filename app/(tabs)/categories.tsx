import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, Image, ImageBackground } from 'react-native';
import { useT } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../lib/queries';
import { Category } from '../../types';
import { CategoryItem } from '../../components/CategoryItem';
import { EmptyState } from '../../components/EmptyState';
import { CategoryForm } from '../../components/CategoryForm';
import { AnimatedFAB } from '../../components/AnimatedFAB';

export default function CategoriesScreen() {
  const t = useT();
  const { state: { user } } = useAuth();
  const { state: { categories }, dispatch } = useAppData();
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);

  const company = user?.company ?? '';
  const { data: catData } = useCategories(company);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  useEffect(() => {
    if (catData) dispatch({ type: 'SET_CATEGORIES', payload: catData });
  }, [catData]);

  const handleSave = async (data: { name: string; types: string }) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ ...data, row_id: editingItem.id, company });
      } else {
        await createMutation.mutateAsync({ ...data, company });
      }
      Alert.alert(t('categorySaved'));
    } catch (e: any) {
      Alert.alert(e?.message || t('networkError'));
      throw e; // let CategoryForm keep the modal open for retry
    }
  };

  const handleEdit = (item: Category) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('deleteCategory'),
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
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image
            source={require('../../assets/image-removebg-preview.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{t('categories')}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 24 }}>
        {categories.length === 0 ? (
          <EmptyState
            message={t('noCategories')}
            ctaLabel={t('addCategory')}
            onCta={() => setFormVisible(true)}
          />
        ) : (
          <View style={styles.listContainer}>
            {categories.map((item) => (
              <CategoryItem
                key={item.id}
                item={item}
                onDelete={() => handleDelete(item.id)}
                onPress={() => handleEdit(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AnimatedFAB onPress={() => { setEditingItem(null); setFormVisible(true); }} />

      <CategoryForm
        visible={formVisible}
        onClose={() => { setFormVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        initial={editingItem ? { name: editingItem.name, types: editingItem.types } : undefined}
      />
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
  scrollContainer: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
});

