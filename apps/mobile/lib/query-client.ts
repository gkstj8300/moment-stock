import { createQueryClient } from "@repo/shared";

export const queryClient = createQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30초 (앱은 더 짧게)
      gcTime: 1000 * 60 * 10, // 10분
      refetchOnWindowFocus: false, // 앱은 AppState로 별도 처리
    },
  },
});
