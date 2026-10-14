/**
 * The one way this app talks to the API.
 *
 * It owns the access token, refreshes it when it expires, and holds every
 * caller that arrives mid-refresh on the same promise so a screen with four
 * parallel requests triggers one refresh rather than four.
 */

import type {
  AuthResult,
  Expense,
  Group,
  GroupBalances,
  GroupSummary,
  Page,
  Payment,
  PublicUser,
} from '@zbhaga/shared';
import { storage } from '../lib/storage';

const ACCESS_KEY = 'zbhaga.accessToken';
const REFRESH_KEY = 'zbhaga.refreshToken';

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;
let onSignedOut: (() => void) | null = null;

export function onSessionLost(handler: () => void): void {
  onSignedOut = handler;
}

export async function loadStoredTokens(): Promise<boolean> {
  accessToken = await storage.get(ACCESS_KEY);
  refreshToken = await storage.get(REFRESH_KEY);
  return Boolean(refreshToken);
}

export async function saveTokens(access: string, refresh: string): Promise<void> {
  accessToken = access;
  refreshToken = refresh;
  await storage.set(ACCESS_KEY, access);
  await storage.set(REFRESH_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await storage.remove(ACCESS_KEY);
  await storage.remove(REFRESH_KEY);
}

export const getRefreshToken = () => refreshToken;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;

  // Everyone who asks while a refresh is running waits on the same promise.
  refreshInFlight ??= (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return null;

      const result = (await response.json()) as AuthResult;
      await saveTokens(result.accessToken, result.refreshToken);
      return result.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Set for sign-in and sign-up, which must not try to refresh. */
  anonymous?: boolean;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, anonymous = false } = options;

  const send = async (token: string | null): Promise<Response> =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  let response: Response;
  try {
    // If no token and not anonymous, try loading from storage in case of race condition
    let token = anonymous ? null : accessToken;
    if (!token && !anonymous) {
      await loadStoredTokens();
      token = accessToken;
    }
    response = await send(token);
  } catch {
    throw new ApiError(0, 'offline', `Could not reach zBhaga at ${API_URL}.`);
  }

  // One retry, and only after a refresh that actually produced a new token.
  if (response.status === 401 && !anonymous) {
    const renewed = await refreshAccessToken();
    if (renewed) {
      response = await send(renewed);
    } else {
      await clearTokens();
      onSignedOut?.();
    }
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const error = (payload ?? {}) as { error?: string; message?: string; details?: unknown };
    throw new ApiError(
      response.status,
      error.error ?? 'request_failed',
      error.message ?? 'Something went wrong.',
      error.details,
    );
  }

  return payload as T;
}

/* --------------------------------------------------------------- calls -- */

export const api = {
  signUp: (body: { email: string; password: string; displayName: string }) =>
    request<AuthResult>('/auth/signup', { method: 'POST', body, anonymous: true }),

  signIn: (body: { email: string; password: string }) =>
    request<AuthResult>('/auth/signin', { method: 'POST', body, anonymous: true }),

  signOut: (token: string) =>
    request<void>('/auth/signout', { method: 'POST', body: { refreshToken: token } }),

  me: () => request<PublicUser>('/auth/me'),

  providers: () =>
    request<{ password: boolean; oauth: Array<'google' | 'microsoft'> }>('/auth/providers', {
      anonymous: true,
    }),

  listGroups: () => request<Page<GroupSummary>>('/groups'),

  createGroup: (body: { name: string; currency: string; description?: string }) =>
    request<Group>('/groups', { method: 'POST', body }),

  joinGroup: (inviteCode: string) =>
    request<Group>('/groups/join', { method: 'POST', body: { inviteCode } }),

  getGroup: (groupId: string) => request<Group>(`/groups/${groupId}`),

  leaveGroup: (groupId: string) =>
    request<void>(`/groups/${groupId}/leave`, { method: 'POST' }),

  listExpenses: (groupId: string, cursor?: string) =>
    request<Page<Expense>>(
      `/groups/${groupId}/expenses${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),

  createExpense: (groupId: string, body: unknown) =>
    request<Expense>(`/groups/${groupId}/expenses`, { method: 'POST', body }),

  getExpense: (groupId: string, expenseId: string) =>
    request<Expense>(`/groups/${groupId}/expenses/${expenseId}`),

  deleteExpense: (groupId: string, expenseId: string) =>
    request<void>(`/groups/${groupId}/expenses/${expenseId}`, { method: 'DELETE' }),

  getBalances: (groupId: string) => request<GroupBalances>(`/groups/${groupId}/balances`),

  listPayments: (groupId: string) => request<Page<Payment>>(`/groups/${groupId}/payments`),

  recordPayment: (groupId: string, body: unknown) =>
    request<Payment>(`/groups/${groupId}/payments`, { method: 'POST', body }),
};
