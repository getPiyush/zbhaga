/**
 * End-to-end tests over the real HTTP surface, using Fastify's in-process
 * injection and an in-memory Postgres. No network, no fixtures to install.
 */

process.env.DATABASE_URL = 'pglite://memory://';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-tests';
process.env.NODE_ENV = 'test';

import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import type { FastifyInstance } from 'fastify';

const { buildApp } = await import('./app.ts');
const { getDb, closeDb } = await import('./db/client.ts');
const { applySchema } = await import('./db/migrate.ts');

let app: FastifyInstance;

before(async () => {
  await applySchema(await getDb());
  app = await buildApp({ logger: false });
  await app.ready();
});

after(async () => {
  await app.close();
  await closeDb();
});

interface Session {
  id: string;
  token: string;
  refreshToken: string;
}

let counter = 0;

async function signUp(displayName: string): Promise<Session> {
  counter += 1;
  const response = await app.inject({
    method: 'POST',
    url: '/auth/signup',
    payload: {
      email: `${displayName.toLowerCase()}-${counter}@example.com`,
      password: 'a-long-enough-password',
      displayName,
    },
  });
  assert.equal(response.statusCode, 201, response.body);
  const body = response.json();
  return { id: body.user.id, token: body.accessToken, refreshToken: body.refreshToken };
}

const auth = (session: Session) => ({ authorization: `Bearer ${session.token}` });

async function call(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  session: Session,
  payload?: unknown,
) {
  return app.inject({ method, url, headers: auth(session), ...(payload ? { payload } : {}) });
}

/** A group with three members, used by most of the tests below. */
async function makeGroup() {
  const asha = await signUp('Asha');
  const rohit = await signUp('Rohit');
  const meera = await signUp('Meera');

  const created = await call('POST', '/groups', asha, { name: 'Trip', currency: 'USD' });
  assert.equal(created.statusCode, 201, created.body);
  const group = created.json();

  for (const member of [rohit, meera]) {
    const joined = await call('POST', '/groups/join', member, { inviteCode: group.inviteCode });
    assert.equal(joined.statusCode, 200, joined.body);
  }

  return { group, asha, rohit, meera };
}

describe('accounts', () => {
  test('a new account can sign up, call a protected route, and refresh', async () => {
    const session = await signUp('Dan');

    const me = await call('GET', '/auth/me', session);
    assert.equal(me.statusCode, 200);
    assert.equal(me.json().displayName, 'Dan');

    const refreshed = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: session.refreshToken },
    });
    assert.equal(refreshed.statusCode, 200, refreshed.body);
    assert.ok(refreshed.json().accessToken);
  });

  test('a refresh token cannot be used twice', async () => {
    const session = await signUp('Nina');
    const first = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: session.refreshToken },
    });
    assert.equal(first.statusCode, 200);

    const replay = await app.inject({
      method: 'POST',
      url: '/auth/refresh',
      payload: { refreshToken: session.refreshToken },
    });
    assert.equal(replay.statusCode, 401, 'a rotated token must not work again');
  });

  test('the same email cannot be registered twice', async () => {
    counter += 1;
    const payload = {
      email: `duplicate-${counter}@example.com`,
      password: 'a-long-enough-password',
      displayName: 'First',
    };
    assert.equal((await app.inject({ method: 'POST', url: '/auth/signup', payload })).statusCode, 201);
    const second = await app.inject({ method: 'POST', url: '/auth/signup', payload });
    assert.equal(second.statusCode, 409);
  });

  test('a wrong password is rejected', async () => {
    counter += 1;
    const email = `wrongpass-${counter}@example.com`;
    await app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: { email, password: 'the-real-password', displayName: 'Ray' },
    });
    const response = await app.inject({
      method: 'POST',
      url: '/auth/signin',
      payload: { email, password: 'not-the-password' },
    });
    assert.equal(response.statusCode, 401);
  });

  test('protected routes reject a missing or bogus token', async () => {
    assert.equal((await app.inject({ method: 'GET', url: '/groups' })).statusCode, 401);
    const bogus = await app.inject({
      method: 'GET',
      url: '/groups',
      headers: { authorization: 'Bearer not.a.real.token' },
    });
    assert.equal(bogus.statusCode, 401);
  });
});

describe('groups', () => {
  test('creating a group makes you its owner and joining adds members', async () => {
    const { group } = await makeGroup();
    assert.equal(group.members.length, 1, 'the creator is the first member');
    assert.equal(group.members[0].role, 'owner');
  });

  test('a bad invite code is a 404', async () => {
    const session = await signUp('Lost');
    const response = await call('POST', '/groups/join', session, { inviteCode: 'ZZZZZZZZ' });
    assert.equal(response.statusCode, 404);
  });

  test('a non-member cannot read a group', async () => {
    const { group } = await makeGroup();
    const outsider = await signUp('Outsider');
    const response = await call('GET', `/groups/${group.id}`, outsider);
    assert.equal(response.statusCode, 403);
  });

  test('only the owner can rename a group', async () => {
    const { group, rohit } = await makeGroup();
    const response = await call('PATCH', `/groups/${group.id}`, rohit, { name: 'Hijacked' });
    assert.equal(response.statusCode, 403);
  });
});

describe('expenses and balances', () => {
  test('an equal split leaves the payer up and the others down', async () => {
    const { group, asha, rohit, meera } = await makeGroup();

    const created = await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Beach house',
      totalMinor: 9000,
      payers: [{ userId: asha.id, paidMinor: 9000 }],
      split: {
        mode: 'equal',
        participants: [{ userId: asha.id }, { userId: rohit.id }, { userId: meera.id }],
      },
    });
    assert.equal(created.statusCode, 201, created.body);
    const expense = created.json();
    assert.equal(expense.participants.length, 3);
    assert.equal(
      expense.participants.reduce((a: number, p: { owedMinor: number }) => a + p.owedMinor, 0),
      9000,
    );

    const balances = (await call('GET', `/groups/${group.id}/balances`, rohit)).json();
    const netOf = (id: string) =>
      balances.balances.find((b: { userId: string }) => b.userId === id).netMinor;

    assert.equal(netOf(asha.id), 6000);
    assert.equal(netOf(rohit.id), -3000);
    assert.equal(netOf(meera.id), -3000);
    assert.equal(balances.you.totalOwesMinor, 3000);
    assert.equal(balances.you.owes[0].toDisplayName, 'Asha');
  });

  test('debts between the same pair cancel out across expenses', async () => {
    const { group, asha, rohit, meera } = await makeGroup();

    await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Beach house',
      totalMinor: 9000,
      payers: [{ userId: asha.id, paidMinor: 9000 }],
      split: {
        mode: 'equal',
        participants: [{ userId: asha.id }, { userId: rohit.id }, { userId: meera.id }],
      },
    });

    // Rohit pays for dinner, split 50/25/25.
    await call('POST', `/groups/${group.id}/expenses`, rohit, {
      description: 'Dinner',
      totalMinor: 6000,
      payers: [{ userId: rohit.id, paidMinor: 6000 }],
      split: {
        mode: 'percent',
        participants: [
          { userId: asha.id, percentBp: 5000 },
          { userId: rohit.id, percentBp: 2500 },
          { userId: meera.id, percentBp: 2500 },
        ],
      },
    });

    const balances = (await call('GET', `/groups/${group.id}/balances`, meera)).json();
    const netOf = (id: string) =>
      balances.balances.find((b: { userId: string }) => b.userId === id).netMinor;

    assert.equal(netOf(asha.id), 3000);
    assert.equal(netOf(rohit.id), 1500);
    assert.equal(netOf(meera.id), -4500);

    // Asha and Rohit each owed the other 3000, so nothing should remain between them.
    const ashaRohit = balances.debts.filter(
      (d: { fromUserId: string; toUserId: string }) =>
        [d.fromUserId, d.toUserId].includes(asha.id) &&
        [d.fromUserId, d.toUserId].includes(rohit.id),
    );
    assert.equal(ashaRohit.length, 0, 'mutual debts should net to nothing');

    assert.equal(balances.you.totalOwesMinor, 4500);
    assert.equal(balances.you.owes.length, 2);
  });

  test('an exact split must reconcile with the total', async () => {
    const { group, asha, rohit } = await makeGroup();
    const response = await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Taxi',
      totalMinor: 5000,
      payers: [{ userId: asha.id, paidMinor: 5000 }],
      split: {
        mode: 'exact',
        participants: [
          { userId: asha.id, amountMinor: 2000 },
          { userId: rohit.id, amountMinor: 2500 },
        ],
      },
    });
    assert.equal(response.statusCode, 400);
    assert.match(response.json().message, /add up to 4500/);
  });

  test('percentages that do not reach 100 are rejected', async () => {
    const { group, asha, rohit } = await makeGroup();
    const response = await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Museum',
      totalMinor: 4000,
      payers: [{ userId: asha.id, paidMinor: 4000 }],
      split: {
        mode: 'percent',
        participants: [
          { userId: asha.id, percentBp: 5000 },
          { userId: rohit.id, percentBp: 4000 },
        ],
      },
    });
    assert.equal(response.statusCode, 400);
    assert.match(response.json().message, /100%/);
  });

  test('someone outside the group cannot be put on an expense', async () => {
    const { group, asha } = await makeGroup();
    const outsider = await signUp('Outsider');
    const response = await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Mystery',
      totalMinor: 1000,
      payers: [{ userId: asha.id, paidMinor: 1000 }],
      split: { mode: 'equal', participants: [{ userId: asha.id }, { userId: outsider.id }] },
    });
    assert.equal(response.statusCode, 403);
  });

  test('two people can pay for one expense', async () => {
    const { group, asha, rohit, meera } = await makeGroup();
    const created = await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Flights',
      totalMinor: 30000,
      payers: [
        { userId: asha.id, paidMinor: 18000 },
        { userId: rohit.id, paidMinor: 12000 },
      ],
      split: {
        mode: 'equal',
        participants: [{ userId: asha.id }, { userId: rohit.id }, { userId: meera.id }],
      },
    });
    assert.equal(created.statusCode, 201, created.body);

    const balances = (await call('GET', `/groups/${group.id}/balances`, asha)).json();
    const netOf = (id: string) =>
      balances.balances.find((b: { userId: string }) => b.userId === id).netMinor;

    assert.equal(netOf(asha.id), 8000);
    assert.equal(netOf(rohit.id), 2000);
    assert.equal(netOf(meera.id), -10000);
  });

  test('deleting an expense removes it from the balances', async () => {
    const { group, asha, rohit } = await makeGroup();
    const created = await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Oops',
      totalMinor: 2000,
      payers: [{ userId: asha.id, paidMinor: 2000 }],
      split: { mode: 'equal', participants: [{ userId: asha.id }, { userId: rohit.id }] },
    });
    const expenseId = created.json().id;

    const removed = await call('DELETE', `/groups/${group.id}/expenses/${expenseId}`, asha);
    assert.equal(removed.statusCode, 204);

    const balances = (await call('GET', `/groups/${group.id}/balances`, asha)).json();
    assert.ok(
      balances.balances.every((b: { netMinor: number }) => b.netMinor === 0),
      'a deleted expense must not affect anyone',
    );

    const list = (await call('GET', `/groups/${group.id}/expenses`, asha)).json();
    assert.equal(list.items.length, 0);
  });

  test('the timeline paginates newest first', async () => {
    const { group, asha, rohit } = await makeGroup();
    for (let i = 0; i < 5; i += 1) {
      await call('POST', `/groups/${group.id}/expenses`, asha, {
        description: `Coffee ${i}`,
        totalMinor: 100 + i,
        spentAt: new Date(Date.UTC(2026, 0, i + 1)).toISOString(),
        payers: [{ userId: asha.id, paidMinor: 100 + i }],
        split: { mode: 'equal', participants: [{ userId: asha.id }, { userId: rohit.id }] },
      });
    }

    const first = (await call('GET', `/groups/${group.id}/expenses?limit=2`, asha)).json();
    assert.equal(first.items.length, 2);
    assert.equal(first.items[0].description, 'Coffee 4', 'newest first');
    assert.ok(first.nextCursor);

    const second = (
      await call('GET', `/groups/${group.id}/expenses?limit=2&cursor=${first.nextCursor}`, asha)
    ).json();
    assert.equal(second.items[0].description, 'Coffee 2');

    const ids = new Set([...first.items, ...second.items].map((e: { id: string }) => e.id));
    assert.equal(ids.size, 4, 'pages must not overlap');
  });
});

describe('settling up', () => {
  test('recording a payment clears what it covers', async () => {
    const { group, asha, rohit, meera } = await makeGroup();

    await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Beach house',
      totalMinor: 9000,
      payers: [{ userId: asha.id, paidMinor: 9000 }],
      split: {
        mode: 'equal',
        participants: [{ userId: asha.id }, { userId: rohit.id }, { userId: meera.id }],
      },
    });

    const payment = await call('POST', `/groups/${group.id}/payments`, rohit, {
      toUserId: asha.id,
      amountMinor: 3000,
      method: 'upi',
      note: 'Sorted',
    });
    assert.equal(payment.statusCode, 201, payment.body);

    const balances = (await call('GET', `/groups/${group.id}/balances`, rohit)).json();
    const netOf = (id: string) =>
      balances.balances.find((b: { userId: string }) => b.userId === id).netMinor;

    assert.equal(netOf(rohit.id), 0, 'Rohit is square');
    assert.equal(netOf(asha.id), 3000, 'Asha is still owed by Meera');
    assert.equal(balances.you.totalOwesMinor, 0);
    assert.equal(balances.debts.length, 1);
  });

  test('a partial payment leaves the rest outstanding', async () => {
    const { group, asha, rohit, meera } = await makeGroup();
    await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Beach house',
      totalMinor: 9000,
      payers: [{ userId: asha.id, paidMinor: 9000 }],
      split: {
        mode: 'equal',
        participants: [{ userId: asha.id }, { userId: rohit.id }, { userId: meera.id }],
      },
    });

    await call('POST', `/groups/${group.id}/payments`, rohit, {
      toUserId: asha.id,
      amountMinor: 1000,
    });

    const balances = (await call('GET', `/groups/${group.id}/balances`, rohit)).json();
    assert.equal(balances.you.totalOwesMinor, 2000);
  });

  test('you cannot record a payment you are not part of', async () => {
    const { group, asha, rohit, meera } = await makeGroup();
    const response = await call('POST', `/groups/${group.id}/payments`, rohit, {
      fromUserId: meera.id,
      toUserId: asha.id,
      amountMinor: 500,
    });
    assert.equal(response.statusCode, 403);
  });

  test('a payment to yourself is rejected', async () => {
    const { group, asha } = await makeGroup();
    const response = await call('POST', `/groups/${group.id}/payments`, asha, {
      toUserId: asha.id,
      amountMinor: 500,
    });
    assert.equal(response.statusCode, 400);
  });

  test('leaving is blocked until you are square, then allowed', async () => {
    const { group, asha, rohit, meera } = await makeGroup();
    await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Beach house',
      totalMinor: 9000,
      payers: [{ userId: asha.id, paidMinor: 9000 }],
      split: {
        mode: 'equal',
        participants: [{ userId: asha.id }, { userId: rohit.id }, { userId: meera.id }],
      },
    });

    const blocked = await call('POST', `/groups/${group.id}/leave`, rohit);
    assert.equal(blocked.statusCode, 409);

    await call('POST', `/groups/${group.id}/payments`, rohit, {
      toUserId: asha.id,
      amountMinor: 3000,
    });

    const allowed = await call('POST', `/groups/${group.id}/leave`, rohit);
    assert.equal(allowed.statusCode, 204, allowed.body);
  });

  test('the group list reports your net position in each group', async () => {
    const { group, asha, rohit, meera } = await makeGroup();
    await call('POST', `/groups/${group.id}/expenses`, asha, {
      description: 'Beach house',
      totalMinor: 9000,
      payers: [{ userId: asha.id, paidMinor: 9000 }],
      split: {
        mode: 'equal',
        participants: [{ userId: asha.id }, { userId: rohit.id }, { userId: meera.id }],
      },
    });
    await call('POST', `/groups/${group.id}/payments`, rohit, {
      toUserId: asha.id,
      amountMinor: 1000,
    });

    const list = (await call('GET', '/groups', rohit)).json();
    const entry = list.items.find((g: { id: string }) => g.id === group.id);
    assert.equal(entry.memberCount, 3);
    assert.equal(entry.yourNetMinor, -2000);
  });
});

test('the health endpoint answers without a token', async () => {
  const response = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, 'ok');
});
