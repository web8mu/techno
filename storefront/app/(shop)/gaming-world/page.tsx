'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { gamingApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useCartStore } from '@/lib/cart';
import { CaseVisual } from '@/components/gaming/CaseVisual';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number | string) =>
  `Rs ${Number(n).toLocaleString('en-MU', { minimumFractionDigits: 2 })}`;

const BUDGET_TIERS = [25000, 50000, 75000, 100000, 150000, 200000];
const PERF_LABELS = ['1080p', '1440p', '4K', 'Streaming', 'Workstation'];
const SLOT_ICONS: Record<string, string> = {
  CPU: '🧠', Motherboard: '🖥', RAM: '💾', GPU: '🎮',
  Storage: '💿', PSU: '⚡', Cooler: '❄️', Case: '📦',
};

function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', event, data ?? {});
}

function getGuestToken(): string {
  if (typeof window === 'undefined') return '';
  let t = localStorage.getItem('gaming_guest_token');
  if (!t) { t = crypto.randomUUID(); localStorage.setItem('gaming_guest_token', t); }
  return t;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className ?? ''}`} />;
}

// ─── Picker Modal ────────────────────────────────────────────────────────────

interface PickerProps {
  slot: string;
  selected: Record<string, number>;
  onSelect: (id: number, name: string, price: number) => void;
  onClose: () => void;
}

function PickerModal({ slot, selected, onSelect, onClose }: PickerProps) {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    gamingApi.getComponents(slot, selected)
      .then(r => { setComponents(r.data.data ?? r.data ?? []); setLoading(false); })
      .catch(() => { setError('Failed to load components.'); setLoading(false); });
  }, [slot]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = components.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h3 className="text-lg font-bold text-white">
            {SLOT_ICONS[slot] ?? '🔧'} Select {slot}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="px-5 pt-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mt-3 max-h-96 overflow-y-auto px-5 pb-5 space-y-2">
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
          {!loading && error && <p className="text-center text-red-400 py-6">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-center text-slate-400 py-6">No components found.</p>
          )}
          {!loading && !error && filtered.map((c: any) => {
            const compatible = c.compatible !== false;
            return (
              <div
                key={c.id}
                className={`relative rounded-xl border p-3 transition-all ${
                  compatible
                    ? 'border-slate-600 bg-slate-800 hover:border-blue-500 cursor-pointer'
                    : 'border-slate-700 bg-slate-800/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  {c.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt={c.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  {!c.image && (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700 text-2xl">
                      {SLOT_ICONS[slot] ?? '🔧'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white leading-tight">{c.name}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {c.brand?.toLowerCase().includes('gamemax') && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">⭐ Recommended</span>
                        )}
                        {compatible
                          ? <span className="text-[10px] font-bold text-green-400">✓</span>
                          : <span className="text-[10px] font-bold text-red-400">✗</span>
                        }
                      </div>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-blue-400">{fmt(c.price ?? 0)}</p>
                    {!compatible && c.incompatibility_reason && (
                      <p className="mt-1 text-[10px] text-red-400">{c.incompatibility_reason}</p>
                    )}
                  </div>
                </div>
                {compatible && (
                  <button
                    onClick={() => onSelect(c.id, c.name, c.price ?? 0)}
                    className="mt-2 w-full rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    Select
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Build Request Modal ──────────────────────────────────────────────────────

interface BuildRequestModalProps {
  components: Record<string, number>;
  onClose: () => void;
}

function BuildRequestModal({ components, onClose }: BuildRequestModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await gamingApi.buildRequest({ ...form, components });
      setDone(true);
      trackEvent('submit_build_request');
    } catch {
      setError('Failed to send request. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
          <h3 className="text-lg font-bold text-white">Send Build Request</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>
        {done ? (
          <div className="px-5 py-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-semibold">Request sent!</p>
            <p className="mt-1 text-sm text-slate-400">We will contact you shortly.</p>
            <button onClick={onClose} className="mt-5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">Done</button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {(['name', 'email', 'phone'] as const).map(f => (
              <input
                key={f}
                type={f === 'email' ? 'email' : 'text'}
                placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                value={form[f]}
                onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            ))}
            <textarea
              placeholder="Message (optional)"
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              onClick={submit}
              disabled={loading || !form.name || !form.email}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Performance Meter ────────────────────────────────────────────────────────

function PerfMeter({ score }: { score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        {PERF_LABELS.map(l => <span key={l}>{l}</span>)}
      </div>
      <div className="relative h-3 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>0</span>
        <span className="font-semibold text-blue-400">{score}/100</span>
        <span>100</span>
      </div>
    </div>
  );
}

// ─── Main inner component (uses useSearchParams) ──────────────────────────────

const SLOTS = ['CPU', 'Motherboard', 'RAM', 'GPU', 'Storage', 'PSU', 'Cooler', 'Case'];

function GamingWorldInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();

  // Phase: 'budget' | 'recommend' | 'builder' | 'final'
  const [phase, setPhase] = useState<'budget' | 'recommend' | 'builder' | 'final'>('budget');

  const [budgetIndex, setBudgetIndex] = useState(1); // default 50k
  const [manualBudget, setManualBudget] = useState('');
  const budget = manualBudget ? Number(manualBudget) : BUDGET_TIERS[budgetIndex];

  // Recommended build state
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState('');
  const [recBuild, setRecBuild] = useState<any>(null);

  // Builder state
  const [selectedComponents, setSelectedComponents] = useState<Record<string, number>>({});
  const [selectedMeta, setSelectedMeta] = useState<Record<string, { name: string; price: number }>>({});
  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  // Final / saving
  const [saveLoading, setSaveLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [showBuildRequest, setShowBuildRequest] = useState(false);
  const [buildName, setBuildName] = useState('My Gaming Build');

  // Load from share token
  useEffect(() => {
    const buildToken = searchParams.get('build');
    if (!buildToken) return;
    gamingApi.loadBuild(buildToken).then(r => {
      const b = r.data.data ?? r.data;
      if (!b) return;
      if (b.name) setBuildName(b.name);
      const components: Record<string, number> = b.components ?? {};
      const meta: Record<string, { name: string; price: number }> = {};
      if (b.slots) {
        for (const slot of b.slots) {
          if (slot.component_id && slot.slot_name) {
            components[slot.slot_name] = slot.component_id;
            meta[slot.slot_name] = { name: slot.component_name ?? '', price: slot.price ?? 0 };
          }
        }
      }
      setSelectedComponents(components);
      setSelectedMeta(meta);
      setPhase('builder');
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getRecommend = async () => {
    setRecLoading(true); setRecError(''); setPhase('recommend');
    trackEvent('start_build', { budget });
    try {
      const r = await gamingApi.recommend(budget);
      setRecBuild(r.data.data ?? r.data);
    } catch {
      setRecError('Failed to get recommendations. Please try again.');
    } finally { setRecLoading(false); }
  };

  const applyRecommend = () => {
    if (!recBuild) return;
    const components: Record<string, number> = {};
    const meta: Record<string, { name: string; price: number }> = {};
    const slots: any[] = recBuild.slots ?? recBuild.components ?? [];
    for (const s of slots) {
      const slotName = s.slot_name ?? s.slot ?? '';
      if (slotName && s.component_id) {
        components[slotName] = s.component_id;
        meta[slotName] = { name: s.component_name ?? s.name ?? '', price: s.price ?? 0 };
      }
    }
    setSelectedComponents(components);
    setSelectedMeta(meta);
    setValidation(null);
    setPhase('builder');
  };

  const runValidate = useCallback(async (comps: Record<string, number>) => {
    if (Object.keys(comps).length === 0) return;
    setValidating(true);
    try {
      const r = await gamingApi.validate(comps);
      setValidation(r.data.data ?? r.data);
    } catch { /* silent */ }
    finally { setValidating(false); }
  }, []);

  const handleSelect = (slot: string, id: number, name: string, price: number) => {
    const newComps = { ...selectedComponents, [slot]: id };
    const newMeta = { ...selectedMeta, [slot]: { name, price } };
    setSelectedComponents(newComps);
    setSelectedMeta(newMeta);
    setPickerSlot(null);
    runValidate(newComps);
  };

  const allFilled = SLOTS.every(s => selectedComponents[s]);
  const noErrors = !validation?.errors?.length;
  const buildComplete = allFilled && noErrors;

  const totalPrice = Object.values(selectedMeta).reduce((s, m) => s + (m?.price ?? 0), 0);
  const remaining = budget - totalPrice;
  const perfScore = validation?.performance_score ?? recBuild?.performance_score ?? 0;

  const saveBuild = async () => {
    setSaveLoading(true);
    try {
      const payload: { name: string; components: Record<string, number>; guest_token?: string } = {
        name: buildName,
        components: selectedComponents,
      };
      if (!user) payload.guest_token = getGuestToken();
      const r = await gamingApi.saveB(payload);
      const token = (r.data.data ?? r.data)?.share_token ?? (r.data.data ?? r.data)?.shareToken;
      if (token) setShareLink(`${window.location.origin}/gaming-world?build=${token}`);
    } catch { /* silent */ }
    finally { setSaveLoading(false); }
  };

  const addToCart = async () => {
    setCartLoading(true);
    try {
      await gamingApi.addToCart(selectedComponents, user ? undefined : getGuestToken());
      await fetchCart();
      trackEvent('add_build_to_cart', { total: totalPrice });
      router.push('/cart');
    } catch { /* silent */ }
    finally { setCartLoading(false); }
  };

  // ── Phase A: Budget ──────────────────────────────────────────────────────

  if (phase === 'budget') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-5xl">🎮</div>
        <h1 className="text-5xl font-extrabold leading-tight text-white sm:text-6xl">
          Build Your{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dream Gaming PC
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-xl">
          Set your budget and let our AI recommend the perfect build — then customise it to your heart's content.
        </p>

        <div className="mt-12 w-full max-w-xl space-y-6">
          {/* Tier labels */}
          <div className="flex justify-between text-xs text-slate-400 px-1">
            {BUDGET_TIERS.map(t => (
              <span key={t} className="text-center" style={{ width: `${100 / BUDGET_TIERS.length}%` }}>
                {(t / 1000).toFixed(0)}k
              </span>
            ))}
          </div>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={BUDGET_TIERS.length - 1}
            step={1}
            value={budgetIndex}
            onChange={e => { setBudgetIndex(Number(e.target.value)); setManualBudget(''); }}
            className="w-full accent-blue-500 cursor-pointer"
          />

          {/* Manual input */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 whitespace-nowrap">Or enter amount:</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Rs</span>
              <input
                type="number"
                value={manualBudget}
                onChange={e => setManualBudget(e.target.value)}
                placeholder={String(BUDGET_TIERS[budgetIndex])}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Selected budget display */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 py-4 px-6">
            <p className="text-sm text-slate-400">Selected Budget</p>
            <p className="mt-1 text-3xl font-extrabold text-white">{fmt(budget)}</p>
          </div>

          {/* CTA */}
          <button
            onClick={getRecommend}
            className="relative w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-purple-500 transition-all duration-200 animate-pulse hover:animate-none"
          >
            Get Recommended Build →
          </button>
        </div>
      </div>
    );
  }

  // ── Phase B: Recommend ───────────────────────────────────────────────────

  if (phase === 'recommend') {
    const slots: any[] = recBuild?.slots ?? recBuild?.components ?? [];
    const recTotal = slots.reduce((s: number, c: any) => s + (c.price ?? 0), 0);
    const recRemaining = budget - recTotal;

    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <button onClick={() => setPhase('budget')} className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          ← Back to Budget
        </button>

        {recLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
            {SLOTS.map(s => <Skeleton key={s} className="h-14 w-full" />)}
          </div>
        )}

        {!recLoading && recError && (
          <div className="rounded-2xl border border-red-700 bg-red-900/20 p-6 text-center">
            <p className="text-red-400">{recError}</p>
            <button onClick={getRecommend} className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-sm font-semibold text-white">Retry</button>
          </div>
        )}

        {!recLoading && !recError && recBuild && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white">{recBuild.name ?? 'Recommended Build'}</h2>
              <span className="rounded-full bg-blue-600/20 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300">
                Budget: {fmt(budget)}
              </span>
            </div>

            {/* Slots table */}
            <div className="overflow-hidden rounded-2xl border border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Slot</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Component</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-300 font-medium whitespace-nowrap">
                        {SLOT_ICONS[c.slot_name ?? c.slot] ?? '🔧'} {c.slot_name ?? c.slot}
                      </td>
                      <td className="px-4 py-3 text-white">{c.component_name ?? c.name ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-blue-400 font-semibold">{fmt(c.price ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-xs text-slate-400">Total Price</p>
                <p className="mt-1 text-xl font-extrabold text-white">{fmt(recTotal)}</p>
              </div>
              <div className={`rounded-2xl border p-4 ${recRemaining >= 0 ? 'border-green-700 bg-green-900/20' : 'border-red-700 bg-red-900/20'}`}>
                <p className="text-xs text-slate-400">Remaining Budget</p>
                <p className={`mt-1 text-xl font-extrabold ${recRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {recRemaining >= 0 ? '+' : ''}{fmt(recRemaining)}
                </p>
              </div>
            </div>

            {/* Performance meter */}
            {perfScore > 0 && (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-300">Performance Score</p>
                <PerfMeter score={perfScore} />
              </div>
            )}

            <button
              onClick={applyRecommend}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-base font-bold text-white shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all"
            >
              Customise Build →
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Phase C: Builder ─────────────────────────────────────────────────────

  if (phase === 'builder') {
    const selectedForVisual: Record<string, boolean> = {};
    for (const s of SLOTS) selectedForVisual[s] = !!selectedComponents[s];

    return (
      <>
        {pickerSlot && (
          <PickerModal
            slot={pickerSlot}
            selected={selectedComponents}
            onSelect={(id, name, price) => handleSelect(pickerSlot, id, name, price)}
            onClose={() => setPickerSlot(null)}
          />
        )}

        <div className="flex min-h-screen flex-col lg:flex-row">
          {/* Left: slots panel */}
          <div className="flex-1 px-4 py-8 lg:px-8 lg:py-10">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setPhase('budget')} className="text-sm text-slate-400 hover:text-white">← Budget</button>
              <span className="text-slate-600">|</span>
              <h2 className="text-xl font-extrabold text-white">Interactive Builder</h2>
            </div>

            {/* Summary card */}
            <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <p className="text-xs text-slate-400">Total Price</p>
                  <p className="text-2xl font-extrabold text-white">{fmt(totalPrice)}</p>
                </div>
                {budget > 0 && (
                  <div>
                    <p className="text-xs text-slate-400">Remaining</p>
                    <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-400' : remaining > -10000 ? 'text-amber-400' : 'text-red-400'}`}>
                      {remaining >= 0 ? '+' : ''}{fmt(remaining)}
                    </p>
                  </div>
                )}
                {validating && <span className="text-xs text-slate-400 animate-pulse ml-auto">Validating…</span>}
              </div>
              {perfScore > 0 && (
                <div className="mt-4">
                  <PerfMeter score={perfScore} />
                </div>
              )}
            </div>

            {/* Compatibility errors */}
            {validation?.errors?.length > 0 && (
              <div className="mb-4 rounded-xl border border-red-700 bg-red-900/20 p-3 space-y-1">
                {validation.errors.map((e: string, i: number) => (
                  <p key={i} className="text-xs text-red-400">⚠ {e}</p>
                ))}
              </div>
            )}
            {validation?.warnings?.length > 0 && (
              <div className="mb-4 rounded-xl border border-amber-700 bg-amber-900/20 p-3 space-y-1">
                {validation.warnings.map((w: string, i: number) => (
                  <p key={i} className="text-xs text-amber-400">ℹ {w}</p>
                ))}
              </div>
            )}

            {/* Slot rows */}
            <div className="space-y-2">
              {SLOTS.map(slot => {
                const meta = selectedMeta[slot];
                return (
                  <div
                    key={slot}
                    className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 hover:border-slate-600 transition-colors"
                  >
                    <span className="text-2xl w-8 text-center flex-shrink-0">{SLOT_ICONS[slot]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{slot}</p>
                      {meta ? (
                        <p className="text-sm text-white font-medium truncate">{meta.name} <span className="text-blue-400 font-normal">— {fmt(meta.price)}</span></p>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Not selected</p>
                      )}
                    </div>
                    <button
                      onClick={() => setPickerSlot(slot)}
                      className="flex-shrink-0 rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:border-blue-500 hover:bg-slate-600 transition-colors"
                    >
                      {meta ? 'Change' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Proceed to final */}
            {buildComplete && (
              <button
                onClick={() => setPhase('final')}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 py-3.5 text-base font-bold text-white shadow-lg hover:from-green-500 hover:to-emerald-400 transition-all animate-pulse hover:animate-none"
              >
                ✅ Build Complete — Proceed to Final →
              </button>
            )}
          </div>

          {/* Right: case visual */}
          <div className="flex-shrink-0 flex items-start justify-center px-4 py-8 lg:w-72 lg:py-10 lg:px-6">
            <div className="sticky top-24">
              <p className="mb-4 text-center text-sm font-semibold text-slate-400">Your Build</p>
              <CaseVisual slots={SLOTS} selected={selectedForVisual} complete={buildComplete} />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Phase D: Final ───────────────────────────────────────────────────────

  const vat = totalPrice * 0.15 / 1.15;
  const net = totalPrice - vat;

  return (
    <>
      {showBuildRequest && (
        <BuildRequestModal components={selectedComponents} onClose={() => setShowBuildRequest(false)} />
      )}
      <div className="mx-auto max-w-3xl px-4 py-12 print:text-black print:bg-white">
        <button onClick={() => setPhase('builder')} className="mb-6 text-sm text-slate-400 hover:text-white print:hidden">
          ← Back to Builder
        </button>

        <h2 className="mb-2 text-3xl font-extrabold text-white">🏆 Your Final Build</h2>

        {/* Build name input */}
        <div className="mt-4 mb-6 flex items-center gap-3 print:hidden">
          <input
            type="text"
            value={buildName}
            onChange={e => setBuildName(e.target.value)}
            placeholder="Name your build..."
            className="flex-1 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Parts list */}
        <div className="overflow-hidden rounded-2xl border border-slate-700 print:border-gray-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80 print:bg-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-gray-600">Slot</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-gray-600">Component</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-gray-600">Price</th>
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(slot => {
                const meta = selectedMeta[slot];
                return (
                  <tr key={slot} className="border-b border-slate-800 last:border-0 print:border-gray-200">
                    <td className="px-4 py-3 text-slate-300 font-medium print:text-gray-700">
                      {SLOT_ICONS[slot]} {slot}
                    </td>
                    <td className="px-4 py-3 text-white print:text-gray-900">{meta?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-blue-400 font-semibold print:text-gray-900">{fmt(meta?.price ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* VAT breakdown */}
        <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-4 space-y-2 print:border-gray-300 print:bg-gray-50">
          <div className="flex justify-between text-sm text-slate-400 print:text-gray-600">
            <span>Net (excl. VAT)</span>
            <span>{fmt(net)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400 print:text-gray-600">
            <span>VAT (15%)</span>
            <span>{fmt(vat)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-white border-t border-slate-700 pt-2 print:text-gray-900 print:border-gray-300">
            <span>Total</span>
            <span>{fmt(totalPrice)}</span>
          </div>
        </div>

        {/* Performance */}
        {perfScore > 0 && (
          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-4 print:border-gray-300">
            <p className="mb-3 text-sm font-semibold text-slate-300 print:text-gray-700">Performance Summary</p>
            <PerfMeter score={perfScore} />
            <p className="mt-2 text-xs text-slate-400 print:text-gray-600">
              Optimised for: {PERF_LABELS.filter((_, i) => i < Math.ceil((perfScore / 100) * PERF_LABELS.length)).join(', ')}
            </p>
          </div>
        )}

        {/* Share link */}
        {shareLink && (
          <div className="mt-4 rounded-xl border border-green-700 bg-green-900/20 p-3">
            <p className="text-xs text-green-400 mb-1">Share your build:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareLink}
                className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-1.5 text-xs text-white"
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareLink)}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3 print:hidden">
          <button
            onClick={saveBuild}
            disabled={saveLoading}
            className="rounded-2xl border border-blue-600 bg-blue-600/20 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-600/40 disabled:opacity-50 transition-colors"
          >
            {saveLoading ? 'Saving…' : '💾 Save Build'}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-2xl border border-slate-600 bg-slate-700/50 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            🖨 Print
          </button>
          <button
            onClick={() => setShowBuildRequest(true)}
            className="rounded-2xl border border-purple-600 bg-purple-600/20 py-3 text-sm font-semibold text-purple-300 hover:bg-purple-600/40 transition-colors"
          >
            📤 Send Build Request
          </button>
          <button
            onClick={addToCart}
            disabled={cartLoading}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-bold text-white hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
          >
            {cartLoading ? 'Adding…' : '🛒 Add Build to Cart'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Wrapper with dark background ────────────────────────────────────────────

export default function GamingWorldPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-slate-400 animate-pulse text-lg">Loading Gaming World…</div>
        </div>
      }>
        <GamingWorldInner />
      </Suspense>
    </div>
  );
}
