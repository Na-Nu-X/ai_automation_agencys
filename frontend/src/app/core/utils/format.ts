const numberFormatter = new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const formatNumber = (value: number | string): string => numberFormatter.format(Number(value));
export const formatDecimal = (value: number | string): string => decimalFormatter.format(Number(value));
export const formatEur = (value: number | string): string => currencyFormatter.format(Number(value));

/** Slovak plural forms: 1 → one, 2–4 → few, otherwise many. */
export function pluralSk(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return few;
  return many;
}
