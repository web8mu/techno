'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';
import { Package, MapPin, User, Shield, ArrowRight, ShoppingBag } from 'lucide-react';

const quickLinks = [
  { href: '/dashboard/orders', label: 'My Orders', icon: Package, desc: 'View and track your orders' },
  { href: '/dashboard/addresses', label: 'Addresses', icon: MapPin, desc: 'Manage delivery addresses' },
  { href: '/dashboard/profile', label: 'Profile', icon: User, desc: 'Update your account info' },
  { href: '/dashboard/security', label: 'Security', icon: Shield, desc: 'Change your password' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      dashboardApi.getOrders(1)
        .then((r) => setOrders(r.data.data || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const lastOrder = orders[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your orders, addresses, and account settings here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ordersLoading ? '—' : orders.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Order Status</p>
              {ordersLoading ? (
                <p className="text-lg font-bold text-gray-400">—</p>
              ) : lastOrder ? (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[lastOrder.status] || 'bg-gray-100 text-gray-700'}`}>
                  {lastOrder.status}
                </span>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 group-hover:bg-blue-100 dark:bg-gray-800 dark:group-hover:bg-blue-900/30 transition">
              <Icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400 transition" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
