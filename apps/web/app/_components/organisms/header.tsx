"use client";

import Link from "next/link";
import { useCartStore } from "@repo/shared";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold text-gray-900"
          aria-label="moment-stock 홈으로 이동"
        >
          moment-stock
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4" aria-label="메인 네비게이션">
          <Link
            href="/time-sale"
            className="min-h-[44px] flex items-center px-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors motion-reduce:transition-none"
          >
            타임세일
          </Link>
          <Link
            href="/products"
            className="min-h-[44px] flex items-center px-2 text-sm text-gray-600 hover:text-gray-900 transition-colors motion-reduce:transition-none"
          >
            상품
          </Link>
          <Link
            href="/cart"
            className="relative min-h-[44px] min-w-[44px] flex items-center justify-center px-2 text-sm text-gray-600 hover:text-gray-900 transition-colors motion-reduce:transition-none"
            aria-label={`장바구니${totalItems > 0 ? `, ${totalItems}개 상품` : ""}`}
          >
            장바구니
            {totalItems > 0 && (
              <span className="absolute -right-0.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/auth/login"
            className="min-h-[44px] flex items-center px-2 text-sm text-gray-600 hover:text-gray-900 transition-colors motion-reduce:transition-none"
          >
            로그인
          </Link>
        </nav>
      </div>
    </header>
  );
}
