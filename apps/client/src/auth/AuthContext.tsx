/**
 * Who is signed in, and how they got there.
 *
 * Password sign-in is a plain API call. Google and Microsoft go out to the
 * provider and come back to the API, which hands the tokens over in the URL
 * fragment - a browser does that as a redirect, a phone as a system auth
 * session. Both paths end in the same place: `saveTokens`.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import type { PublicUser } from '@zbhaga/shared';
import {
  API_URL,
  api,
  clearTokens,
  getRefreshToken,
  loadStoredTokens,
  onSessionLost,
  saveTokens,
} from '../api/client';

export type OAuthProvider = 'google' | 'microsoft';

interface AuthState {
  user: PublicUser | null;
  /** True until the stored session has been checked, so we do not flash the sign-in screen. */
  initialising: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signInWith: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  availableProviders: OAuthProvider[];
}

const AuthContext = createContext<AuthState | null>(null);

/** Tokens arrive back from an OAuth round trip as `#accessToken=...&refreshToken=...`. */
function readTokensFromFragment(url: string): { accessToken: string; refreshToken: string } | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return null;

  const params = new URLSearchParams(url.slice(hashIndex + 1));
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [initialising, setInitialising] = useState(true);
  const [availableProviders, setAvailableProviders] = useState<OAuthProvider[]>([]);

  const adoptTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    await saveTokens(accessToken, refreshToken);
    setUser(await api.me());
  }, []);

  useEffect(() => {
    onSessionLost(() => setUser(null));

    void (async () => {
      try {
        // A fragment on the entry URL means we have just come back from Google
        // or Microsoft. Consume it before anything else looks at the session.
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const tokens = readTokensFromFragment(window.location.href);
          if (tokens) {
            // Clear the fragment so a refresh does not replay stale tokens.
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            await adoptTokens(tokens.accessToken, tokens.refreshToken);
            return;
          }
        }

        if (await loadStoredTokens()) {
          setUser(await api.me());
        }
      } catch {
        await clearTokens();
        setUser(null);
      } finally {
        setInitialising(false);
      }
    })();
  }, [adoptTokens]);

  useEffect(() => {
    // Which providers this server actually has credentials for.
    void api
      .providers()
      .then((result) => setAvailableProviders(result.oauth))
      .catch(() => setAvailableProviders([]));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.signIn({ email, password });
    await saveTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  }, []);

  const signUp = useCallback(async (displayName: string, email: string, password: string) => {
    const result = await api.signUp({ displayName, email, password });
    await saveTokens(result.accessToken, result.refreshToken);
    setUser(result.user);
  }, []);

  const signInWith = useCallback(
    async (provider: OAuthProvider) => {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const returnTo = `${window.location.origin}${window.location.pathname}`;
        window.location.href = `${API_URL}/auth/oauth/${provider}/start?returnTo=${encodeURIComponent(returnTo)}`;
        return;
      }

      const WebBrowser = await import('expo-web-browser');
      const returnTo = Linking.createURL('/');
      const startUrl = `${API_URL}/auth/oauth/${provider}/start?returnTo=${encodeURIComponent(returnTo)}`;

      const result = await WebBrowser.openAuthSessionAsync(startUrl, returnTo);
      if (result.type !== 'success') return;

      const tokens = readTokensFromFragment(result.url);
      if (!tokens) throw new Error('That sign-in did not complete. Please try again.');
      await adoptTokens(tokens.accessToken, tokens.refreshToken);
    },
    [adoptTokens],
  );

  const signOut = useCallback(async () => {
    const token = getRefreshToken();
    // Best effort: a failed revoke must not trap someone in a signed-in state.
    if (token) await api.signOut(token).catch(() => undefined);
    await clearTokens();
    setUser(null);
    // Navigate to auth after clearing state
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = window.location.origin + '/auth';
      }, 100);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, initialising, signIn, signUp, signInWith, signOut, availableProviders }),
    [user, initialising, signIn, signUp, signInWith, signOut, availableProviders],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
