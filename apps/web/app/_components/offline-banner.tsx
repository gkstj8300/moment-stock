"use client";

import { useConnectionStore } from "@repo/shared";

export function OfflineBanner() {
  const status = useConnectionStore((s) => s.status);

  if (status === "connected") return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 px-4 py-2 text-center text-sm text-white"
      role="alert"
      aria-live="assertive"
    >
      {status === "disconnected"
        ? "네트워크 연결을 확인해주세요. 구매 기능이 제한됩니다."
        : "재연결 중..."}
    </div>
  );
}
