import React, { createContext, useReducer, ReactNode } from 'react';
import { Category, Expense } from '../types';

interface DataState {
  categories: Category[];
  expenses: Expense[];
  isLoading: boolean;
}

type DataAction =
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_LOADING'; payload: boolean };

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

interface DataContextValue {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
}

export const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, {
    categories: [],
    expenses: [],
    isLoading: false,
  });

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}
