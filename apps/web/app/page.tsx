"use client";

import Link from "next/link";
import { useProducts } from "@repo/shared";
import { useSupabase } from "./_providers/supabase-provider";
import { ProductCard } from "./_components/organisms";
import { CountdownTimer } from "./_components/molecules";
import { Skeleton } from "./_components/atoms";
import { useScrollRevealAll } from "./_hooks/use-scroll-reveal";
import {
  Zap,
  Tag,
  Clock,
  Gift,
  Flame,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

const CATEGORIES = [
  { icon: Zap, label: "타임세일", href: "/time-sale" },
  { icon: Flame, label: "베스트", href: "/products" },
  { icon: Tag, label: "특가", href: "/products" },
  { icon: Gift, label: "신상품", href: "/products" },
  { icon: Clock, label: "마감임박", href: "/products" },
  { icon: ShoppingBag, label: "전체상품", href: "/products" },
  { icon: Star, label: "추천", href: "/products" },
  { icon: Truck, label: "무료배송", href: "/products" },
];

export default function HomePage() {
  const supabase = useSupabase();
  const { data: products, isLoading, error } = useProducts(supabase);
  const containerRef = useScrollRevealAll();

  return (
    <div ref={containerRef} className="space-y-16">
      {/* ──────────────────────────────────────
          1. 히어로 배너 — mesh gradient + glassmorphism
          ────────────────────────────────────── */}
      <section
        className="reveal relative overflow-hidden rounded-3xl bg-[#09090b] px-8 py-14 text-white sm:px-14 sm:py-20"
        aria-label="타임 세일 배너"
      >
        {/* 배경 mesh gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(250,36,84,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,107,129,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(250,36,84,0.1) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* 장식 요소 */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#fa2454]/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-8 left-1/4 h-40 w-40 rounded-full bg-[#ff6b81]/15 blur-2xl" aria-hidden="true" />

        <div className="relative z-10 max-w-xl">
          <span className="inline-block rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 backdrop-blur-sm">
            기간한정 특가
          </span>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            타임 세일
            <br />
            <span className="text-[#fa2454]">진행 중</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
            지금 바로 특가 상품을 만나보세요.
            <br className="hidden sm:block" />
            한정 수량, 선착순 마감!
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div>
              <span className="text-xs font-medium text-white/40">세일 종료까지</span>
              <div className="mt-2">
                <CountdownTimer
                  endsAt={new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()}
                />
              </div>
            </div>
            <Link
              href="/time-sale"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#fa2454] px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(250,36,84,0.4)] spring-transition hover:shadow-[0_8px_30px_rgba(250,36,84,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              지금 보러가기
              <span className="spring-transition group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────
          2. 카테고리 퀵 메뉴
          ────────────────────────────────────── */}
      <section aria-label="카테고리" className="stagger-children">
        <h2 className="sr-only">카테고리</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:justify-center sm:gap-3">
          {CATEGORIES.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex min-w-[76px] flex-shrink-0 flex-col items-center gap-2.5 rounded-2xl px-3 py-4 text-center spring-transition hover:bg-black/[0.03] active:scale-[0.97]"
              aria-label={label}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fa2454]/[0.06] spring-transition group-hover:bg-[#fa2454]/[0.1]">
                <Icon className="h-6 w-6 text-[#fa2454]" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-[#52525b]">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────
          3. 큐레이션 상품 그리드
          ────────────────────────────────────── */}
      <section aria-label="추천 상품" className="reveal">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#fa2454]">
              Curated
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#0a0a0a]">
              오늘의 추천
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-[#a1a1aa] spring-transition hover:text-[#0a0a0a]"
          >
            전체보기 →
          </Link>
        </div>

        {isLoading && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2.5 p-4">
                  <Skeleton className="h-4 w-4/5 rounded" />
                  <Skeleton className="h-4 w-3/5 rounded" />
                  <Skeleton className="h-5 w-2/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-[#fde8ec] p-5 text-sm font-medium text-[#fa2454]" role="alert">
            상품을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {products && products.length === 0 && (
          <p className="py-20 text-center text-base text-[#a1a1aa]">
            등록된 상품이 없어요
          </p>
        )}

        {products && products.length > 0 && (
          <div className="stagger-children mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} href={`/products/${product.id}`}>
                <ProductCard.Image src={product.imageUrl} alt={product.name} />
                <ProductCard.Info>
                  <ProductCard.Name>{product.name}</ProductCard.Name>
                  <ProductCard.Price original={product.originalPrice} />
                  {product.stock.quantity <= 5 && product.stock.quantity > 0 && (
                    <span className="inline-block rounded-md bg-[#fde8ec] px-2 py-0.5 text-xs font-semibold text-[#fa2454]">
                      {product.stock.quantity}개 남음
                    </span>
                  )}
                  {product.stock.quantity === 0 && (
                    <span className="inline-block rounded-md bg-[#f4f4f5] px-2 py-0.5 text-xs font-semibold text-[#a1a1aa]">
                      품절
                    </span>
                  )}
                </ProductCard.Info>
              </ProductCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
