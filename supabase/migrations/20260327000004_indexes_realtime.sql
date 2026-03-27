-- Phase 2: 인덱스 + Realtime Publication
-- 설계문서: /docs/spec/03-database-design.md 섹션 6
-- waitlist 인덱스는 Phase 7A로 이관

------------------------------------------------------------
-- orders 인덱스
------------------------------------------------------------
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_product_id_status ON orders (product_id, status);
CREATE INDEX idx_orders_created_at ON orders (created_at);

------------------------------------------------------------
-- time_sales 인덱스
------------------------------------------------------------
CREATE INDEX idx_time_sales_active ON time_sales (is_active)
  WHERE is_active = true;
CREATE INDEX idx_time_sales_product_starts ON time_sales (product_id, starts_at);

------------------------------------------------------------
-- Realtime CDC Publication
-- stocks, time_sales만 활성화 (설계문서 04 Sync Master 합의)
------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE stocks;
ALTER PUBLICATION supabase_realtime ADD TABLE time_sales;
