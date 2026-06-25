import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';
import { getDeviceMeta } from '../lib/utils';
import { User, ApiResponse } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN':
      return { user: action.payload.user, isLoading: false, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, isLoading: false, isAuthenticated: false };
    default:
      return state;
  }
}

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { first_name: string; mobile: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    restoreSession();
  }, []);

  // This backend issues no auth token — every request relies on the global
  // X-API-KEY. The session is therefore persisted as just the user object; its
  // presence is the sole signal for "logged in".
  async function restoreSession() {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        dispatch({ type: 'LOGIN', payload: { user: JSON.parse(userJson) } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  const login = async (email: string, password: string) => {
    const res = await api.post<ApiResponse<User[]>>('/login', { username: email, password });
    if (res.data.error !== 'False') throw new Error(res.data.message);
    const user = res.data.data![0];
    await AsyncStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user } });
  };

  const register = async (data: { first_name: string; mobile: string; email: string; password: string }) => {
    const meta = await getDeviceMeta();
    const res = await api.post<ApiResponse>('/register', { ...data, ...meta });
    if (res.data.error !== 'False') throw new Error(res.data.message);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
