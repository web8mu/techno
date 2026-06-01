'use client';

import { MapPin, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/common/Input';

interface DeliveryState {
  method: string;
  address: string;
  city: string;
  region: string;
}

interface DeliveryMethodStepProps {
  delivery: DeliveryState;
  onChange: (d: DeliveryState) => void;
  errors: Record<string, string>;
}

export function DeliveryMethodStep({ delivery, onChange, errors }: DeliveryMethodStepProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Method</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Pickup */}
        <button
          onClick={() => onChange({ ...delivery, method: 'pickup' })}
          className={cn(
            'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
            delivery.method === 'pickup'
              ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
          )}
        >
          <Store className={cn('mt-0.5 h-5 w-5', delivery.method === 'pickup' ? 'text-blue-600' : 'text-gray-400')} />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Store Pickup</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Collect from our store — Free</p>
          </div>
        </button>

        {/* Delivery */}
        <button
          onClick={() => onChange({ ...delivery, method: 'delivery' })}
          className={cn(
            'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
            delivery.method === 'delivery'
              ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
          )}
        >
          <MapPin className={cn('mt-0.5 h-5 w-5', delivery.method === 'delivery' ? 'text-blue-600' : 'text-gray-400')} />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Home Delivery</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Delivered to your door</p>
          </div>
        </button>
      </div>

      {delivery.method === 'delivery' && (
        <div className="space-y-3 pt-2">
          <Input
            label="Street Address"
            value={delivery.address}
            onChange={(e) => onChange({ ...delivery, address: e.target.value })}
            error={errors.address}
            placeholder="123 Royal Road"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City / Town"
              value={delivery.city}
              onChange={(e) => onChange({ ...delivery, city: e.target.value })}
              error={errors.city}
              placeholder="Port Louis"
            />
            <Input
              label="Region (optional)"
              value={delivery.region}
              onChange={(e) => onChange({ ...delivery, region: e.target.value })}
              placeholder="North"
            />
          </div>
        </div>
      )}
    </div>
  );
}
