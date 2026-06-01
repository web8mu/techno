'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Badge } from '@/components/common/Badge';
import { useCartStore } from '@/lib/cart';
import { trackAddToCart } from '@/lib/tracking';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string | number;
  sale_price?: string | number | null;
  stock: number;
  images?: Array<{ url: string; alt?: string }>;
  brand?: { name: string };
  is_featured?: boolean;
  is_best_seller?: boolean;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);

  const price = parseFloat(String(product.price));
  const salePrice = product.sale_price ? parseFloat(String(product.sale_price)) : null;
  const isOnSale = salePrice !== null && salePrice < price;
  const isOutOfStock = product.stock === 0;
  const image = product.images?.[0];

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, 1);
      trackAddToCart(product, 1);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group relative flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {isOnSale && <Badge variant="red">Sale</Badge>}
        {product.is_featured && <Badge variant="blue">Featured</Badge>}
        {product.is_best_seller && <Badge variant="amber">Best Seller</Badge>}
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-contain transition-transform duration-500 group-hover:scale-105',
              isOutOfStock && 'opacity-50'
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-gray-900/80 px-3 py-1 text-sm font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {product.brand.name}
          </p>
        )}

        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white leading-tight">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          <CurrencyDisplay
            amount={isOnSale ? salePrice! : price}
            className="text-base font-bold text-gray-900 dark:text-white"
          />
          {isOnSale && (
            <CurrencyDisplay
              amount={price}
              className="text-sm text-gray-400 line-through dark:text-gray-500"
            />
          )}
        </div>

        {/* Stock indicator */}
        {!isOutOfStock && product.stock <= 5 && product.stock > 0 && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Only {product.stock} left</p>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all',
            isOutOfStock
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          )}
        >
          {adding ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {isOutOfStock ? 'Out of Stock' : adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
