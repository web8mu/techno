import type { Metadata } from 'next';
import Link from 'next/link';
import { Gamepad2, Cpu, Monitor, Headphones, ArrowLeft, Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gaming World — Coming Soon',
  description: 'The ultimate gaming destination is coming to Techno Tronics. Gaming PCs, peripherals, accessories and more.',
};

const features = [
  { icon: Cpu, label: 'Gaming PCs & Builds' },
  { icon: Monitor, label: 'Gaming Monitors' },
  { icon: Headphones, label: 'Headsets & Peripherals' },
  { icon: Gamepad2, label: 'Controllers & Accessories' },
];

export default function GamingWorldPage() {
  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center">
      {/* Animated background */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(139,92,246,0.25) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(59,130,246,0.2) 0%, transparent 50%)',
        }}
      />
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-10 right-10 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-blue-600/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center text-white">
        {/* Icon */}
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl border border-purple-500/30 bg-purple-600/20 backdrop-blur-sm">
          <Gamepad2 className="h-12 w-12 text-purple-400" />
        </div>

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-600/10 px-5 py-2 text-sm font-semibold text-purple-300 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
          </span>
          Coming Soon
        </div>

        <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Gaming World
          </span>
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-gray-300">
          We&apos;re building the ultimate gaming destination in Mauritius. High-performance PCs, pro peripherals, and everything a gamer needs — launching soon.
        </p>

        {/* Feature grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <Icon className="h-7 w-7 text-purple-400" />
              <span className="text-xs font-medium text-gray-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Notify */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email to be notified"
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:outline-none"
            />
            <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition-colors">
              <Bell className="h-4 w-4" />
              Notify Me
            </button>
          </div>
          <p className="text-xs text-gray-500">We will let you know when Gaming World launches.</p>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
