import { create } from 'zustand';
import {persist} from 'zustand/middleware';

interface LoginState {
    isLoggedIn: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    getToken: () => string | null;
}

const loginStore = create(
  persist<LoginState>(
    (set, get) => ({
      isLoggedIn: false,
      token: null,
      login: (token: string) => {
        // Save token to localStorage for Safari compatibility (cookies may be blocked)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        set({ isLoggedIn: true, token });
      },
      logout: () => {
        // Remove token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ isLoggedIn: false, token: null });
      },
      getToken: () => {
        // Get token from state or localStorage (for Safari compatibility)
        const state = get();
        if (state.token) {
          return state.token;
        }
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('auth_token');
          if (storedToken) {
            set({ token: storedToken });
            return storedToken;
          }
        }
        return null;
      },
    }),
    {
      name: 'login-store',
    }
  )
);

export const useLoginStore = loginStore;