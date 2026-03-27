import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
