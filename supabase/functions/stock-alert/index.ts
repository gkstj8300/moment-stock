// Edge Function: stock-alert
// 재고 임박(5개 미만) 시 FCM 푸시 알림 전송
// DB trigger 또는 cron에서 호출

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AlertPayload {
  product_id: string;
  product_name: string;
  current_stock: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type, apikey",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const payload: AlertPayload = await req.json();
    const { product_id, product_name, current_stock } = payload;

    if (current_stock >= 5) {
      return new Response(
        JSON.stringify({ sent: false, reason: "Stock above threshold" }),
        { status: 200 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // FCM 서버 키 (환경변수)
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

    if (!fcmServerKey) {
      // FCM 미설정 시 로그만 남기고 성공 반환
      console.log(
        `[stock-alert] FCM not configured. Would notify: ${product_name} - ${current_stock}개 남음`
      );
      return new Response(
        JSON.stringify({
          sent: false,
          reason: "FCM not configured",
          product_id,
          product_name,
          current_stock,
        }),
        { status: 200 }
      );
    }

    // 해당 상품에 관심 등록한 사용자들의 FCM 토큰 조회
    // TODO: push_tokens 테이블 구현 시 실제 조회로 교체
    const tokens: string[] = [];

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: false, reason: "No registered tokens" }),
        { status: 200 }
      );
    }

    // FCM 전송
    const fcmResponse = await fetch(
      "https://fcm.googleapis.com/fcm/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${fcmServerKey}`,
        },
        body: JSON.stringify({
          registration_ids: tokens,
          notification: {
            title: "재고 임박!",
            body: `${product_name} - ${current_stock}개 남았습니다!`,
          },
          data: {
            product_id,
            type: "stock_alert",
          },
        }),
      }
    );

    const fcmResult = await fcmResponse.json();

    return new Response(
      JSON.stringify({
        sent: true,
        fcm_result: fcmResult,
        recipients: tokens.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
});
