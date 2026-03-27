/**
 * Supabase 클라이언트 팩토리 — 서버/브라우저 분리
 *
 * - createBrowserClient: 브라우저 및 Expo 환경용 (AsyncStorage 어댑터 주입 가능)
 * - createServerClient: Next.js RSC/SSR용 (cookie 핸들러 주입)
 */
import { createClient } from "@supabase/supabase-js";
import { createBrowserClient as createSSRBrowserClient, createServerClient as createSSRServerClient } from "@supabase/ssr";
import type { Database } from "../types/database.types";

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

/**
 * 브라우저/Expo용 Supabase 클라이언트
 * Expo에서는 options.auth.storage에 AsyncStorage를 주입한다.
 */
export function createBrowserSupabaseClient(
  config: SupabaseConfig,
  options?: {
    authStorage?: {
      getItem: (key: string) => Promise<string | null>;
      setItem: (key: string, value: string) => Promise<void>;
      removeItem: (key: string) => Promise<void>;
    };
  }
) {
  return createSSRBrowserClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey,
    options?.authStorage
      ? {
          auth: {
            storage: options.authStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
        }
      : undefined
  );
}

/**
 * Next.js RSC/SSR용 Supabase 클라이언트
 * cookies() 핸들러를 주입받아 서버 사이드에서 인증 세션을 처리한다.
 */
export function createServerSupabaseClient(
  config: SupabaseConfig,
  cookieHandlers: {
    getAll: () => { name: string; value: string }[];
    setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[]) => void;
  }
) {
  return createSSRServerClient<Database>(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      cookies: cookieHandlers,
    }
  );
}

/**
 * 기본 Supabase 클라이언트 (서버 사이드 단순 조회용, 인증 불필요)
 */
export function createPlainSupabaseClient(config: SupabaseConfig) {
  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey);
}
