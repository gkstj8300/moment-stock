export function Footer() {
  return (
    <footer className="mt-24 border-t border-black/[0.06] bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          {/* 브랜드 */}
          <div>
            <p className="text-lg font-bold tracking-tight">
              <span className="text-[#fa2454]">m</span>oment
              <span className="font-medium text-white/40">stock</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              찰나의 순간, 가장 정확한 재고.
              <br />
              실시간 동기화 타임 세일 플랫폼.
            </p>
          </div>

          {/* 고객센터 */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              고객센터
            </p>
            <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
              1234-5678
            </p>
            <p className="mt-1.5 text-sm text-white/40">
              평일 10:00 – 18:00 (주말·공휴일 휴무)
            </p>
          </div>

          {/* 이용안내 */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
              이용안내
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              <a
                href="#"
                className="text-sm text-white/60 spring-transition hover:text-white"
              >
                이용약관
              </a>
              <a
                href="#"
                className="text-sm font-semibold text-white/80 spring-transition hover:text-white"
              >
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.08] pt-8">
          <p className="text-xs text-white/30">
            © 2026 moment-stock. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
