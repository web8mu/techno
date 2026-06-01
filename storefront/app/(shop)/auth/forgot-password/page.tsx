'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Check your email</h1>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              We sent a password reset link to <strong>{email}</strong>. Check your inbox (and spam folder).
            </p>
            <Link href="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-7 w-7 text-blue-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reset Password</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <Input
                label="Email Address"
                type="email"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                error={error}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <Button type="submit" isLoading={loading} className="w-full" size="lg">
                Send Reset Link
              </Button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
