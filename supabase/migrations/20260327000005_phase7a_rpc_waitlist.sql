-- Phase 7A: confirm_payment RPC + waitlist RLS/인덱스/admit_from_waitlist RPC
-- 설계문서: /docs/spec/03-database-design.md, /docs/spec/06-implementation-plan.md

------------------------------------------------------------
-- 1. confirm_payment RPC — 결제 검증 완료 후 주문 확정
------------------------------------------------------------
CREATE OR REPLACE FUNCTION confirm_payment(
  p_order_id   uuid,
  p_payment_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
BEGIN
  -- 주문 조회
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ORDER_NOT_FOUND',
      'message', '주문을 찾을 수 없습니다.'
    );
  END IF;

  -- pending 상태만 확정 가능
  IF v_order.status <> 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INVALID_STATUS',
      'message', '확정할 수 없는 주문 상태입니다.'
    );
  END IF;

  -- 주문 확정
  UPDATE orders
  SET status = 'confirmed', payment_id = p_payment_id
  WHERE id = p_order_id;

  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id,
    'payment_id', p_payment_id
  );
END;
$$;

------------------------------------------------------------
-- 2. admit_from_waitlist RPC — 대기열에서 순번대로 입장
------------------------------------------------------------
CREATE OR REPLACE FUNCTION admit_from_waitlist(
  p_time_sale_id uuid,
  p_count        integer DEFAULT 1
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admitted integer := 0;
BEGIN
  -- 대기 순번이 가장 낮은(먼저 등록한) 사용자부터 입장
  UPDATE waitlist
  SET status = 'admitted'
  WHERE id IN (
    SELECT id FROM waitlist
    WHERE time_sale_id = p_time_sale_id
      AND status = 'waiting'
    ORDER BY position ASC
    LIMIT p_count
  );

  GET DIAGNOSTICS v_admitted = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'admitted_count', v_admitted
  );
END;
$$;

------------------------------------------------------------
-- 3. join_waitlist RPC — 대기열 등록
------------------------------------------------------------
CREATE OR REPLACE FUNCTION join_waitlist(
  p_user_id      uuid,
  p_time_sale_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_position integer;
  v_waitlist_id uuid;
BEGIN
  -- 다음 순번 계산
  SELECT COALESCE(MAX(position), 0) + 1 INTO v_position
  FROM waitlist
  WHERE time_sale_id = p_time_sale_id;

  -- 등록 (UNIQUE 제약으로 중복 방지)
  INSERT INTO waitlist (time_sale_id, user_id, position)
  VALUES (p_time_sale_id, p_user_id, v_position)
  RETURNING id INTO v_waitlist_id;

  RETURN json_build_object(
    'success', true,
    'waitlist_id', v_waitlist_id,
    'position', v_position
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ALREADY_IN_WAITLIST',
      'message', '이미 대기열에 등록되어 있습니다.'
    );
END;
$$;

------------------------------------------------------------
-- 4. waitlist RLS 정책
------------------------------------------------------------
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY waitlist_select_own ON waitlist
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 직접 INSERT 차단 — join_waitlist RPC만 허용
-- SECURITY DEFINER RPC가 RLS 우회하여 삽입

------------------------------------------------------------
-- 5. waitlist 인덱스
------------------------------------------------------------
CREATE INDEX idx_waitlist_time_sale_position ON waitlist (time_sale_id, position);
CREATE INDEX idx_waitlist_user_id ON waitlist (user_id);
