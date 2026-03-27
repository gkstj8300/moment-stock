/**
 * 네트워크 상태 모니터링 + 오프라인 복구 트리거
 */
import { useEffect } from "react";
import { AppState } from "react-native";
import { useConnectionStore } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";

/**
 * useNetworkMonitor — 앱 포그라운드 복귀 시 재동기화
 * - AppState 변경 감지
 * - 포그라운드 복귀 시 TanStack Query 전체 무효화
 * - connectionStore 상태 업데이트
 */
export function useNetworkMonitor() {
  const setStatus = useConnectionStore((s) => s.setStatus);
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        // 포그라운드 복귀 → 재동기화
        setStatus("reconnecting");
        queryClient
          .invalidateQueries()
          .then(() => setStatus("connected"))
          .catch(() => setStatus("disconnected"));
      }
    });

    return () => subscription.remove();
  }, [setStatus, queryClient]);
}
