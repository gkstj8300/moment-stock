"use client";

import { useConnectionStore } from "@repo/shared";

export function OfflineBanner() {
  const status = useConnectionStore((s) => s.status);

  if (status === "connected") return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-red-600 px-4 py-2.5 text-center text-sm font-medium text-white"
      role="alert"
      aria-live="assertive"
    >
      {status === "disconnected"
        ? "인터넷 연결이 끊겼어요"
        : "다시 연결하고 있어요..."}
    </div>
  );
}
