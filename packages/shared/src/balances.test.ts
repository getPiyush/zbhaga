import { test } from 'node:test';
import assert from 'node:assert/strict';
import { netBalances, pairwiseDebts, simplifyDebts, positionFor } from './balances.ts';
import { buildExpenseLines } from './split.ts';

const expense = (
  total: number,
  payers: Array<[string, number]>,
  participants: string[],
) => ({
  lines: buildExpenseLines(
    total,
    payers.map(([userId, paidMinor]) => ({ userId, paidMinor })),
    { mode: 'equal' as const, participants: participants.map((userId) => ({ userId })) },
  ),
});

test('net balances always sum to zero', () => {
  const net = netBalances([
    expense(9000, [['a', 9000]], ['a', 'b', 'c']),
    expense(6000, [['b', 6000]], ['a', 'b', 'c']),
  ]);
  assert.equal([...net.values()].reduce((x, y) => x + y, 0), 0);
  assert.equal(net.get('a'), 9000 - 3000 - 2000);
  assert.equal(net.get('b'), 6000 - 3000 - 2000);
  assert.equal(net.get('c'), -5000);
});

test('one person pays for dinner and the others owe them directly', () => {
  const debts = pairwiseDebts([expense(9000, [['a', 9000]], ['a', 'b', 'c'])]);
  assert.equal(debts.length, 2);
  assert.ok(debts.every((d) => d.toUserId === 'a' && d.amountMinor === 3000));
});

test('recording a payment clears the debt it covers', () => {
  const expenses = [expense(9000, [['a', 9000]], ['a', 'b', 'c'])];
  const after = pairwiseDebts(expenses, [
    { fromUserId: 'b', toUserId: 'a', amountMinor: 3000 },
  ]);
  assert.equal(after.length, 1);
  assert.deepEqual(after[0], { fromUserId: 'c', toUserId: 'a', amountMinor: 3000 });
});

test('a partial payment leaves the remainder outstanding', () => {
  const after = pairwiseDebts(
    [expense(9000, [['a', 9000]], ['a', 'b', 'c'])],
    [{ fromUserId: 'b', toUserId: 'a', amountMinor: 1000 }],
  );
  const bToA = after.find((d) => d.fromUserId === 'b');
  assert.equal(bToA?.amountMinor, 2000);
});

test('overpaying flips the debt the other way', () => {
  const after = pairwiseDebts(
    [expense(9000, [['a', 9000]], ['a', 'b', 'c'])],
    [{ fromUserId: 'b', toUserId: 'a', amountMinor: 4000 }],
  );
  const between = after.find(
    (d) => (d.fromUserId === 'a' && d.toUserId === 'b'),
  );
  assert.equal(between?.amountMinor, 1000, 'a now owes b the excess');
});

test('debts between the same pair net out across expenses', () => {
  const debts = pairwiseDebts([
    expense(1000, [['a', 1000]], ['a', 'b']),
    expense(600, [['b', 600]], ['a', 'b']),
  ]);
  assert.equal(debts.length, 1);
  assert.deepEqual(debts[0], { fromUserId: 'b', toUserId: 'a', amountMinor: 200 });
});

test('simplifying never needs more payments than people minus one', () => {
  const expenses = [
    expense(9000, [['a', 9000]], ['a', 'b', 'c']),
    expense(6000, [['b', 6000]], ['b', 'c']),
    expense(3000, [['c', 3000]], ['a', 'c']),
  ];
  const net = netBalances(expenses);
  const simplified = simplifyDebts(net);
  assert.ok(simplified.length <= net.size - 1);

  // Applying the suggested payments must zero everyone out.
  const after = netBalances(expenses, simplified.map((t) => ({ ...t })));
  for (const [userId, value] of after) {
    assert.equal(value, 0, `${userId} is not settled`);
  }
});

test('simplification can route around the original participants', () => {
  // a paid for b; b paid for c. The shortest clearing is c -> a.
  const expenses = [
    expense(1000, [['a', 1000]], ['b']),
    expense(1000, [['b', 1000]], ['c']),
  ];
  const simplified = simplifyDebts(netBalances(expenses));
  assert.deepEqual(simplified, [{ fromUserId: 'c', toUserId: 'a', amountMinor: 1000 }]);

  // ...while the detail view keeps the real chain of who owes whom.
  const direct = pairwiseDebts(expenses);
  assert.equal(direct.length, 2);
});

test('a member position reports both directions', () => {
  const expenses = [
    expense(9000, [['a', 9000]], ['a', 'b', 'c']),
    expense(3000, [['b', 3000]], ['b', 'c']),
  ];
  const b = positionFor('b', expenses);
  assert.equal(b.totalOwesMinor, 3000, 'b owes a for dinner');
  assert.equal(b.totalOwedByMinor, 1500, 'c owes b');
  assert.equal(b.netMinor, -1500);
  assert.equal(b.owes[0]?.toUserId, 'a');
  assert.equal(b.owedBy[0]?.fromUserId, 'c');
});

test('a fully settled group reports nothing outstanding', () => {
  const expenses = [expense(1000, [['a', 1000]], ['a', 'b'])];
  const settlements = [{ fromUserId: 'b', toUserId: 'a', amountMinor: 500 }];
  assert.deepEqual(pairwiseDebts(expenses, settlements), []);
  const net = netBalances(expenses, settlements);
  assert.ok([...net.values()].every((v) => v === 0));
});

test('a large group stays consistent', () => {
  const people = Array.from({ length: 40 }, (_, i) => `u${String(i).padStart(2, '0')}`);
  const expenses = people.map((payer, i) =>
    expense(1000 + i, [[payer, 1000 + i]], people),
  );
  const net = netBalances(expenses);
  assert.equal([...net.values()].reduce((x, y) => x + y, 0), 0);
  const simplified = simplifyDebts(net);
  const after = netBalances(expenses, simplified);
  assert.ok([...after.values()].every((v) => v === 0));
});
