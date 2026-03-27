-- Phase 2: RPC 함수
-- 설계문서: /docs/spec/03-database-design.md 섹션 4
-- confirm_payment, admit_from_waitlist는 Phase 7A로 이관

------------------------------------------------------------
-- purchase_stock: 원자적 재고 차감 + 주문 생성
------------------------------------------------------------
CREATE OR REPLACE FUNCTION purchase_stock(
  p_user_id    uuid,
  p_product_id uuid,
  p_quantity   integer,
  p_unit_price integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining integer;
  v_order_id  uuid;
BEGIN
  -- 1. 원자적 재고 차감 (행 레벨 락 암묵 획득)
  UPDATE stocks
  SET quantity = quantity - p_quantity
  WHERE product_id = p_product_id
    AND quantity >= p_quantity;

  -- 2. 영향 행 0 → 재고 부족
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'INSUFFICIENT_STOCK',
      'message', '재고가 부족합니다.'
    );
  END IF;

  -- 3. 잔여 재고 조회
  SELECT quantity INTO v_remaining
  FROM stocks
  WHERE product_id = p_product_id;

  -- 4. 주문 생성
  INSERT INTO orders (user_id, product_id, quantity, unit_price, total_price, status)
  VALUES (p_user_id, p_product_id, p_quantity, p_unit_price, p_unit_price * p_quantity, 'pending')
  RETURNING id INTO v_order_id;

  -- 5. 성공 응답
  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id,
    'remaining_stock', v_remaining
  );
END;
$$;

------------------------------------------------------------
-- cancel_order: 주문 취소 + 재고 복구
------------------------------------------------------------
CREATE OR REPLACE FUNCTION cancel_order(
  p_user_id  uuid,
  p_order_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order   record;
BEGIN
  -- 1. 주문 조회 + 소유권 확인
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ORDER_NOT_FOUND',
      'message', '주문을 찾을 수 없습니다.'
    );
  END IF;

  -- 2. 이미 취소된 주문 체크
  IF v_order.status = 'cancelled' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ALREADY_CANCELLED',
      'message', '이미 취소된 주문입니다.'
    );
  END IF;

  -- 3. pending 상태만 취소 가능
  IF v_order.status <> 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'CANNOT_CANCEL',
      'message', '취소할 수 없는 주문 상태입니다.'
    );
  END IF;

  -- 4. 재고 복구
  UPDATE stocks
  SET quantity = quantity + v_order.quantity
  WHERE product_id = v_order.product_id;

  -- 5. 주문 상태 변경
  UPDATE orders
  SET status = 'cancelled'
  WHERE id = p_order_id;

  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id
  );
END;
$$;

------------------------------------------------------------
-- get_active_time_sales: 활성 타임 세일 + 재고 조인 조회
------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_active_time_sales()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT
        ts.id,
        ts.product_id,
        p.name AS product_name,
        p.image_url,
        p.original_price,
        ts.sale_price,
        ts.discount_rate,
        s.quantity AS current_stock,
        s.initial_quantity AS initial_stock,
        ROUND((s.quantity::numeric / s.initial_quantity) * 100) AS stock_percentage,
        ts.starts_at,
        ts.ends_at,
        ts.is_active
      FROM time_sales ts
      JOIN products p ON p.id = ts.product_id
      JOIN stocks s ON s.product_id = ts.product_id
      WHERE ts.is_active = true
        AND ts.ends_at > now()
      ORDER BY ts.starts_at ASC
    ) t
  );
END;
$$;
