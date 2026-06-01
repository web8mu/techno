export function CurrencyDisplay({ amount, className }: { amount: number | string; className?: string }) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = isNaN(num)
    ? '0'
    : num % 1 === 0
      ? num.toLocaleString('en-MU')
      : num.toLocaleString('en-MU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return <span className={className}>Rs {formatted}</span>;
}
