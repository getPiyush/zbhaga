/**
 * `npm run db:seed` - a small, realistic group so the app has something to show
 * on first run. Safe to run twice: it clears its own demo users first.
 */

import { inArray } from 'drizzle-orm';
import { buildExpenseLines, toMinor } from '@zbhaga/shared';
import { getDb, closeDb } from './client.ts';
import { applySchema } from './migrate.ts';
import { expenseParticipants, expenses, groupMembers, groups, payments, users } from './schema.ts';
import { hashPassword } from '../auth/password.ts';
import { generateInviteCode } from '../lib/groups.ts';

const PASSWORD = 'zbhaga-demo-2026';

const PEOPLE = [
  { email: 'asha@example.com', displayName: 'Asha' },
  { email: 'rohit@example.com', displayName: 'Rohit' },
  { email: 'meera@example.com', displayName: 'Meera' },
  { email: 'dan@example.com', displayName: 'Dan' },
];

const db = await getDb();
await applySchema(db);

const passwordHash = await hashPassword(PASSWORD);
const inserted = await db
  .insert(users)
  .values(PEOPLE.map((p) => ({ ...p, passwordHash, emailVerified: true })))
  .returning();

const byName = new Map(inserted.map((u) => [u.displayName, u.id]));
const id = (name: string): string => {
  const value = byName.get(name);
  if (!value) throw new Error(`Seed user missing: ${name}`);
  return value;
};

const [group] = await db
  .insert(groups)
  .values({
    name: 'Goa trip',
    description: 'Long weekend, four people, one very confused bill.',
    currency: 'USD',
    inviteCode: generateInviteCode(),
    createdBy: id('Asha'),
  })
  .returning();

if (!group) throw new Error('Could not create the demo group');

await db.insert(groupMembers).values(
  inserted.map((u) => ({
    groupId: group.id,
    userId: u.id,
    role: u.displayName === 'Asha' ? 'owner' : 'member',
  })),
);

interface DemoExpense {
  description: string;
  category: string;
  amount: string;
  daysAgo: number;
  payers: Array<[string, string]>;
  split:
    | { mode: 'equal'; who: string[] }
    | { mode: 'exact'; who: Array<[string, string]> }
    | { mode: 'percent'; who: Array<[string, number]> };
}

const DEMO: DemoExpense[] = [
  {
    description: 'Beach house, three nights',
    category: 'Stay',
    amount: '240.00',
    daysAgo: 6,
    payers: [['Asha', '240.00']],
    split: { mode: 'equal', who: ['Asha', 'Rohit', 'Meera', 'Dan'] },
  },
  {
    description: 'Flights',
    category: 'Travel',
    amount: '315.00',
    daysAgo: 6,
    // Two people covered the booking between them.
    payers: [['Rohit', '180.00'], ['Meera', '135.00']],
    split: { mode: 'equal', who: ['Asha', 'Rohit', 'Meera', 'Dan'] },
  },
  {
    description: 'Dinner at Gunpowder',
    category: 'Food',
    amount: '74.50',
    daysAgo: 4,
    payers: [['Meera', '74.50']],
    // Dan does not drink, so the bill was split by what each actually had.
    split: {
      mode: 'exact',
      who: [['Asha', '22.00'], ['Rohit', '24.00'], ['Meera', '16.50'], ['Dan', '12.00']],
    },
  },
  {
    description: 'Scooter rental',
    category: 'Travel',
    amount: '30.00',
    daysAgo: 3,
    payers: [['Dan', '30.00']],
    split: { mode: 'equal', who: ['Rohit', 'Meera', 'Dan'] },
  },
  {
    description: 'Groceries and breakfast',
    category: 'Food',
    amount: '43.33',
    daysAgo: 2,
    payers: [['Asha', '43.33']],
    // An awkward total on purpose: the odd cents have to land somewhere.
    split: {
      mode: 'percent',
      who: [['Asha', 3000], ['Rohit', 3000], ['Meera', 2000], ['Dan', 2000]],
    },
  },
];

for (const demo of DEMO) {
  const totalMinor = toMinor(demo.amount);
  const payers = demo.payers.map(([name, amount]) => ({
    userId: id(name),
    paidMinor: toMinor(amount),
  }));

  const split =
    demo.split.mode === 'equal'
      ? { mode: 'equal' as const, participants: demo.split.who.map((n) => ({ userId: id(n) })) }
      : demo.split.mode === 'exact'
        ? {
            mode: 'exact' as const,
            participants: demo.split.who.map(([n, a]) => ({
              userId: id(n),
              amountMinor: toMinor(a),
            })),
          }
        : {
            mode: 'percent' as const,
            participants: demo.split.who.map(([n, bp]) => ({ userId: id(n), percentBp: bp })),
          };

  const lines = buildExpenseLines(totalMinor, payers, split);

  const [row] = await db
    .insert(expenses)
    .values({
      groupId: group.id,
      description: demo.description,
      category: demo.category,
      totalMinor,
      currency: group.currency,
      splitMode: split.mode,
      spentAt: new Date(Date.now() - demo.daysAgo * 86_400_000),
      createdBy: payers[0]?.userId ?? id('Asha'),
    })
    .returning();

  if (!row) throw new Error(`Could not create demo expense: ${demo.description}`);

  await db.insert(expenseParticipants).values(
    lines.map((line) => ({
      expenseId: row.id,
      userId: line.userId,
      paidMinor: line.paidMinor,
      owedMinor: line.owedMinor,
    })),
  );
}

// One person has already settled part of what they owe.
await db.insert(payments).values({
  groupId: group.id,
  fromUserId: id('Dan'),
  toUserId: id('Asha'),
  amountMinor: toMinor('50.00'),
  currency: group.currency,
  method: 'upi',
  note: 'Part payment for the house',
  paidAt: new Date(Date.now() - 86_400_000),
  createdBy: id('Dan'),
});

await closeDb();

console.log(`Seeded the "${group.name}" group.`);
console.log(`  invite code: ${group.inviteCode}`);
console.log(`  sign in as:  ${PEOPLE.map((p) => p.email).join(', ')}`);
console.log(`  password:    ${PASSWORD}`);
