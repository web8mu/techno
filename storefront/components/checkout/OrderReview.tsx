import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import Image from 'next/image';

interface OrderReviewProps {
  customerInfo: { name: string; email: string; phone: string };
  delivery: { method: string; address: string; city: string; region: string };
  payment: { method: string };
  items: any[];
}

const deliveryLabels: Record<string, string> = {
  pickup: 'Store Pickup',
  delivery: 'Home Delivery',
};

const paymentLabels: Record<string, string> = {
  cash_on_delivery: 'Cash on Delivery',
  juice_mcb: 'Juice by MCB',
  bank_transfer: 'Bank Transfer',
};

export function OrderReview({ customerInfo, delivery, payment, items }: OrderReviewProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Review Your Order</h2>

      {/* Items */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Items</h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-contain" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.qty}</p>
              </div>
              <CurrencyDisplay amount={item.subtotal} className="text-sm font-bold text-gray-900 dark:text-white" />
            </div>
          ))}
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/30 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Customer</p>
          <p className="font-medium text-gray-900 dark:text-white">{customerInfo.name}</p>
          <p className="text-gray-600 dark:text-gray-400">{customerInfo.email}</p>
          <p className="text-gray-600 dark:text-gray-400">{customerInfo.phone}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Delivery</p>
          <p className="font-medium text-gray-900 dark:text-white">{deliveryLabels[delivery.method] || delivery.method}</p>
          {delivery.method === 'delivery' && (
            <p className="text-gray-600 dark:text-gray-400">{[delivery.address, delivery.city, delivery.region].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Payment</p>
          <p className="font-medium text-gray-900 dark:text-white">{paymentLabels[payment.method] || payment.method}</p>
        </div>
      </div>
    </div>
  );
}
