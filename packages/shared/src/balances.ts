/**
 * The ledger. Two different questions get asked about a group, and they have
 * two different right answers:
 *
 *  - "Who owes whom, because of what?"  -> `pairwiseDebts`, which keeps debts
 *    between the two people who were actually involved in each expense. This is
 *    what the detail screen shows, because it is the answer people can check
 *    against their memory of the evening.
 *
 *  - "What is the least number of payments that clears this group?"
 *    -> `simplifyDebts`, which is free to route a payment through someone who
 *    was never part of the original expense.
 */

import type { ExpenseLine } from './split.ts';

export interface LedgerExpense {
  lines: ExpenseLine[];
}

/** A payment one member actually made to another to square up. */
export interface LedgerSettlement {
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
}

export interface Transfer {
  fromUserId: string;
  toUserId: string;
  amountMinor: number;
}

/**
 * Net position per person: positive means the group owes them, negative means
 * they owe the group. Always sums to zero.
 */
export function netBalances(
  expenses: LedgerExpense[],
  settlements: LedgerSettlement[] = [],
): Map<string, number> {
  const net = new Map<string, number>();
  const bump = (userId: string, delta: number) =>
    net.set(userId, (net.get(userId) ?? 0) + delta);

  for (const expense of expenses) {
    for (const line of expense.lines) {
      bump(line.userId, line.paidMinor - line.owedMinor);
    }
  }
  // Paying someone back moves you toward zero the same way paying for dinner does.
  for (const s of settlements) {
    bump(s.fromUserId, s.amountMinor);
    bump(s.toUserId, -s.amountMinor);
  }

  return net;
}

/**
 * Who owes whom, expense by expense. Within a single expense the people who
 * overpaid are matched against the people who underpaid, so the resulting debt
 * always connects two people who shared that particular bill.
 */
export function pairwiseDebts(
  expenses: LedgerExpense[],
  settlements: LedgerSettlement[] = [],
): Transfer[] {
  // Keyed by the ordered pair "a\u0000b" where a < b. A positive value means b owes a.
  const pairs = new Map<string, number>();

  const addToPair = (creditor: string, debtor: string, amount: number) => {
    if (amount === 0 || creditor === debtor) return;
    const [a, b] = creditor < debtor ? [creditor, debtor] : [debtor, creditor];
    const key = `${a}\u0000${b}`;
    const signed = creditor === a ? amount : -amount;
    pairs.set(key, (pairs.get(key) ?? 0) + signed);
  };

  for (const expense of expenses) {
    for (const t of matchWithinExpense(expense.lines)) {
      addToPair(t.toUserId, t.fromUserId, t.amountMinor);
    }
  }

  // A settlement from X to Y cancels out X's debt to Y.
  for (const s of settlements) {
    addToPair(s.fromUserId, s.toUserId, s.amountMinor);
  }

  const out: Transfer[] = [];
  for (const [key, value] of pairs) {
    if (value === 0) continue;
    const [a = '', b = ''] = key.split('\u0000');
    out.push(
      value > 0
        ? { fromUserId: b, toUserId: a, amountMinor: value }
        : { fromUserId: a, toUserId: b, amountMinor: -value },
    );
  }

  return sortTransfers(out);
}

/** Greedy matching of over- and under-payers inside one expense. */
function matchWithinExpense(lines: ExpenseLine[]): Transfer[] {
  const creditors: Array<{ userId: string; amount: number }> = [];
  const debtors: Array<{ userId: string; amount: number }> = [];

  for (const line of lines) {
    const net = line.paidMinor - line.owedMinor;
    if (net > 0) creditors.push({ userId: line.userId, amount: net });
    else if (net < 0) debtors.push({ userId: line.userId, amount: -net });
  }

  // Sorting by id keeps the output stable no matter what order the rows arrive in.
  creditors.sort((x, y) => x.userId.localeCompare(y.userId));
  debtors.sort((x, y) => x.userId.localeCompare(y.userId));

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    if (!credit || !debt) break;

    const amount = Math.min(credit.amount, debt.amount);
    transfers.push({ fromUserId: debt.userId, toUserId: credit.userId, amountMinor: amount });
    credit.amount -= amount;
    debt.amount -= amount;
    if (credit.amount === 0) ci += 1;
    if (debt.amount === 0) di += 1;
  }

  return transfers;
}

/**
 * The shortest list of payments that clears every balance. Repeatedly settles
 * the largest debtor against the largest creditor, which needs at most
 * (people - 1) payments.
 */
export function simplifyDebts(net: Map<string, number>): Transfer[] {
  const creditors = [...net.entries()]
    .filter(([, v]) => v > 0)
    .map(([userId, amount]) => ({ userId, amount }));
  const debtors = [...net.entries()]
    .filter(([, v]) => v < 0)
    .map(([userId, amount]) => ({ userId, amount: -amount }));

  const byAmountThenId = (
    x: { userId: string; amount: number },
    y: { userId: string; amount: number },
  ) => y.amount - x.amount || x.userId.localeCompare(y.userId);

  creditors.sort(byAmountThenId);
  debtors.sort(byAmountThenId);

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    if (!credit || !debt) break;

    const amount = Math.min(credit.amount, debt.amount);
    if (amount > 0) {
      transfers.push({ fromUserId: debt.userId, toUserId: credit.userId, amountMinor: amount });
    }
    credit.amount -= amount;
    debt.amount -= amount;
    if (credit.amount === 0) ci += 1;
    if (debt.amount === 0) di += 1;
  }

  return sortTransfers(transfers);
}

export interface UserPosition {
  userId: string;
  /** Net across the whole group: positive means the group owes this person. */
  netMinor: number;
  /** Everything this person still has to pay, person by person. */
  owes: Transfer[];
  /** Everything still owed to this person. */
  owedBy: Transfer[];
  totalOwesMinor: number;
  totalOwedByMinor: number;
}

/** Everything the "what do I actually owe?" screen needs for one member. */
export function positionFor(
  userId: string,
  expenses: LedgerExpense[],
  settlements: LedgerSettlement[] = [],
): UserPosition {
  const debts = pairwiseDebts(expenses, settlements);
  const owes = debts.filter((t) => t.fromUserId === userId);
  const owedBy = debts.filter((t) => t.toUserId === userId);
  const sum = (list: Transfer[]) => list.reduce((a, t) => a + t.amountMinor, 0);

  return {
    userId,
    netMinor: netBalances(expenses, settlements).get(userId) ?? 0,
    owes,
    owedBy,
    totalOwesMinor: sum(owes),
    totalOwedByMinor: sum(owedBy),
  };
}

function sortTransfers(transfers: Transfer[]): Transfer[] {
  return transfers.sort(
    (x, y) =>
      y.amountMinor - x.amountMinor ||
      x.fromUserId.localeCompare(y.fromUserId) ||
      x.toUserId.localeCompare(y.toUserId),
  );
}
