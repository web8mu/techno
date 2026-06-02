'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import { reviewApi } from '@/lib/api';

interface ReviewsSectionProps {
  slug: string;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-colors"
        >
          <span className={(hover || value) >= s ? 'text-amber-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );
}

export function ReviewsSection({ slug }: ReviewsSectionProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = (p = 1) => {
    setLoading(true);
    reviewApi.getReviews(slug, p)
      .then((r) => {
        setReviews(r.data.data || []);
        setMeta(r.data.meta || null);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReviews(page); }, [slug, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) { setError('Please select a rating.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await reviewApi.submitReview(slug, form);
      setSubmitted(true);
      setForm({ rating: 5, title: '', body: '' });
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-14">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h2>

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any, i: number) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <StarDisplay rating={r.rating} />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.title || ''}</span>
              </div>
              {r.body && <p className="text-sm text-gray-700 dark:text-gray-300">{r.body}</p>}
              <p className="mt-2 text-xs text-gray-400">
                {r.reviewer_name || r.user?.name || 'Verified Buyer'} ·{' '}
                {r.created_at ? new Date(r.created_at).toLocaleDateString('en-MU', { month: 'short', year: 'numeric' }) : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {meta.last_page}</span>
          <button onClick={() => setPage((p) => Math.min(meta.last_page, p+1))} disabled={page === meta.last_page} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Write a review */}
      {user && (
        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Write a Review</h3>
          {submitted ? (
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              Thank you! Your review has been submitted and is pending approval.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
                <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title (optional)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Review</label>
                <textarea
                  rows={4}
                  required
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
