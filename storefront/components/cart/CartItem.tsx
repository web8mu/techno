'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { useCartStore } from '@/lib/cart';
import { useState } from 'react';

interface CartItemData {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  qty: number;
  price: number;
  sale_price?: number;
  subtotal: number;
  image?: string;
  stock: number;
}

interface CartItemProps {
  item: CartItemData;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateItem, removeItem } = useCartStore();
  const [updating, setUpdating] = useState(false);

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || newQty > item.stock || updating) return;
    setUpdating(true);
    try {
      await updateItem(item.id, newQty);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await removeItem(item.id);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-3 py-4">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="flex-shrink-0">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain" />
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-600" />
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
          {item.name}
        </Link>

        <CurrencyDisplay
          amount={item.sale_price || item.price}
          className="text-sm font-semibold text-blue-600 dark:text-blue-400"
        />

        <div className="flex items-center justify-between">
          {/* Qty controls */}
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => handleQtyChange(item.qty - 1)}
              disabled={updating || item.qty <= 1}
              className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700 rounded-l-lg"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 min-w-[1.75rem] items-center justify-center text-xs font-semibold text-gray-900 dark:text-white">
              {item.qty}
            </span>
            <button
              onClick={() => handleQtyChange(item.qty + 1)}
              disabled={updating || item.qty >= item.stock}
              className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700 rounded-r-lg"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={updating}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex-shrink-0">
        <CurrencyDisplay
          amount={item.subtotal}
          className="text-sm font-bold text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
}
