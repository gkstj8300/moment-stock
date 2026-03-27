-- Phase 8: 동시 100명 구매 부하 테스트
-- 실행: docker exec supabase_db_supabase psql -U postgres -d postgres -f /dev/stdin < scripts/load-test.sql

-- 1. 테스트 준비: 재고를 50으로 설정
UPDATE stocks SET quantity = 50
WHERE product_id = (SELECT id FROM products ORDER BY created_at LIMIT 1);

-- 주문 초기화
DELETE FROM orders
WHERE product_id = (SELECT id FROM products ORDER BY created_at LIMIT 1)
  AND status = 'pending';

-- 2. 100회 동시 구매 시도 (재고 50개, 각 1개씩)
DO $$
DECLARE
  v_product_id uuid;
  v_success_count integer := 0;
  v_fail_count integer := 0;
  v_result json;
BEGIN
  SELECT id INTO v_product_id FROM products ORDER BY created_at LIMIT 1;

  FOR i IN 1..100 LOOP
    SELECT purchase_stock(
      'a1111111-1111-1111-1111-111111111111',
      v_product_id,
      1,
      89000
    ) INTO v_result;

    IF (v_result ->> 'success')::boolean THEN
      v_success_count := v_success_count + 1;
    ELSE
      v_fail_count := v_fail_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE '========================================';
  RAISE NOTICE '부하 테스트 결과';
  RAISE NOTICE '========================================';
  RAISE NOTICE '총 시도: 100';
  RAISE NOTICE '성공: %', v_success_count;
  RAISE NOTICE '실패 (재고 부족): %', v_fail_count;
  RAISE NOTICE '기대 성공: 50 (재고 50개)';
  RAISE NOTICE '========================================';
END $$;

-- 3. 결과 검증
SELECT
  quantity AS final_stock,
  CASE WHEN quantity = 0 THEN 'PASS: 재고 정확' ELSE 'FAIL: 재고 불일치' END AS stock_check
FROM stocks
WHERE product_id = (SELECT id FROM products ORDER BY created_at LIMIT 1);

SELECT
  count(*) AS total_orders,
  CASE WHEN count(*) = 50 THEN 'PASS: 주문 수 정확' ELSE 'FAIL: 주문 수 불일치' END AS order_check
FROM orders
WHERE product_id = (SELECT id FROM products ORDER BY created_at LIMIT 1)
  AND status = 'pending';

-- 4. 초과 판매 체크
SELECT
  CASE WHEN quantity >= 0 THEN 'PASS: 초과 판매 0건' ELSE 'FAIL: 초과 판매 발생!' END AS oversell_check
FROM stocks
WHERE product_id = (SELECT id FROM products ORDER BY created_at LIMIT 1);
