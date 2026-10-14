/**
 * Turning "who was in on this" into "who owes exactly how much".
 *
 * Every function here is total-preserving: the owed amounts it returns always
 * sum back to the expense total, to the last minor unit. Remainders that do not
 * divide evenly are handed out by the largest-remainder method, so the result
 * is both fair and deterministic for a given input order.
 */

export type SplitMode = 'equal' | 'exact' | 'percent';

/** Percentages are carried as basis points so they stay integers. 100% = 10000bp. */
export const PERCENT_SCALE = 10_000;

export interface EqualSplitInput {
  mode: 'equal';
  participants: Array<{ userId: string }>;
}

export interface ExactSplitInput {
  mode: 'exact';
  participants: Array<{ userId: string; amountMinor: number }>;
}

export interface PercentSplitInput {
  mode: 'percent';
  participants: Array<{ userId: string; percentBp: number }>;
}

export type SplitInput = EqualSplitInput | ExactSplitInput | PercentSplitInput;

export interface ResolvedShare {
  userId: string;
  owedMinor: number;
}

export class SplitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SplitError';
  }
}

/**
 * Distribute `total` across integer `weights` without losing a single minor
 * unit. Each party gets `floor(total * w / sum(w))`; the leftover units go to
 * the parties with the largest discarded fraction, ties broken by position so
 * the same input always produces the same output.
 */
export function distributeByWeight(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) throw new SplitError('Split weights must add up to more than zero');

  const base: number[] = [];
  const remainders: Array<{ index: number; remainder: number }> = [];
  let allocated = 0;

  for (let i = 0; i < weights.length; i += 1) {
    const exact = total * (weights[i] ?? 0);
    const share = Math.floor(exact / sum);
    base.push(share);
    allocated += share;
    remainders.push({ index: i, remainder: exact - share * sum });
  }

  let leftover = total - allocated;
  remainders.sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  // `leftover` is always smaller than the number of participants.
  for (let i = 0; leftover > 0 && i < remainders.length; i += 1) {
    const slot = remainders[i];
    if (!slot) break;
    base[slot.index] = (base[slot.index] ?? 0) + 1;
    leftover -= 1;
  }

  return base;
}

/** Work out what each participant owes for an expense of `totalMinor`. */
export function resolveSplit(totalMinor: number, input: SplitInput): ResolvedShare[] {
  if (!Number.isSafeInteger(totalMinor) || totalMinor <= 0) {
    throw new SplitError('An expense total must be a positive whole number of minor units');
  }
  if (input.participants.length === 0) {
    throw new SplitError('An expense needs at least one participant');
  }
  assertNoDuplicates(input.participants.map((p) => p.userId));

  switch (input.mode) {
    case 'equal': {
      const shares = distributeByWeight(totalMinor, input.participants.map(() => 1));
      return input.participants.map((p, i) => ({ userId: p.userId, owedMinor: shares[i] ?? 0 }));
    }

    case 'exact': {
      let sum = 0;
      for (const p of input.participants) {
        if (!Number.isSafeInteger(p.amountMinor) || p.amountMinor < 0) {
          throw new SplitError(`Exact share for ${p.userId} must be zero or a positive whole amount`);
        }
        sum += p.amountMinor;
      }
      if (sum !== totalMinor) {
        throw new SplitError(
          `Exact shares add up to ${sum} but the expense total is ${totalMinor}`,
        );
      }
      return input.participants.map((p) => ({ userId: p.userId, owedMinor: p.amountMinor }));
    }

    case 'percent': {
      let sum = 0;
      for (const p of input.participants) {
        if (!Number.isSafeInteger(p.percentBp) || p.percentBp < 0) {
          throw new SplitError(`Percentage for ${p.userId} must be zero or positive`);
        }
        sum += p.percentBp;
      }
      if (sum !== PERCENT_SCALE) {
        throw new SplitError(
          `Percentages add up to ${sum / 100}% but they must add up to exactly 100%`,
        );
      }
      const shares = distributeByWeight(
        totalMinor,
        input.participants.map((p) => p.percentBp),
      );
      return input.participants.map((p, i) => ({ userId: p.userId, owedMinor: shares[i] ?? 0 }));
    }

    default: {
      const exhaustive: never = input;
      throw new SplitError(`Unknown split mode: ${JSON.stringify(exhaustive)}`);
    }
  }
}

/**
 * The payer side of an expense. zBhaga allows more than one person to have put
 * money down, which keeps "Priya covered the cab, I covered the tickets" a
 * single expense rather than two.
 */
export interface PayerInput {
  userId: string;
  paidMinor: number;
}

export interface ExpenseLine {
  userId: string;
  paidMinor: number;
  owedMinor: number;
}

/**
 * Fold payers and owers into one row per person. This is the shape the ledger
 * is built from, and the shape the API stores.
 */
export function buildExpenseLines(
  totalMinor: number,
  payers: PayerInput[],
  split: SplitInput,
): ExpenseLine[] {
  if (payers.length === 0) throw new SplitError('An expense needs at least one payer');
  assertNoDuplicates(payers.map((p) => p.userId));

  let paidSum = 0;
  for (const p of payers) {
    if (!Number.isSafeInteger(p.paidMinor) || p.paidMinor <= 0) {
      throw new SplitError(`Amount paid by ${p.userId} must be a positive whole amount`);
    }
    paidSum += p.paidMinor;
  }
  if (paidSum !== totalMinor) {
    throw new SplitError(
      `Payers put in ${paidSum} but the expense total is ${totalMinor}`,
    );
  }

  const owed = resolveSplit(totalMinor, split);
  const byUser = new Map<string, ExpenseLine>();

  for (const p of payers) {
    byUser.set(p.userId, { userId: p.userId, paidMinor: p.paidMinor, owedMinor: 0 });
  }
  for (const share of owed) {
    const existing = byUser.get(share.userId);
    if (existing) existing.owedMinor = share.owedMinor;
    else byUser.set(share.userId, { userId: share.userId, paidMinor: 0, owedMinor: share.owedMinor });
  }

  return [...byUser.values()];
}

function assertNoDuplicates(userIds: string[]): void {
  const seen = new Set<string>();
  for (const id of userIds) {
    if (seen.has(id)) throw new SplitError(`${id} appears twice in the same expense`);
    seen.add(id);
  }
}
