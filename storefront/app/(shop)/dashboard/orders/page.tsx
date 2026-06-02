'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Package, ChevronRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/dashboard/orders');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    dashboardApi.getOrders(page)
      .then((r) => {
        setOrders(r.data.data || []);
        setMeta(r.data.meta || null);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, page]);

  if (isLoading || !user) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Orders</h2>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {/* Desktop table */}
          <table className="hidden w-full text-sm sm:table">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Order #</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-5 py-4 font-mono font-medium text-gray-900 dark:text-white">{order.order_number}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('en-MU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    <CurrencyDisplay amount={parseFloat(order.total || 0)} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/orders/${order.order_number}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800 sm:hidden">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.order_number}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-medium text-gray-900 dark:text-white">{order.order_number}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                  <CurrencyDisplay amount={parseFloat(order.total || 0)} className="font-semibold text-gray-900 dark:text-white" />
                  <ChevronRight className="ml-auto mt-1 h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {meta.last_page}</span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
