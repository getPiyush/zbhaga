/**
 * Password hashing with scrypt from Node's own crypto module.
 *
 * scrypt is memory-hard and needs no native build step, which keeps `npm
 * install` free of compilers. Parameters are stored alongside each hash, so
 * they can be raised later without invalidating existing passwords.
 */

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const PARAMS = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH, PARAMS);
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64url'),
    derived.toString('base64url'),
  ].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, n, r, p, saltB64 = '', hashB64 = ''] = parts;
  const options = {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: PARAMS.maxmem,
  };
  if (!Number.isInteger(options.N) || !Number.isInteger(options.r) || !Number.isInteger(options.p)) {
    return false;
  }

  const expected = Buffer.from(hashB64, 'base64url');
  let derived: Buffer;
  try {
    derived = await scryptAsync(
      password.normalize('NFKC'),
      Buffer.from(saltB64, 'base64url'),
      expected.length,
      options,
    );
  } catch {
    return false;
  }

  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

/**
 * Spend roughly the same time on a login for an address that has no account as
 * for one that does, so the response time does not reveal which is which.
 */
export async function dummyVerify(): Promise<void> {
  await scryptAsync('no-such-user', randomBytes(16), KEY_LENGTH, PARAMS);
}
