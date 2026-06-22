import { useContext } from 'react';
import { LangContext } from '../context/LangContext';
import { strings, StringKey } from '../constants/i18n';

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be inside LangProvider');
  return ctx;
}

export function useT() {
  const { state: { lang } } = useLang();
  return (key: StringKey): string => strings[key][lang];
}
