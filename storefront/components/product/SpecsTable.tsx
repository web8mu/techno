'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpecsTableProps {
  specs: Record<string, Record<string, string>> | Record<string, string> | null | undefined;
}

export function SpecsTable({ specs }: SpecsTableProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['General', 'Specifications']));

  if (!specs || Object.keys(specs).length === 0) return null;

  // Detect if specs are grouped (nested objects) or flat
  const isGrouped = Object.values(specs).some((v) => typeof v === 'object' && v !== null);

  const groups: Record<string, Record<string, string>> = isGrouped
    ? (specs as Record<string, Record<string, string>>)
    : { Specifications: specs as Record<string, string> };

  const toggle = (group: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {Object.entries(groups).map(([group, attrs]) => (
        <div key={group} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggle(group)}
            className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            {group}
            <ChevronDown
              className={cn('h-4 w-4 text-gray-500 transition-transform', openGroups.has(group) && 'rotate-180')}
            />
          </button>

          {openGroups.has(group) && (
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(attrs).map(([key, value], i) => (
                  <tr
                    key={key}
                    className={cn(
                      i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'
                    )}
                  >
                    <td className="w-2/5 px-4 py-2.5 font-medium text-gray-600 dark:text-gray-400">{key}</td>
                    <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
