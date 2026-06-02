'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';

export default function SecurityPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login?redirect=/dashboard/security');
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await dashboardApi.changePassword(form);
      setSuccess(true);
      setForm({ current_password: '', password: '', password_confirmation: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4 dark:border-gray-700 dark:bg-gray-900">
        {success && (
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            Password changed successfully.
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {[
          { label: 'Current Password', key: 'current_password' },
          { label: 'New Password', key: 'password' },
          { label: 'Confirm New Password', key: 'password_confirmation' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
              type="password"
              required
              value={(form as any)[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
