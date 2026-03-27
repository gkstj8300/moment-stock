/**
 * QueryClient 팩토리 — 플랫폼별 설정 주입 구조
 */
import { QueryClient } from "@tanstack/react-query";
import type { QueryClientConfig } from "@tanstack/react-query";

const DEFAULT_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      gcTime: 1000 * 60 * 5, // 5분
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
};

/**
 * 플랫폼별 설정을 오버라이드할 수 있는 QueryClient 팩토리
 *
 * @example
 * // Web (Next.js)
 * createQueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: true } } })
 *
 * // Mobile (Expo) — 앱 포그라운드 복귀 시 리패치는 앱에서 별도 처리
 * createQueryClient({ defaultOptions: { queries: { staleTime: 1000 * 30 } } })
 */
export function createQueryClient(overrides?: QueryClientConfig): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...DEFAULT_CONFIG.defaultOptions?.queries,
        ...overrides?.defaultOptions?.queries,
      },
      mutations: {
        ...DEFAULT_CONFIG.defaultOptions?.mutations,
        ...overrides?.defaultOptions?.mutations,
      },
    },
  });
}
