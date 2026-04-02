"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "../_providers/supabase-provider";

export default function WaitlistPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">로딩 중...</div>}>
      <WaitlistContent />
    </Suspense>
  );
}

function WaitlistContent() {
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeSaleId = searchParams.get("saleId");

  const [position, setPosition] = useState<number | null>(null);
  const [status, setStatus] = useState<"waiting" | "admitted" | "error">("waiting");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!timeSaleId) return;

    async function joinQueue() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login?redirect=/waitlist");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)("join_waitlist", {
        p_user_id: user.id,
        p_time_sale_id: timeSaleId!,
      });

      if (error) {
        setStatus("error");
        setLoading(false);
        return;
      }

      const result = data as unknown as { success: boolean; position?: number; error?: string };
      if (result.success) {
        setPosition(result.position ?? null);
      } else if (result.error === "ALREADY_IN_WAITLIST") {
        setStatus("waiting");
      }
      setLoading(false);
    }

    joinQueue();
  }, [timeSaleId, supabase, router]);

  // 순번 폴링 (5초 간격)
  useEffect(() => {
    if (status !== "waiting" || !timeSaleId) return;

    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("waitlist")
        .select("position, status")
        .eq("time_sale_id", timeSaleId)
        .eq("user_id", user.id)
        .single();

      const row = data as { position: number; status: string } | null;
      if (row) {
        setPosition(row.position);
        if (row.status === "admitted") {
          setStatus("admitted");
          setTimeout(() => router.push(`/time-sale`), 2000);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status, timeSaleId, supabase, router]);

  if (!timeSaleId) {
    return (
      <div className="py-12 text-center text-gray-500">
        유효하지 않은 접근입니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 text-center">
      <h1 className="text-2xl font-bold">대기열</h1>

      {loading && (
        <p className="text-gray-500" role="status">대기열에 등록 중...</p>
      )}

      {status === "waiting" && position !== null && (
        <>
          <div className="rounded-xl bg-[#fff5f7] p-8">
            <p className="text-sm text-[#fa2454]">현재 대기 순번</p>
            <p className="mt-2 text-5xl font-bold text-[#fa2454]" aria-live="polite">
              {position}번
            </p>
          </div>
          <p className="text-sm text-gray-500">
            잠시만 기다려 주세요. 순번이 되면 자동으로 입장됩니다.
          </p>
          <p className="text-xs text-gray-400">
            ※ 페이지를 떠나면 순번이 취소될 수 있습니다.
          </p>
        </>
      )}

      {status === "admitted" && (
        <div className="rounded-xl bg-green-50 p-8">
          <p className="text-lg font-bold text-green-700">입장 허가!</p>
          <p className="mt-2 text-sm text-green-600">
            타임 세일 페이지로 이동합니다...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
          대기열 등록에 실패했습니다. 다시 시도해주세요.
        </div>
      )}
    </div>
  );
}
