/**
 * requestAnimationFrame 기반 이벤트 스로틀링/배칭
 *
 * - 동일 키의 연속 이벤트 중 마지막 값만 반영 (최종 상태 우선)
 * - 품절 이벤트(quantity = 0)는 스로틀링 우회하여 즉시 반영
 */

type StockUpdate = {
  productId: string;
  quantity: number;
  initialQuantity: number;
};

type FlushCallback = (updates: StockUpdate[]) => void;

export function createStockThrottler(onFlush: FlushCallback) {
  const buffer = new Map<string, StockUpdate>();
  let rafId: number | null = null;

  function flush() {
    if (buffer.size === 0) return;
    const updates = Array.from(buffer.values());
    buffer.clear();
    rafId = null;
    onFlush(updates);
  }

  function push(update: StockUpdate) {
    // 품절 이벤트 — 스로틀링 우회, 즉시 반영
    if (update.quantity === 0) {
      buffer.delete(update.productId);
      onFlush([update]);
      return;
    }

    // 일반 이벤트 — 버퍼에 적재 (같은 productId는 덮어쓰기)
    buffer.set(update.productId, update);

    if (rafId === null && typeof requestAnimationFrame !== "undefined") {
      rafId = requestAnimationFrame(flush);
    }
  }

  function destroy() {
    if (rafId !== null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(rafId);
    }
    buffer.clear();
    rafId = null;
  }

  return { push, destroy };
}
