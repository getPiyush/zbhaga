export function formatMoney(minorUnits: number): string {
  const major = Math.abs(minorUnits) / 100;
  const formatted = major.toFixed(2);
  return minorUnits < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function parseMoneyInput(input: string): number | null {
  const trimmed = input.trim().replace(/[$,]/g, '');
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}
