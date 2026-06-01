'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(form);
      toast.success('Account created! Welcome to Techno Tronics!');
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (err?.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? v[0] as string : String(v);
        });
        setErrors(apiErrors);
      }
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <UserPlus className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Input
            label="Full Name"
            id="name"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
            placeholder="John Doe"
            autoComplete="name"
          />
          <Input
            label="Email Address"
            type="email"
            id="email"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            id="password"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            placeholder="Min 8 characters"
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            id="password_confirmation"
            value={form.password_confirmation}
            onChange={update('password_confirmation')}
            error={errors.password_confirmation}
            placeholder="Repeat password"
            autoComplete="new-password"
          />

          <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
