/**
 * Sign-in with Google or Microsoft, implemented directly against their OAuth2
 * endpoints. No hosted identity vendor sits in the middle: the only things
 * needed are a client id and secret from the provider's own console.
 *
 * The flow is authorization-code with PKCE. The code verifier travels in a
 * signed, short-lived `state` value rather than in server memory, so the API
 * stays stateless and can be run behind any number of instances.
 */

import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { env, googleEnabled, microsoftEnabled, oktaEnabled } from '../env.ts';

export type ProviderName = 'google' | 'microsoft' | 'okta';

export interface ProviderProfile {
  providerAccountId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
}

interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientId: string;
  clientSecret: string;
  parseProfile: (raw: Record<string, unknown>) => ProviderProfile;
}

const stateSecret = new TextEncoder().encode(`${env.JWT_SECRET}:oauth-state`);

export function isProviderEnabled(provider: ProviderName): boolean {
  if (provider === 'google') return googleEnabled;
  if (provider === 'microsoft') return microsoftEnabled;
  return oktaEnabled;
}

export function enabledProviders(): ProviderName[] {
  const out: ProviderName[] = [];
  if (googleEnabled) out.push('google');
  if (microsoftEnabled) out.push('microsoft');
  if (oktaEnabled) out.push('okta');
  return out;
}

function configFor(provider: ProviderName): ProviderConfig {
  if (provider === 'google') {
    if (!googleEnabled) throw new Error('Google sign-in is not configured');
    return {
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      scope: 'openid email profile',
      clientId: env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
      parseProfile: (raw) => ({
        providerAccountId: String(raw.sub ?? ''),
        email: String(raw.email ?? '').toLowerCase(),
        displayName: String(raw.name ?? raw.email ?? 'zBhaga member'),
        avatarUrl: typeof raw.picture === 'string' ? raw.picture : null,
        emailVerified: raw.email_verified === true,
      }),
    };
  }

  if (provider === 'microsoft') {
    if (!microsoftEnabled) throw new Error('Microsoft sign-in is not configured');
    const tenant = env.MICROSOFT_TENANT;
    return {
      authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      scope: 'openid email profile offline_access User.Read',
      clientId: env.MICROSOFT_CLIENT_ID ?? '',
      clientSecret: env.MICROSOFT_CLIENT_SECRET ?? '',
      parseProfile: (raw) => {
        // Work accounts expose `mail`; personal ones only `userPrincipalName`.
        const email = String(raw.mail ?? raw.userPrincipalName ?? '').toLowerCase();
        return {
          providerAccountId: String(raw.id ?? ''),
          email,
          displayName: String(raw.displayName ?? (email || 'zBhaga member')),
          avatarUrl: null,
          // Microsoft only returns addresses it has already verified.
          emailVerified: Boolean(email),
        };
      },
    };
  }

  if (!oktaEnabled) throw new Error('Okta sign-in is not configured');
  const oktaDomain = env.OKTA_DOMAIN ?? '';
  return {
    authorizeUrl: `https://${oktaDomain}/oauth2/v1/authorize`,
    tokenUrl: `https://${oktaDomain}/oauth2/v1/token`,
    userInfoUrl: `https://${oktaDomain}/oauth2/v1/userinfo`,
    scope: 'openid email profile',
    clientId: env.OKTA_CLIENT_ID ?? '',
    clientSecret: env.OKTA_CLIENT_SECRET ?? '',
    parseProfile: (raw) => ({
      providerAccountId: String(raw.sub ?? ''),
      email: String(raw.email ?? '').toLowerCase(),
      displayName: String(raw.name ?? raw.email ?? 'zBhaga member'),
      avatarUrl: typeof raw.picture === 'string' ? raw.picture : null,
      emailVerified: raw.email_verified === true,
    }),
  };
}

export function redirectUriFor(provider: ProviderName): string {
  return `${env.PUBLIC_API_URL.replace(/\/$/, '')}/auth/oauth/${provider}/callback`;
}

export interface StartResult {
  authorizeUrl: string;
  state: string;
}

/** Build the URL to send the user to, carrying a signed PKCE challenge. */
export async function startAuthorization(
  provider: ProviderName,
  returnTo: string,
): Promise<StartResult> {
  const config = configFor(provider);
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

  const state = await new SignJWT({ provider, codeVerifier, returnTo })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(stateSecret);

  const url = new URL(config.authorizeUrl);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', redirectUriFor(provider));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('prompt', 'select_account');

  return { authorizeUrl: url.toString(), state };
}

export interface VerifiedState {
  provider: ProviderName;
  codeVerifier: string;
  returnTo: string;
}

export async function verifyState(state: string): Promise<VerifiedState> {
  const { payload } = await jwtVerify(state, stateSecret, { algorithms: ['HS256'] });
  const provider = payload.provider === 'microsoft' ? 'microsoft' : 'google';
  return {
    provider,
    codeVerifier: String(payload.codeVerifier ?? ''),
    returnTo: String(payload.returnTo ?? env.PUBLIC_APP_URL),
  };
}

/** Swap the authorization code for tokens, then read the user's profile. */
export async function exchangeCode(
  provider: ProviderName,
  code: string,
  codeVerifier: string,
): Promise<ProviderProfile> {
  const config = configFor(provider);

  const tokenResponse = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUriFor(provider),
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text();
    throw new Error(`${provider} rejected the authorization code: ${detail.slice(0, 300)}`);
  }

  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error(`${provider} returned no access token`);

  const profileResponse = await fetch(config.userInfoUrl, {
    headers: { authorization: `Bearer ${tokens.access_token}`, accept: 'application/json' },
  });
  if (!profileResponse.ok) {
    throw new Error(`Could not read the profile from ${provider}`);
  }

  const profile = config.parseProfile((await profileResponse.json()) as Record<string, unknown>);
  if (!profile.providerAccountId) throw new Error(`${provider} returned no account id`);
  if (!profile.email) throw new Error(`${provider} returned no email address`);

  return profile;
}
