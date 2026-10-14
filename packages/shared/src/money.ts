/**
 * All money in zBhaga is stored and computed as an integer number of cents.
 * Floating point is never used for money, so a split can always be proven to
 * add back up to the original total.
 */

export const DEFAULT_CURRENCY = 'USD';
const EXPONENT = 2; // USD uses 2 decimal places (cents)

/** `"12.34"` / `12.34` -> `1234` cents. Throws on junk input. */
export function toMinor(amount: string | number): number {
  const raw = typeof amount === 'number' ? amount.toFixed(EXPONENT) : amount.trim();
  if (!/^-?\d+(\.\d+)?$/.test(raw)) {
    throw new Error(`Not a valid amount: ${JSON.stringify(amount)}`);
  }
  const negative = raw.startsWith('-');
  const [whole = '0', fraction = ''] = raw.replace('-', '').split('.');
  // Pad/truncate the fraction to cents, rounding half-up.
  const padded = fraction.padEnd(EXPONENT + 1, '0');
  const kept = padded.slice(0, EXPONENT);
  const nextDigit = Number(padded[EXPONENT] ?? '0');
  let minor = Number(whole) * 10 ** EXPONENT + Number(kept || '0');
  if (nextDigit >= 5) minor += 1;
  if (!Number.isSafeInteger(minor)) throw new Error('Amount is too large');
  return negative ? -minor : minor;
}

/** `1234` cents -> `"12.34"`. */
export function fromMinor(minor: number): string {
  const negative = minor < 0;
  const abs = Math.abs(minor).toString().padStart(EXPONENT + 1, '0');
  const whole = abs.slice(0, abs.length - EXPONENT);
  const fraction = abs.slice(abs.length - EXPONENT);
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

/** Human-facing string, e.g. `$1,234.50`. */
export function formatMoney(minor: number): string {
  const text = fromMinor(Math.abs(minor));
  const [whole = '0', fraction] = text.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = minor < 0 ? '-' : '';
  return `${sign}$${grouped}${fraction ? `.${fraction}` : ''}`;
}
