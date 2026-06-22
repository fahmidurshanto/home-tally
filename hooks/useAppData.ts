import { useContext } from 'react';
import { DataContext } from '../context/DataContext';

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useAppData must be inside DataProvider');
  return ctx;
}
