'use client';

import { useState } from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useCartStore } from '@/lib/cart';
import { trackAddToCart } from '@/lib/tracking';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: any;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const maxQty = product.stock || 0;
  const isOutOfStock = maxQty === 0;

  const handleAdd = async () => {
    if (isOutOfStock || loading) return;
    setLoading(true);
    try {
      await addItem(product.id, qty);
      trackAddToCart(product, qty);
      toast.success(`${qty} × ${product.name} added to cart!`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Quantity */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-l-lg"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className={cn('flex h-9 min-w-[2.5rem] items-center justify-center text-sm font-semibold text-gray-900 dark:text-white')}>
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-r-lg"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{maxQty} available</span>
        </div>
      )}

      {/* Button */}
      <Button
        onClick={handleAdd}
        disabled={isOutOfStock || loading}
        isLoading={loading}
        size="lg"
        className="w-full"
      >
        <ShoppingCart className="h-5 w-5" />
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  );
}
