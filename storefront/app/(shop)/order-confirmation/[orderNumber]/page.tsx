'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Upload, Package, ArrowRight } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { trackPurchase } from '@/lib/tracking';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { computeVat } from '@/lib/utils';
import toast from 'react-hot-toast';

const paymentInstructions: Record<string, { title: string; body: string }> = {
  juice_mcb: {
    title: 'Juice by MCB',
    body: 'Send payment to Juice number: +230 5XXX XXXX. Use your order number as the reference. Upload your payment proof below.',
  },
  bank_transfer: {
    title: 'Bank Transfer',
    body: 'Transfer to: MCB | Account: 0001234567890 | Techno Tronics Ltd. Include your order number as reference. Upload your proof below.',
  },
  cash_on_delivery: {
    title: 'Cash on Delivery',
    body: 'Please have the exact cash amount ready when our delivery arrives. No further action needed.',
  },
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;
  const email = searchParams.get('email') || '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrder(orderNumber, email);
        const data = res.data.data;
        setOrder(data);
        if (!tracked.current) {
          trackPurchase(data);
          tracked.current = true;
        }
      } catch {
        // Order not found
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber, email]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await orderApi.uploadProof(orderNumber, file);
      setUploaded(true);
      toast.success('Payment proof uploaded successfully!');
    } catch {
      toast.error('Failed to upload proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Order not found.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400">
          Back to Home
        </Link>
      </div>
    );
  }

  const { net, vat } = computeVat(parseFloat(order.total));
  const paymentInfo = paymentInstructions[order.payment_method];
  const needsProof = ['juice_mcb', 'bank_transfer'].includes(order.payment_method);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order Confirmed!</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Thank you for your order. Order number:{' '}
          <strong className="font-mono text-blue-600 dark:text-blue-400">{order.order_number}</strong>
        </p>
        <p className="mt-1 text-sm text-gray-500">A confirmation email has been sent to <strong>{order.email}</strong></p>
      </div>

      {/* Payment Instructions */}
      {paymentInfo && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
          <h2 className="mb-2 font-bold text-amber-800 dark:text-amber-300">{paymentInfo.title} — Next Steps</h2>
          <p className="text-sm text-amber-700 dark:text-amber-400">{paymentInfo.body}</p>
        </div>
      )}

      {/* Proof Upload */}
      {needsProof && !uploaded && (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-3 font-semibold text-blue-800 dark:text-blue-300">Upload Payment Proof</h3>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileRef.current?.click()}
            isLoading={uploading}
            variant="outline"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Screenshot / Receipt'}
          </Button>
        </div>
      )}

      {uploaded && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            ✓ Payment proof received. We will verify and process your order shortly.
          </p>
        </div>
      )}

      {/* Order Details */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-700/30">
          <Package className="h-5 w-5 text-blue-600" />
          <h2 className="font-bold text-gray-900 dark:text-white">Order Details</h2>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {item.image && (
                  <Image src={item.image} alt={item.name_snapshot} width={56} height={56} className="object-contain" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.name_snapshot}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.qty} × <CurrencyDisplay amount={item.unit_price} /></p>
              </div>
              <CurrencyDisplay amount={item.subtotal} className="font-bold text-gray-900 dark:text-white" />
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <CurrencyDisplay amount={order.subtotal} />
          </div>
          {parseFloat(order.delivery_fee || 0) > 0 && (
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Delivery Fee</span>
              <CurrencyDisplay amount={order.delivery_fee} />
            </div>
          )}
          {parseFloat(order.discount || 0) > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount</span>
              <span>- <CurrencyDisplay amount={order.discount} /></span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold text-gray-900 dark:text-white text-base">
            <span>Total</span>
            <CurrencyDisplay amount={order.total} />
          </div>
          {/* VAT breakdown */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>Incl. VAT 15% (Rs {vat.toLocaleString('en-MU', { minimumFractionDigits: 2 })})</span>
            <span>Net: <CurrencyDisplay amount={net} /></span>
          </div>
        </div>
      </div>

      {/* Guest create account prompt */}
      {!order.user_id && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">Track Your Orders Easily</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a free account to track orders, view history, and enjoy faster checkout.</p>
          <Link href="/auth/register" className="mt-4 inline-block">
            <Button>
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* CTA */}
      <div className="mt-6 flex justify-center">
        <Link href="/shop">
          <Button variant="outline">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
