/**
 * Somewhere to keep the session between launches.
 *
 * On a phone that is the OS keychain. In a browser there is no keychain, so it
 * is `localStorage` - which is why the access token is short-lived and the
 * refresh token is rotated on every use.
 */

import { Platform } from 'react-native';

type Store = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

const memory = new Map<string, string>();

const memoryStore: Store = {
  async get(key) {
    return memory.get(key) ?? null;
  },
  async set(key, value) {
    memory.set(key, value);
  },
  async remove(key) {
    memory.delete(key);
  },
};

function browserStore(): Store {
  return {
    async get(key) {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        // Private browsing and blocked site data both throw here.
        return memoryStore.get(key);
      }
    },
    async set(key, value) {
      try {
        globalThis.localStorage?.setItem(key, value);
      } catch {
        await memoryStore.set(key, value);
      }
    },
    async remove(key) {
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        await memoryStore.remove(key);
      }
    },
  };
}

function nativeStore(): Store {
  // Required lazily so the web bundle never reaches for the native module.
  const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
  return {
    async get(key) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch {
        return null;
      }
    },
    async set(key, value) {
      await SecureStore.setItemAsync(key, value);
    },
    async remove(key) {
      await SecureStore.deleteItemAsync(key);
    },
  };
}

export const storage: Store = Platform.OS === 'web' ? browserStore() : nativeStore();
