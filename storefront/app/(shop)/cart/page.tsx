'use client';

import Link from 'next/link';
import { ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { CartItemComponent } from '@/components/cart/CartItem';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, subtotal, deliveryFee, discount, total, coupon, applyCoupon, removeCoupon, isLoading } = useCartStore();
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

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-extrabold text-gray-900 dark:text-white">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <ShoppingCart className="h-20 w-20 text-gray-300 dark:text-gray-600" />
          <div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</p>
            <p className="mt-2 text-gray-500">Add some products to get started!</p>
          </div>
          <Link href="/shop">
            <Button size="lg">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="divide-y divide-gray-100 px-6 dark:divide-gray-700">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item as any} />
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <Link href="/shop">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
                <span className="text-sm text-green-700 dark:text-green-400">
                  Coupon <strong>{coupon.code}</strong> applied
                </span>
                <button
                  onClick={async () => {
                    await removeCoupon();
                    toast.success('Coupon removed');
                  }}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
                <Button variant="outline" onClick={handleApplyCoupon} isLoading={applyingCoupon}>
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
            />

            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
