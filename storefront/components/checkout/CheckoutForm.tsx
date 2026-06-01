'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart';
import { useAuthStore } from '@/lib/auth';
import { checkoutApi } from '@/lib/api';
import { trackBeginCheckout, trackPurchase } from '@/lib/tracking';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { OrderSummary } from '@/components/cart/OrderSummary';
import { DeliveryMethodStep } from './DeliveryMethodStep';
import { PaymentMethodStep } from './PaymentMethodStep';
import { OrderReview } from './OrderReview';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STEPS = ['Customer Info', 'Delivery', 'Payment', 'Review'];

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, discount, total, coupon, clearLocalCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [delivery, setDelivery] = useState({
    method: 'pickup', // pickup | delivery
    address: '',
    city: '',
    region: '',
  });

  const [payment, setPayment] = useState({
    method: 'cash_on_delivery',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!customerInfo.name.trim()) errs.name = 'Name is required';
    if (!customerInfo.email.trim() || !/\S+@\S+\.\S+/.test(customerInfo.email)) errs.email = 'Valid email is required';
    if (!customerInfo.phone.trim()) errs.phone = 'Phone is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    if (delivery.method === 'delivery') {
      const errs: Record<string, string> = {};
      if (!delivery.address.trim()) errs.address = 'Address is required';
      if (!delivery.city.trim()) errs.city = 'City is required';
      setErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return true;
  };

  const next = () => {
    setErrors({});
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    if (step === 2) {
      trackBeginCheckout(total, items as any[]);
    }
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const res = await checkoutApi.placeOrder({
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        delivery_method: delivery.method,
        delivery_address: delivery.method === 'delivery' ? {
          address: delivery.address,
          city: delivery.city,
          region: delivery.region,
        } : null,
        payment_method: payment.method,
      });
      const order = res.data.data;
      trackPurchase(order);
      clearLocalCart();
      localStorage.removeItem('cart_session_token');
      router.push(`/order-confirmation/${order.order_number}?email=${encodeURIComponent(customerInfo.email)}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Main */}
      <div className="lg:col-span-2 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                i < step ? 'bg-green-500 text-white' :
                i === step ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={cn('ml-2 text-xs font-medium hidden sm:block', i === step ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500')}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 mx-2 h-0.5', i < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700')} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Customer Info */}
        {step === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Customer Information</h2>
            <Input
              label="Full Name"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              error={errors.name}
              placeholder="Your full name"
            />
            <Input
              label="Email Address"
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              error={errors.phone}
              placeholder="+230 5XXX XXXX"
            />
          </div>
        )}

        {/* Step 1: Delivery */}
        {step === 1 && (
          <DeliveryMethodStep
            delivery={delivery}
            onChange={setDelivery}
            errors={errors}
          />
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <PaymentMethodStep
            selectedMethod={payment.method}
            onChange={(method) => setPayment({ method })}
          />
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <OrderReview
            customerInfo={customerInfo}
            delivery={delivery}
            payment={payment}
            items={items as any[]}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          {step > 0 && (
            <Button variant="outline" onClick={back}>
              Back
            </Button>
          )}
          <div className="ml-auto">
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <Button onClick={placeOrder} isLoading={loading} size="lg">
                Place Order
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <OrderSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          discount={discount}
          total={total}
          coupon={coupon}
        />
      </div>
    </div>
  );
}
