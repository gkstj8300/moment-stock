import { createBrowserSupabaseClient } from "@repo/shared";
import type { SupabaseClient } from "@repo/shared";
import * as SecureStore from "expo-secure-store";

const secureStoreAdapter = {
  getItem: async (key: string) => SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => SecureStore.deleteItemAsync(key),
};

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createBrowserSupabaseClient(
      {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL!,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      },
      { authStorage: secureStoreAdapter }
    );
  }
  return client;
}
