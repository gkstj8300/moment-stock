"use client";

import { create } from "zustand";

// ─────────────────────────────────────────
// Toast Store
// ─────────────────────────────────────────

interface ToastItem {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastState {
  items: ToastItem[];
  show: (message: string, variant?: ToastItem["variant"]) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  show: (message, variant = "info") => {
    const id = `${Date.now()}`;
    set((s) => ({ items: [...s.items, { id, message, variant }] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, 3000);
  },
  remove: (id) =>
    set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

// ─────────────────────────────────────────
// Toast Container
// ─────────────────────────────────────────

const VARIANT_STYLES = {
  success: "bg-[#09090b] text-white border-[#22c55e]/20",
  error: "bg-[#09090b] text-white border-[#fa2454]/20",
  info: "bg-[#09090b] text-white border-white/10",
};

const VARIANT_ICONS = {
  success: "✓",
  error: "✕",
  info: "i",
};

const VARIANT_ICON_COLORS = {
  success: "text-[#22c55e]",
  error: "text-[#fa2454]",
  info: "text-white/60",
};

export function ToastContainer() {
  const items = useToastStore((s) => s.items);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl ${VARIANT_STYLES[toast.variant]}`}
          role="status"
          aria-live="polite"
        >
          <span className={`flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs font-bold ${VARIANT_ICON_COLORS[toast.variant]}`}>
            {VARIANT_ICONS[toast.variant]}
          </span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
