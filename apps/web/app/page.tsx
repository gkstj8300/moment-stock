import {
  formatPrice,
  getStockLevel,
  calcDiscountedPrice,
  getRemainingTime,
} from "@repo/shared";
import { colors, breakpoints } from "@repo/ui/tokens";

export default function Home() {
  const level = getStockLevel(42, 100);
  const stockColor = colors.stock[level];
  const discounted = calcDiscountedPrice(89000, 30);
  const remaining = getRemainingTime(
    new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">moment-stock</h1>
      <p className="text-lg text-gray-600">
        실시간 재고 동기화 타임 세일 플랫폼
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-gray-500">@repo/shared 연결 확인</p>
          <p className="mt-2 text-2xl font-semibold">{formatPrice(89000)}</p>
          <p className="mt-1 text-lg line-through text-gray-400">
            {formatPrice(89000)}
          </p>
          <p className="text-xl font-bold text-red-500">
            {formatPrice(discounted)}
          </p>
          <p className="mt-1" style={{ color: stockColor }}>
            재고 상태: {level}
          </p>
        </div>

        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-gray-500">@repo/ui 토큰 확인</p>
          <p className="mt-2 text-sm">
            모바일 브레이크포인트: {breakpoints.mobile}
          </p>
          <p className="mt-4 text-sm text-gray-500">남은 시간</p>
          <p className="text-2xl font-mono font-bold">
            {String(remaining.hours).padStart(2, "0")}:
            {String(remaining.minutes).padStart(2, "0")}:
            {String(remaining.seconds).padStart(2, "0")}
          </p>
        </div>
      </div>
    </main>
  );
}
