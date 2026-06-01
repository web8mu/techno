'use client';

import { Banknote, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  icon: any;
  instructions?: string;
}

const methods: PaymentMethod[] = [
  {
    id: 'cash_on_delivery',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Banknote,
    instructions: 'Please have the exact amount ready when our delivery team arrives.',
  },
  {
    id: 'juice_mcb',
    label: 'Juice by MCB',
    description: 'Pay via Juice mobile wallet',
    icon: Smartphone,
    instructions: 'Send payment to Juice number: +230 5XXX XXXX. Include your order number in the reference.',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: Building2,
    instructions: 'Transfer to: Bank: MCB | Account: 0001234567890 | Name: Techno Tronics Ltd. Include your order number as reference.',
  },
];

interface PaymentMethodStepProps {
  selectedMethod: string;
  onChange: (method: string) => void;
}

export function PaymentMethodStep({ selectedMethod, onChange }: PaymentMethodStepProps) {
  const selected = methods.find((m) => m.id === selectedMethod);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Payment Method</h2>

      <div className="space-y-3">
        {methods.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
              selectedMethod === id
                ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
              selectedMethod === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            </div>
            <div className={cn(
              'h-4 w-4 rounded-full border-2 transition-colors flex-shrink-0',
              selectedMethod === id ? 'border-blue-600 bg-blue-600' : 'border-gray-300 dark:border-gray-600'
            )} />
          </button>
        ))}
      </div>

      {/* Instructions preview */}
      {selected?.instructions && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-900/20 dark:border-amber-800">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Payment Instructions</p>
          <p className="text-sm text-amber-700 dark:text-amber-400">{selected.instructions}</p>
        </div>
      )}
    </div>
  );
}
