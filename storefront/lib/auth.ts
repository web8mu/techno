import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, cartApi } from './api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  [key: string]: any;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, password);
          set({ user: res.data.data.user, isLoading: false });
          // Merge guest cart
          const sessionToken = localStorage.getItem('cart_session_token');
          if (sessionToken) {
            await cartApi.mergeCart(sessionToken);
            localStorage.removeItem('cart_session_token');
          }
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          set({ user: res.data.data.user, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null });
      },

      fetchUser: async () => {
        try {
          const res = await authApi.me();
          set({ user: res.data.data });
        } catch {
          set({ user: null });
        }
      },
    }),
    { name: 'techno-auth', partialize: (state) => ({ user: state.user }) }
  )
);
