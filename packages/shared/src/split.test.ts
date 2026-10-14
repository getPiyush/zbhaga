import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveSplit, distributeByWeight, buildExpenseLines, SplitError, PERCENT_SCALE } from './split.ts';
import { toMinor, fromMinor, formatMoney } from './money.ts';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

test('money parses and re-renders without drift', () => {
  assert.equal(toMinor('12.34'), 1234);
  assert.equal(toMinor('0.05'), 5);
  assert.equal(toMinor('1000'), 100000);
  assert.equal(toMinor('12.345'), 1235, 'rounds half-up');
  assert.equal(fromMinor(1234), '12.34');
  assert.equal(fromMinor(5), '0.05');
  assert.throws(() => toMinor('abc'), /valid amount/);
});

test('USD formatting uses comma grouping', () => {
  assert.equal(formatMoney(123456750), '$1,234,567.50');
  assert.equal(formatMoney(-50000), '-$500.00');
});

test('an equal split of an indivisible amount still adds up', () => {
  // 100.00 across 3 people: 33.34 / 33.33 / 33.33
  const shares = resolveSplit(10000, {
    mode: 'equal',
    participants: [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }],
  });
  assert.equal(sum(shares.map((s) => s.owedMinor)), 10000);
  assert.deepEqual(shares.map((s) => s.owedMinor), [3334, 3333, 3333]);
});

test('equal splits stay total-preserving for every size and remainder', () => {
  for (let people = 1; people <= 25; people += 1) {
    for (const total of [1, 7, 99, 100, 10000, 999999, 1234567]) {
      const participants = Array.from({ length: people }, (_, i) => ({ userId: `u${i}` }));
      const shares = resolveSplit(total, { mode: 'equal', participants });
      assert.equal(sum(shares.map((s) => s.owedMinor)), total, `${people} people / ${total}`);
      const spread = Math.max(...shares.map((s) => s.owedMinor)) - Math.min(...shares.map((s) => s.owedMinor));
      assert.ok(spread <= 1, 'nobody is off by more than one minor unit');
    }
  }
});

test('percentage splits are exact and reject totals that are not 100%', () => {
  const shares = resolveSplit(10000, {
    mode: 'percent',
    participants: [
      { userId: 'a', percentBp: 5000 },
      { userId: 'b', percentBp: 3333 },
      { userId: 'c', percentBp: 1667 },
    ],
  });
  assert.equal(sum(shares.map((s) => s.owedMinor)), 10000);
  assert.equal(shares[0]?.owedMinor, 5000);

  assert.throws(
    () =>
      resolveSplit(10000, {
        mode: 'percent',
        participants: [
          { userId: 'a', percentBp: 5000 },
          { userId: 'b', percentBp: 4000 },
        ],
      }),
    /add up to exactly 100%/,
  );
});

test('percent split of an awkward total loses nothing', () => {
  const shares = resolveSplit(10003, {
    mode: 'percent',
    participants: [
      { userId: 'a', percentBp: 3333 },
      { userId: 'b', percentBp: 3333 },
      { userId: 'c', percentBp: 3334 },
    ],
  });
  assert.equal(sum(shares.map((s) => s.owedMinor)), 10003);
});

test('exact splits must reconcile with the expense total', () => {
  const ok = resolveSplit(5000, {
    mode: 'exact',
    participants: [
      { userId: 'a', amountMinor: 2000 },
      { userId: 'b', amountMinor: 3000 },
    ],
  });
  assert.equal(sum(ok.map((s) => s.owedMinor)), 5000);

  assert.throws(
    () =>
      resolveSplit(5000, {
        mode: 'exact',
        participants: [
          { userId: 'a', amountMinor: 2000 },
          { userId: 'b', amountMinor: 2500 },
        ],
      }),
    /add up to 4500/,
  );
});

test('a participant cannot be listed twice', () => {
  assert.throws(
    () => resolveSplit(100, { mode: 'equal', participants: [{ userId: 'a' }, { userId: 'a' }] }),
    SplitError,
  );
});

test('weights distribute by proportion, largest remainder first', () => {
  assert.deepEqual(distributeByWeight(100, [1, 1, 1]), [34, 33, 33]);
  assert.deepEqual(distributeByWeight(10, [7, 3]), [7, 3]);
  assert.equal(sum(distributeByWeight(1, [1, 1, 1, 1])), 1);
});

test('expense lines merge the payer with their own share', () => {
  const lines = buildExpenseLines(
    9000,
    [{ userId: 'a', paidMinor: 9000 }],
    { mode: 'equal', participants: [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }] },
  );
  assert.equal(lines.length, 3);
  const a = lines.find((l) => l.userId === 'a');
  assert.deepEqual(a, { userId: 'a', paidMinor: 9000, owedMinor: 3000 });
  assert.equal(sum(lines.map((l) => l.paidMinor)), sum(lines.map((l) => l.owedMinor)));
});

test('more than one person can have paid for the same expense', () => {
  const lines = buildExpenseLines(
    10000,
    [
      { userId: 'a', paidMinor: 6000 },
      { userId: 'b', paidMinor: 4000 },
    ],
    { mode: 'equal', participants: [{ userId: 'a' }, { userId: 'b' }] },
  );
  assert.equal(sum(lines.map((l) => l.paidMinor)), 10000);
  assert.equal(lines.find((l) => l.userId === 'a')?.owedMinor, 5000);
});

test('payers must add up to the expense total', () => {
  assert.throws(
    () =>
      buildExpenseLines(10000, [{ userId: 'a', paidMinor: 9000 }], {
        mode: 'equal',
        participants: [{ userId: 'a' }],
      }),
    /Payers put in 9000/,
  );
});

test('percent scale is basis points', () => {
  assert.equal(PERCENT_SCALE, 10000);
});
