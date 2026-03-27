import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./_providers/query-provider";
import { SupabaseProvider } from "./_providers/supabase-provider";
import { Header } from "./_components/header";
import { OfflineBanner } from "./_components/offline-banner";

export const metadata: Metadata = {
  title: "moment-stock",
  description: "실시간 재고 동기화 타임 세일 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <QueryProvider>
          <SupabaseProvider>
            <Header />
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
            <OfflineBanner />
          </SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
