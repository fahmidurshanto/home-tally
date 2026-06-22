import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { Category, Expense, ApiResponse } from '../types';

export function useCategories(company: string) {
  return useQuery({
    queryKey: ['categories', company],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories', { params: { company } });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data.data ?? [];
    },
    enabled: !!company,
  });
}

export function useExpenses(company: string) {
  return useQuery({
    queryKey: ['expenses', company],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Expense[]>>('/expense-list', { params: { company_id: company } });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data.data ?? [];
    },
    enabled: !!company,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { company_id: string; category_id: string; user_id: string; particular: string; date: string; amount: string }) => {
      const res = await api.post<ApiResponse>('/entry', data);
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { row_id: string; company_id: string; category_id: string; user_id: string; particular: string; date: string; amount: string }) => {
      const res = await api.post<ApiResponse>('/entry', data);
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row_id: string) => {
      const res = await api.post<ApiResponse>('/delete-entry', { row_id });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; types: string; company: string }) => {
      const res = await api.post<ApiResponse>('/category-entry', data);
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<ApiResponse>('/delete-category', { id });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
