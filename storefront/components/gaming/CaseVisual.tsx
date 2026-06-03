'use client';

import React from 'react';

interface CaseVisualProps {
  slots: string[];
  selected: Record<string, boolean>;
  complete: boolean;
}

const SLOT_ICONS: Record<string, string> = {
  CPU: '🧠',
  Motherboard: '🖥',
  RAM: '💾',
  GPU: '🎮',
  Storage: '💿',
  PSU: '⚡',
  Cooler: '❄️',
  Case: '📦',
};

export function CaseVisual({ slots, selected, complete }: CaseVisualProps) {
  return (
    <>
      <style>{`
        @keyframes rgbGlow {
          0%   { box-shadow: 0 0 20px 4px rgba(255,0,0,0.5), inset 0 0 20px rgba(255,0,0,0.1); border-color: rgba(255,0,0,0.7); }
          16%  { box-shadow: 0 0 20px 4px rgba(255,165,0,0.5), inset 0 0 20px rgba(255,165,0,0.1); border-color: rgba(255,165,0,0.7); }
          33%  { box-shadow: 0 0 20px 4px rgba(0,255,0,0.5), inset 0 0 20px rgba(0,255,0,0.1); border-color: rgba(0,255,0,0.7); }
          50%  { box-shadow: 0 0 20px 4px rgba(0,255,255,0.5), inset 0 0 20px rgba(0,255,255,0.1); border-color: rgba(0,255,255,0.7); }
          66%  { box-shadow: 0 0 20px 4px rgba(0,0,255,0.5), inset 0 0 20px rgba(0,0,255,0.1); border-color: rgba(0,0,255,0.7); }
          83%  { box-shadow: 0 0 20px 4px rgba(128,0,255,0.5), inset 0 0 20px rgba(128,0,255,0.1); border-color: rgba(128,0,255,0.7); }
          100% { box-shadow: 0 0 20px 4px rgba(255,0,0,0.5), inset 0 0 20px rgba(255,0,0,0.1); border-color: rgba(255,0,0,0.7); }
        }
        .rgb-glow {
          animation: rgbGlow 3s linear infinite;
        }
        @keyframes slotPulse {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(96,165,250,0.4); }
          50% { box-shadow: 0 0 12px 4px rgba(96,165,250,0.7); }
        }
        .slot-glow {
          animation: slotPulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="flex flex-col items-center gap-3">
        {/* Tower case outline */}
        <div
          className={`relative w-52 rounded-2xl border-2 bg-slate-900/80 p-4 transition-all duration-500 ${
            complete
              ? 'rgb-glow border-transparent'
              : 'border-slate-600'
          }`}
          style={{ minHeight: '420px' }}
        >
          {/* Case top strip */}
          <div className="mb-3 flex items-center justify-between">
            <div className="h-2 w-8 rounded-full bg-slate-600" />
            <div className={`h-2 w-2 rounded-full ${complete ? 'bg-green-400' : 'bg-slate-600'}`} />
          </div>

          {/* Slot grid — 2 columns */}
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const isFilled = selected[slot];
              return (
                <div
                  key={slot}
                  className={`flex flex-col items-center justify-center rounded-xl border p-2 transition-all duration-300 ${
                    isFilled
                      ? 'slot-glow border-blue-400 bg-blue-900/40'
                      : 'border-dashed border-slate-600 bg-slate-800/50'
                  }`}
                  style={{ minHeight: '70px' }}
                >
                  <span className="text-xl">{SLOT_ICONS[slot] ?? '🔧'}</span>
                  <span
                    className={`mt-1 text-center text-[9px] font-semibold leading-tight ${
                      isFilled ? 'text-blue-300' : 'text-slate-500'
                    }`}
                  >
                    {slot}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Case bottom strip */}
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-slate-700" />
            <div className="h-3 w-3 rounded bg-slate-700" />
          </div>
        </div>

        {/* Complete banner */}
        {complete && (
          <div className="animate-pulse rounded-full bg-gradient-to-r from-green-500 to-emerald-400 px-5 py-1.5 text-xs font-bold text-white shadow-lg shadow-green-500/30">
            ✅ Build Complete!
          </div>
        )}
      </div>
    </>
  );
}
