import { create } from 'zustand';
import {persist} from 'zustand/middleware';

interface LoginState {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

const loginStore = create(
  persist<LoginState>(
    (set) => ({
      isLoggedIn: false,
      login: () => {
        set({ isLoggedIn: true });
      },
      logout: () => {
        set({ isLoggedIn: false });
      },
    }),
    {
      name: 'login-store',
    }
  )
);

export const useLoginStore = loginStore;