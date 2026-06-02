'use client';

import { useState } from 'react';
import { newsletterApi } from '@/lib/api';
import { Mail } from 'lucide-react';

interface NewsletterSignupProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function NewsletterSignup({ className = '', title, subtitle }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await newsletterApi.subscribe(email, name || undefined);
      setSuccess(true);
      setEmail('');
      setName('');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={`text-center ${className}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl mx-auto dark:bg-green-900/30">✓</div>
        <p className="mt-3 font-semibold text-gray-900 dark:text-white">You're subscribed!</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Thanks for joining. We'll keep you in the loop.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
      {subtitle && <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      <form onSubmit={handleSubmit} className="space-y-2">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>
        )}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {submitting ? '…' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  );
}
