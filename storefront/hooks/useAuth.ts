'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (store.user) {
      store.fetchUser();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
