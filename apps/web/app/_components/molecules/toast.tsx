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
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-800 text-white",
};

export function ToastContainer() {
  const items = useToastStore((s) => s.items);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`animate-in fade-in slide-in-from-bottom-4 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg motion-reduce:animate-none ${VARIANT_STYLES[toast.variant]}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
