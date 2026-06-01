import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your purchase at Techno Tronics.',
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-extrabold text-gray-900 dark:text-white">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
