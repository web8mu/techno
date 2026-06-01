'use client';

import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/cart';
import { CartItemComponent } from './CartItem';
import { OrderSummary } from './OrderSummary';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, deliveryFee, discount, total, coupon, applyCoupon, removeCoupon, isLoading } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
      toast.success('Coupon applied!');
    } catch {
      toast.error('Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Coupon removed');
    } catch {
      toast.error('Failed to remove coupon');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 sm:w-[420px]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Cart {items.length > 0 && `(${items.reduce((s, i) => s + i.qty, 0)})`}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</p>
                <p className="mt-1 text-sm text-gray-500">Add some products to get started</p>
              </div>
              <Link href="/shop" onClick={closeCart}>
                <Button>Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((item) => (
                <CartItemComponent key={item.id} item={item as any} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-5 space-y-4 dark:border-gray-700">
            {/* Coupon */}
            {coupon ? (
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
                <span className="text-sm text-green-700 dark:text-green-400">
                  Coupon <strong>{coupon.code}</strong> applied
                </span>
                <button onClick={handleRemoveCoupon} className="text-xs text-red-600 hover:underline dark:text-red-400">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyCoupon}
                  isLoading={applyingCoupon}
                >
                  Apply
                </Button>
              </div>
            )}

            <OrderSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              discount={discount}
              total={total}
              coupon={coupon}
              showVat={false}
            />

            <Link href="/checkout" onClick={closeCart} className="block">
              <Button size="lg" className="w-full">
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
