import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./_providers/query-provider";
import { SupabaseProvider } from "./_providers/supabase-provider";
import { Header } from "./_components/organisms/header";
import { Footer } from "./_components/organisms/footer";
import { OfflineBanner } from "./_components/molecules/offline-banner";
import { ToastContainer } from "./_components/molecules/toast";

export const metadata: Metadata = {
  title: "moment-stock — 찰나의 재고, 확실한 거래",
  description:
    "실시간 재고 동기화 타임 세일 플랫폼. 한정 수량, 선착순 특가를 놓치지 마세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="noise-overlay min-h-screen bg-[#fafafa] text-[#0a0a0a]">
        <QueryProvider>
          <SupabaseProvider>
            <a href="#main-content" className="skip-link">
              본문으로 건너뛰기
            </a>
            <Header />
            <main
              id="main-content"
              className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6 lg:px-8"
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
