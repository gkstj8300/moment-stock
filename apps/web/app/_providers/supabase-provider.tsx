"use client";

import { createContext, useContext, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@repo/shared";

type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

const SupabaseContext = createContext<TypedSupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");
  return ctx;
}
