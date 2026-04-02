import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./_providers/query-provider";
import { SupabaseProvider } from "./_providers/supabase-provider";
import { Header } from "./_components/organisms/header";
import { Footer } from "./_components/organisms/footer";
import { OfflineBanner } from "./_components/molecules/offline-banner";
import { ToastContainer } from "./_components/molecules/toast";

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
      <body className="min-h-screen bg-white text-gray-900">
        <QueryProvider>
          <SupabaseProvider>
            <a href="#main-content" className="skip-link">
              본문으로 건너뛰기
            </a>
            <Header />
            <main
              id="main-content"
              className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6"
            >
              {children}
            </main>
            <Footer />
            <ToastContainer />
            <OfflineBanner />
          </SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
