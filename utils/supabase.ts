import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { Database } from '~/types/supabase';

import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { Platform } from 'react-native';

// LargeSecureStore handles session tokens that exceed SecureStore's 2048 byte limit
// by storing encrypted data in AsyncStorage and the encryption key in SecureStore
class LargeSecureStore {
  private async _getOrCreateEncryptionKey(key: string): Promise<Uint8Array> {
    const encryptionKeyHex = await SecureStore.getItemAsync(`${key}_encryption_key`);

    if (encryptionKeyHex) {
      return aesjs.utils.hex.toBytes(encryptionKeyHex);
    }

    // Generate new encryption key only once and persist it
    const newKey = crypto.getRandomValues(new Uint8Array(256 / 8));
    await SecureStore.setItemAsync(`${key}_encryption_key`, aesjs.utils.hex.fromBytes(newKey));
    return newKey;
  }

  private async _encrypt(key: string, value: string) {
    const encryptionKey = await this._getOrCreateEncryptionKey(key);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(`${key}_encryption_key`);
    if (!encryptionKeyHex) {
      return null;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) {
      return encrypted;
    }

    return await this._decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`${key}_encryption_key`);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: new LargeSecureStore() } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Utility function to clear all auth storage in case of corruption
export async function clearAuthStorage() {
  try {
    const keys = [
      'supabase.auth.token',
      '@supabase/auth-token',
      'sb-auth-token',
    ];

    for (const key of keys) {
      await AsyncStorage.removeItem(key);
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (e) {
        // SecureStore key might not exist
      }
    }

    await supabase.auth.signOut();
    console.log('Auth storage cleared successfully');
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
}
