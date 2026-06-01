import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { computeVat } from '@/lib/utils';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon?: any;
  showVat?: boolean;
}

export function OrderSummary({ subtotal, deliveryFee, discount, total, coupon, showVat = true }: OrderSummaryProps) {
  const { net, vat } = computeVat(total);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-3 dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="font-semibold text-gray-900 dark:text-white">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <CurrencyDisplay amount={subtotal} />
        </div>

        {deliveryFee > 0 && (
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Delivery Fee</span>
            <CurrencyDisplay amount={deliveryFee} />
          </div>
        )}

        {deliveryFee === 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Delivery Fee</span>
            <span>Free</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount {coupon && `(${coupon.code})`}</span>
            <span>- <CurrencyDisplay amount={discount} /></span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
          <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base">
            <span>Total</span>
            <CurrencyDisplay amount={total} />
          </div>
        </div>

        {showVat && total > 0 && (
          <div className="space-y-1 border-t border-gray-200 pt-2 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Subtotal (excl. VAT)</span>
              <CurrencyDisplay amount={net} />
            </div>
            <div className="flex justify-between">
              <span>VAT (15%)</span>
              <CurrencyDisplay amount={vat} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
