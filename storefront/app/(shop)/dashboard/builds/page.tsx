'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gamingApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useCartStore } from '@/lib/cart';

const fmt = (n: number | string) =>
  `Rs ${Number(n).toLocaleString('en-MU', { minimumFractionDigits: 2 })}`;

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className ?? ''}`} />;
}

export default function MyBuildsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();

  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [cartLoading, setCartLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { router.replace('/auth/login?redirect=/dashboard/builds'); return; }
    loadBuilds();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBuilds = async () => {
    setLoading(true); setError('');
    try {
      const r = await gamingApi.myBuilds();
      setBuilds(r.data.data ?? r.data ?? []);
    } catch {
      setError('Failed to load builds.');
    } finally { setLoading(false); }
  };

  const deleteBuild = async (id: number) => {
    if (!confirm('Are you sure you want to delete this build?')) return;
    setDeleting(id);
    try {
      await gamingApi.deleteBuild(id);
      setBuilds(prev => prev.filter(b => b.id !== id));
    } catch {
      alert('Failed to delete build.');
    } finally { setDeleting(null); }
  };

  const addToCart = async (build: any) => {
    setCartLoading(build.id);
    try {
      await gamingApi.addToCart(build.components ?? {});
      await fetchCart();
      router.push('/cart');
    } catch {
      alert('Failed to add to cart.');
    } finally { setCartLoading(null); }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Gaming Builds</h1>
        <Link
          href="/gaming-world"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + New Build
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={loadBuilds} className="mt-3 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700">Retry</button>
        </div>
      )}

      {!loading && !error && builds.length === 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">No builds yet</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Use the Gaming World builder to create your first custom PC build.</p>
          <Link
            href="/gaming-world"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Start Building
          </Link>
        </div>
      )}

      {!loading && !error && builds.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builds.map((build: any) => {
            const total = build.total_price ?? build.total ?? 0;
            const perfScore = build.performance_score ?? 0;
            const date = build.created_at ? new Date(build.created_at).toLocaleDateString('en-MU') : '';
            return (
              <div
                key={build.id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{build.name ?? 'Untitled Build'}</h3>
                  {perfScore > 0 && (
                    <span className="flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                      Score: {perfScore}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xl font-extrabold text-blue-600 dark:text-blue-400">{fmt(total)}</p>

                {date && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{date}</p>
                )}

                <div className="mt-auto pt-4 space-y-2">
                  <Link
                    href={`/gaming-world?build=${build.share_token ?? build.shareToken ?? ''}`}
                    className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 py-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    🔧 Load in Builder
                  </Link>
                  <button
                    onClick={() => addToCart(build)}
                    disabled={cartLoading === build.id}
                    className="w-full rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {cartLoading === build.id ? 'Adding…' : '🛒 Add to Cart'}
                  </button>
                  <button
                    onClick={() => deleteBuild(build.id)}
                    disabled={deleting === build.id}
                    className="w-full rounded-xl border border-red-200 dark:border-red-800 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                  >
                    {deleting === build.id ? 'Deleting…' : '🗑 Delete Build'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
