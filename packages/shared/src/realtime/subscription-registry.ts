/**
 * 구독 레지스트리 — 참조 카운팅으로 동일 채널 중복 구독 방지
 *
 * 같은 채널에 대해 여러 컴포넌트가 구독하면 참조 카운트만 증가하고,
 * 마지막 컴포넌트가 언마운트될 때 실제 채널을 해제한다.
 */
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RegistryEntry {
  channel: RealtimeChannel;
  refCount: number;
}

const registry = new Map<string, RegistryEntry>();

export function registerChannel(
  key: string,
  createChannel: () => RealtimeChannel
): RealtimeChannel {
  const existing = registry.get(key);
  if (existing) {
    existing.refCount++;
    return existing.channel;
  }

  const channel = createChannel();
  registry.set(key, { channel, refCount: 1 });
  return channel;
}

export function unregisterChannel(key: string): void {
  const entry = registry.get(key);
  if (!entry) return;

  entry.refCount--;
  if (entry.refCount <= 0) {
    entry.channel.unsubscribe();
    registry.delete(key);
  }
}

export function getChannelRefCount(key: string): number {
  return registry.get(key)?.refCount ?? 0;
}

export function clearRegistry(): void {
  registry.forEach((entry) => entry.channel.unsubscribe());
  registry.clear();
}
