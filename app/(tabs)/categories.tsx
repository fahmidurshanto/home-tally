import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
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
    <View className="flex-1 bg-bg">
      <View className="bg-primary px-4 pt-14 pb-4">
        <Text className="text-white text-xl font-semibold">{t('categories')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {categories.length === 0 ? (
          <EmptyState
            message={t('noCategories')}
            ctaLabel={t('addCategory')}
            onCta={() => setFormVisible(true)}
          />
        ) : (
          categories.map((item) => (
            <CategoryItem
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
              onPress={() => handleEdit(item)}
            />
          ))
        )}
      </ScrollView>

      <AnimatedFAB onPress={() => { setEditingItem(null); setFormVisible(true); }} />

      <CategoryForm
        visible={formVisible}
        onClose={() => { setFormVisible(false); setEditingItem(null); }}
        onSave={handleSave}
        initial={editingItem ? { name: editingItem.name, types: editingItem.types } : undefined}
      />
    </View>
  );
}
