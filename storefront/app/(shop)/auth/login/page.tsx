'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <LogIn className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign in</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline dark:text-blue-400">
              Register
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Input
            label="Email Address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
