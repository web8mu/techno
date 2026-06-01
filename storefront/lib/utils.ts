import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs 0';
  const formatted = num % 1 === 0
    ? num.toLocaleString('en-MU')
    : num.toLocaleString('en-MU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Rs ${formatted}`;
}

export function computeVat(grossTotal: number, vatRate: number = 15) {
  const net = grossTotal / (1 + vatRate / 100);
  const vat = grossTotal - net;
  return { net: Math.round(net * 100) / 100, vat: Math.round(vat * 100) / 100, gross: grossTotal };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
