'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { dashboardApi } from '@/lib/api';
import { MapPin, Plus, Pencil, Trash2, X } from 'lucide-react';

const DISTRICTS = [
  'Port Louis', 'Pamplemousses', 'Rivière du Rempart', 'Flacq',
  'Grand Port', 'Savanne', 'Black River', 'Plaines Wilhems', 'Moka', 'Rodrigues',
];

const emptyForm = {
  full_name: '', phone: '', address_line_1: '', address_line_2: '', city: '', district: '', is_default: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login?redirect=/dashboard/addresses');
  }, [user, isLoading, router]);

  const loadAddresses = () => {
    if (!user) return;
    dashboardApi.getAddresses()
      .then((r) => setAddresses(r.data.data || []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAddresses(); }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (addr: any) => {
    setForm({
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      address_line_1: addr.address_line_1 || '',
      address_line_2: addr.address_line_2 || '',
      city: addr.city || '',
      district: addr.district || '',
      is_default: addr.is_default || false,
    });
    setEditingId(addr.id);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await dashboardApi.updateAddress(editingId, form);
        showToast('Address updated.');
      } else {
        await dashboardApi.createAddress(form);
        showToast('Address added.');
      }
      setModalOpen(false);
      loadAddresses();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    try {
      await dashboardApi.deleteAddress(id);
      showToast('Address deleted.');
      loadAddresses();
    } catch {
      showToast('Failed to delete.');
    }
  };

  if (isLoading || !user) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3 text-sm text-white shadow-xl dark:bg-gray-100 dark:text-gray-900">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Address Book</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <MapPin className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">{addr.full_name}</p>
                  {addr.phone && <p className="text-gray-500 dark:text-gray-400">{addr.phone}</p>}
                  <p className="text-gray-600 dark:text-gray-300">{addr.address_line_1}</p>
                  {addr.address_line_2 && <p className="text-gray-600 dark:text-gray-300">{addr.address_line_2}</p>}
                  <p className="text-gray-600 dark:text-gray-300">{addr.city}, {addr.district}</p>
                  {addr.is_default && (
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(addr)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Address' : 'Add Address'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</p>}

            <div className="space-y-3">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Address Line 1', key: 'address_line_1', type: 'text' },
                { label: 'Address Line 2 (optional)', key: 'address_line_2', type: 'text' },
                { label: 'City / Village', key: 'city', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">District</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                Set as default address
              </label>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
