'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart';

export function useCart() {
  const store = useCartStore();

  useEffect(() => {
    store.fetchCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
