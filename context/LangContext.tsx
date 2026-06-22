import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lang } from '../constants/i18n';

interface LangState { lang: Lang }
type LangAction = { type: 'SET_LANG'; payload: Lang };

function langReducer(state: LangState, action: LangAction): LangState {
  switch (action.type) {
    case 'SET_LANG': return { lang: action.payload };
    default: return state;
  }
}

interface LangContextValue {
  state: LangState;
  setLang: (lang: Lang) => void;
}

export const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(langReducer, { lang: 'en' });

  useEffect(() => {
    AsyncStorage.getItem('lang').then(stored => {
      if (stored === 'en' || stored === 'bn') {
        dispatch({ type: 'SET_LANG', payload: stored });
      }
    });
  }, []);

  const setLang = async (lang: Lang) => {
    await AsyncStorage.setItem('lang', lang);
    dispatch({ type: 'SET_LANG', payload: lang });
  };

  return (
    <LangContext.Provider value={{ state, setLang }}>
      {children}
    </LangContext.Provider>
  );
}
