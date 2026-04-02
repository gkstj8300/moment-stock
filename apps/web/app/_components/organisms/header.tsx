"use client";

import Link from "next/link";
import { useCartStore } from "@repo/shared";

export function Header() {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="glass sticky top-0 z-40 border-b border-black/[0.06]">
      {/* 상단 GNB */}
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-bold tracking-tight text-[#0a0a0a] spring-transition hover:opacity-80"
          aria-label="moment-stock 홈으로 이동"
        >
          <span className="text-[#fa2454]">m</span>oment
          <span className="font-medium text-[#0a0a0a]/50">stock</span>
        </Link>

        {/* 검색바 */}
        <div className="hidden flex-1 sm:block">
          <div className="relative mx-auto max-w-md">
            <input
              type="search"
              placeholder="어떤 상품을 찾으시나요?"
              className="h-11 w-full rounded-xl border border-black/[0.06] bg-[#f4f4f5] px-4 pr-10 text-sm text-[#0a0a0a] placeholder-[#a1a1aa] spring-transition focus:border-[#fa2454]/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(250,36,84,0.08)] focus:outline-none"
              aria-label="상품 검색"
            />
            <svg
              className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1aa]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* 우측 아이콘 */}
        <nav className="flex items-center gap-0.5" aria-label="유틸 네비게이션">
          <Link
            href="/cart"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#71717a] spring-transition hover:bg-black/[0.04] hover:text-[#0a0a0a]"
            aria-label={`장바구니${totalItems > 0 ? `, ${totalItems}개 상품` : ""}`}
          >
            <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#fa2454] px-1 text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(250,36,84,0.4)]">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/auth/login"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#71717a] spring-transition hover:bg-black/[0.04] hover:text-[#0a0a0a]"
            aria-label="로그인"
          >
            <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </nav>
      </div>

      {/* 서브 네비 */}
      <div className="border-t border-black/[0.04]">
        <nav
          className="mx-auto flex h-11 max-w-[1200px] items-center gap-1 px-4 sm:px-6 lg:px-8"
          aria-label="카테고리 네비게이션"
        >
          <Link
            href="/time-sale"
            className="flex h-full items-center rounded-lg px-3 text-sm font-semibold text-[#fa2454] spring-transition hover:bg-[#fa2454]/[0.06]"
          >
            타임세일
          </Link>
          <Link
            href="/products"
            className="flex h-full items-center rounded-lg px-3 text-sm font-medium text-[#71717a] spring-transition hover:bg-black/[0.04] hover:text-[#0a0a0a]"
          >
            베스트
          </Link>
          <Link
            href="/products"
            className="flex h-full items-center rounded-lg px-3 text-sm font-medium text-[#71717a] spring-transition hover:bg-black/[0.04] hover:text-[#0a0a0a]"
          >
            신상품
          </Link>
        </nav>
      </div>
    </header>
  );
}
