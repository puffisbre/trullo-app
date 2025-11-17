import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

const usersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();
      set({ users, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ loading: false, error: errorMessage });
      console.error('Error fetching users:', error);
    }
  },

  getUserById: (id: string) => {
    const state = get();
    return state.users.find(user => user._id === id);
  },
}));

export const useUsersStore = usersStore;

