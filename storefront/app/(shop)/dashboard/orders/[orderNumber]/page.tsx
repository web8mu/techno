'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { ChevronRight, Download, RefreshCw, Package } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const { user, isLoading } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/dashboard/orders');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !orderNumber) return;
    dashboardApi.getOrder(orderNumber)
      .then((r) => setOrder(r.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [user, orderNumber]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const res = await dashboardApi.downloadInvoice(orderNumber);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Failed to download invoice.');
    } finally {
      setDownloading(false);
    }
  };

  const handleReorder = async () => {
    setReordering(true);
    try {
      await dashboardApi.reorder(orderNumber);
      showToast('Items added to your cart!');
    } catch {
      showToast('Could not reorder. Please try again.');
    } finally {
      setReordering(false);
    }
  };

  if (isLoading || !user) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
        <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Order not found.</p>
        <Link href="/dashboard/orders" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  const items = order.items || order.order_items || [];
  const subtotal = parseFloat(order.subtotal || 0);
  const vat = parseFloat(order.tax || order.vat || 0);
  const delivery = parseFloat(order.delivery_fee || order.shipping_cost || 0);
  const total = parseFloat(order.total || 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-xl dark:bg-gray-100 dark:text-gray-900">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <nav className="mb-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/dashboard/orders" className="hover:text-blue-600 dark:hover:text-blue-400">Orders</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-mono text-gray-900 dark:text-white">{order.order_number}</span>
          </nav>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order {order.order_number}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Placed {new Date(order.created_at).toLocaleDateString('en-MU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {order.status}
          </span>
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${reordering ? 'animate-spin' : ''}`} />
            Reorder
          </button>
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Downloading…' : 'Invoice'}
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <h3 className="border-b border-gray-200 px-5 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
          Items
        </h3>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-4 p-4">
              {item.product?.images?.[0]?.url && (
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <Image src={item.product.images[0].url} alt={item.name || item.product?.name} fill sizes="56px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.name || item.product?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.qty || item.quantity}</p>
              </div>
              <CurrencyDisplay amount={parseFloat(item.total || item.subtotal || 0)} className="font-semibold text-gray-900 dark:text-white" />
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 px-5 py-4 space-y-2 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <CurrencyDisplay amount={subtotal} />
          </div>
          {vat > 0 && (
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>VAT</span>
              <CurrencyDisplay amount={vat} />
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Delivery</span>
            {delivery === 0 ? <span className="text-green-600 dark:text-green-400">Free</span> : <CurrencyDisplay amount={delivery} />}
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-gray-700 dark:text-white">
            <span>Total</span>
            <CurrencyDisplay amount={total} />
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {order.delivery_address && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Delivery Address</h3>
          <address className="not-italic text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
            <p>{order.delivery_address.name || order.delivery_address.full_name}</p>
            <p>{order.delivery_address.address_line_1}</p>
            {order.delivery_address.address_line_2 && <p>{order.delivery_address.address_line_2}</p>}
            <p>{order.delivery_address.city}, {order.delivery_address.district}</p>
          </address>
        </div>
      )}
    </div>
  );
}
