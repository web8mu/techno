'use client';

interface PriceRangeSliderProps {
  min: string;
  max: string;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
}

export function PriceRangeSlider({ min, max, onMinChange, onMaxChange }: PriceRangeSliderProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Price Range</h4>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Min (Rs)</label>
          <input
            type="number"
            value={min}
            onChange={(e) => onMinChange(e.target.value)}
            placeholder="0"
            min={0}
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <span className="mt-4 text-gray-400">–</span>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Max (Rs)</label>
          <input
            type="number"
            value={max}
            onChange={(e) => onMaxChange(e.target.value)}
            placeholder="999999"
            min={0}
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>
    </div>
  );
}
