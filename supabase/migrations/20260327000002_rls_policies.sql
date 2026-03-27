-- Phase 2: RLS 정책
-- 설계문서: /docs/spec/03-database-design.md 섹션 5
-- waitlist RLS는 Phase 7A로 이관

------------------------------------------------------------
-- RLS 활성화
------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_sales ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- profiles: 본인 조회/수정만 허용
------------------------------------------------------------
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

------------------------------------------------------------
-- products: 전체 공개 조회
------------------------------------------------------------
CREATE POLICY products_select_all ON products
  FOR SELECT TO authenticated, anon
  USING (true);

------------------------------------------------------------
-- stocks: 전체 공개 조회, 직접 UPDATE 차단 (RPC만 허용)
------------------------------------------------------------
CREATE POLICY stocks_select_all ON stocks
  FOR SELECT TO authenticated, anon
  USING (true);

-- stocks에는 UPDATE/INSERT/DELETE 정책을 만들지 않음
-- SECURITY DEFINER RPC만 수정 가능

------------------------------------------------------------
-- orders: 본인 주문만 조회, 직접 INSERT 차단 (RPC만 허용)
------------------------------------------------------------
CREATE POLICY orders_select_own ON orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- orders에는 INSERT/UPDATE 정책을 만들지 않음
-- SECURITY DEFINER RPC만 생성/수정 가능

------------------------------------------------------------
-- time_sales: 활성 세일만 공개 조회
------------------------------------------------------------
CREATE POLICY time_sales_select_active ON time_sales
  FOR SELECT TO authenticated, anon
  USING (is_active = true);
