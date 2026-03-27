import { formatPrice, getStockLevel } from "@repo/shared";
import { colors } from "@repo/ui/tokens";

export default function Home() {
  const level = getStockLevel(42, 100);
  const stockColor = colors.stock[level];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">moment-stock</h1>
      <p className="text-lg text-gray-600">
        실시간 재고 동기화 타임 세일 플랫폼
      </p>
      <div className="mt-4 rounded-lg border p-6 text-center">
        <p className="text-sm text-gray-500">@repo/shared 연결 확인</p>
        <p className="mt-2 text-2xl font-semibold">{formatPrice(29900)}</p>
        <p className="mt-1" style={{ color: stockColor }}>
          재고 상태: {level}
        </p>
      </div>
    </main>
  );
}
