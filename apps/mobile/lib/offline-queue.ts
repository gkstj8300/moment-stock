/**
 * 오프라인 큐 — 네트워크 단절 시 작업을 로컬에 저장하고 복구 시 순차 전송
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "@moment-stock/offline-queue";

export interface QueuedAction {
  id: string;
  type: "add_to_cart" | "purchase";
  payload: Record<string, unknown>;
  createdAt: string;
}

export async function enqueueAction(action: Omit<QueuedAction, "id" | "createdAt">): Promise<void> {
  const queue = await getQueue();
  queue.push({
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueuedAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as QueuedAction[];
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

/**
 * 네트워크 복구 시 큐의 작업을 순차 전송
 */
export async function flushQueue(
  processor: (action: QueuedAction) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const queue = await getQueue();
  let processed = 0;
  let failed = 0;

  for (const action of queue) {
    const success = await processor(action);
    if (success) {
      await removeFromQueue(action.id);
      processed++;
    } else {
      failed++;
    }
  }

  return { processed, failed };
}
