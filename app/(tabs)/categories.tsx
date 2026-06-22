import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useT } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData';
import { useCategories, useCreateCategory, useDeleteCategory } from '../../lib/queries';
import { CategoryItem } from '../../components/CategoryItem';
import { EmptyState } from '../../components/EmptyState';
import { CategoryForm } from '../../components/CategoryForm';
import { AnimatedFAB } from '../../components/AnimatedFAB';

export default function CategoriesScreen() {
  const t = useT();
  const { state: { user } } = useAuth();
  const { state: { categories }, dispatch } = useAppData();
  const [formVisible, setFormVisible] = useState(false);

  const company = user?.company ?? '';
  const { data: catData } = useCategories(company);
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  useEffect(() => {
    if (catData) dispatch({ type: 'SET_CATEGORIES', payload: catData });
  }, [catData]);

  const handleSave = (data: { name: string; types: string }) => {
    createMutation.mutate({ ...data, company });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
              onPress={() => {}}
            />
          ))
        )}
      </ScrollView>

      <AnimatedFAB onPress={() => setFormVisible(true)} />

      <CategoryForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
}
