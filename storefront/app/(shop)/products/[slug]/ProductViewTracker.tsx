'use client';

import { useEffect } from 'react';
import { trackViewItem } from '@/lib/tracking';

export function ProductViewTracker({ product }: { product: any }) {
  useEffect(() => {
    trackViewItem(product);
  }, [product]);

  return null;
}
