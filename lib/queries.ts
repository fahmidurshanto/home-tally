import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { Category, Expense, ApiResponse } from '../types';

// API 3 — All Category: GET /category?company=&row_id(optional)
export function useCategories(company: string) {
  return useQuery({
    queryKey: ['categories', company],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/category', { params: { company } });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data.data ?? [];
    },
    enabled: !!company,
  });
}

// API 8 — Get Expense and Income: GET /expenses?company=
export function useExpenses(company: string) {
  return useQuery({
    queryKey: ['expenses', company],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Expense[]>>('/expenses', { params: { company } });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data.data ?? [];
    },
    enabled: !!company,
  });
}

// API 9 — New expense/Income: POST /expenses
export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { company: string; category_id: string; user_id: string; particular: string; date: string; amount: string; types: string }) => {
      const res = await api.post<ApiResponse>('/expenses', data);
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// API 10 — Update expense/Income: POST /expenses (with row_id)
export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { row_id: string; company: string; category_id: string; user_id: string; particular: string; date: string; amount: string; types: string }) => {
      const res = await api.post<ApiResponse>('/expenses', data);
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// API 11 — Remove expense/Income: PATCH /expenses
export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row_id: string) => {
      const res = await api.patch<ApiResponse>('/expenses', { row_id });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// API 4 — New Category: POST /category
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; types: string; company: string }) => {
      const res = await api.post<ApiResponse>('/category', data);
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// API 5 — Update Category: PUT /category
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { row_id: string; name: string; types: string; company: string }) => {
      const res = await api.put<ApiResponse>('/category', data);
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// API 6 — Remove Category: PATCH /category
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row_id: string) => {
      const res = await api.patch<ApiResponse>('/category', { row_id });
      if (res.data.error !== 'False') throw new Error(res.data.message);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
