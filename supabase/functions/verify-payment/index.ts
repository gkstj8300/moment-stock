// Edge Function: verify-payment
// 결제 유효성 검증 후 purchase_stock RPC 호출 → confirm_payment
// ⚠️ 절대로 직접 UPDATE stocks를 실행하지 않는다. 반드시 RPC를 통해서만 재고 차감.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PaymentRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
  payment_token: string; // 외부 PG사 결제 토큰
}

interface PaymentVerifyResult {
  verified: boolean;
  payment_id: string;
}

// 외부 PG사 결제 검증 (모의 구현)
async function verifyWithPG(paymentToken: string): Promise<PaymentVerifyResult> {
  // TODO: 실제 PG사 API 호출로 교체
  // 현재는 모의 검증 — 토큰이 존재하면 성공
  if (!paymentToken) {
    return { verified: false, payment_id: "" };
  }
  return {
    verified: true,
    payment_id: `pay_${crypto.randomUUID()}`,
  };
}

Deno.serve(async (req: Request) => {
  try {
    // CORS preflight
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

    // Auth 검증
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Supabase 서비스 클라이언트 (RPC 호출용)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 사용자 확인
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }

    // 요청 파싱
    const body: PaymentRequest = await req.json();
    const { product_id, quantity, unit_price, payment_token } = body;

    if (!product_id || !quantity || !unit_price || !payment_token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // 1. 외부 PG 결제 검증
    const pgResult = await verifyWithPG(payment_token);
    if (!pgResult.verified) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "PAYMENT_FAILED",
          message: "결제 검증에 실패했습니다.",
        }),
        { status: 400 }
      );
    }

    // 2. purchase_stock RPC 호출 (재고 차감 + 주문 생성)
    const { data: purchaseResult, error: purchaseError } =
      await supabaseAdmin.rpc("purchase_stock", {
        p_user_id: user.id,
        p_product_id: product_id,
        p_quantity: quantity,
        p_unit_price: unit_price,
      });

    if (purchaseError) {
      // 결제 취소 처리 (PG사에 환불 요청)
      // TODO: 실제 PG사 환불 API 호출
      return new Response(
        JSON.stringify({
          success: false,
          error: "PURCHASE_FAILED",
          message: purchaseError.message,
        }),
        { status: 400 }
      );
    }

    const purchase = purchaseResult as {
      success: boolean;
      order_id?: string;
      error?: string;
      message?: string;
    };

    if (!purchase.success) {
      // 재고 부족 등 — PG 결제 취소 필요
      // TODO: 실제 PG사 환불 API 호출
      return new Response(JSON.stringify(purchase), { status: 400 });
    }

    // 3. confirm_payment RPC 호출 (주문 확정)
    const { error: confirmError } = await supabaseAdmin.rpc(
      "confirm_payment",
      {
        p_order_id: purchase.order_id,
        p_payment_id: pgResult.payment_id,
      }
    );

    if (confirmError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "CONFIRM_FAILED",
          message: confirmError.message,
        }),
        { status: 500 }
      );
    }

    // 4. 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        order_id: purchase.order_id,
        payment_id: pgResult.payment_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "INTERNAL_ERROR",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
});
