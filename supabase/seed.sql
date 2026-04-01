-- Phase 2: 시드 데이터
-- 상품 30건 + 재고, 타임세일 4건 (활성 2, 비활성 2)
--
-- ⚠️ 테스트 사용자는 seed.sql에서 생성하지 않는다.
-- auth.users 직접 삽입은 Supabase Auth 내부 스키마와 충돌한다.
-- db reset 후 아래 명령어로 Admin API를 통해 생성할 것:
--
--   scripts/create-test-users.sh
--

------------------------------------------------------------
-- 상품 30건
------------------------------------------------------------
INSERT INTO products (id, name, description, image_url, original_price) VALUES
  (gen_random_uuid(), '무선 블루투스 이어폰', '고음질 블루투스 5.3 이어폰', 'https://picsum.photos/seed/prod01/400/400', 89000),
  (gen_random_uuid(), '스마트 워치 프로', '건강 모니터링 + GPS', 'https://picsum.photos/seed/prod02/400/400', 299000),
  (gen_random_uuid(), '노이즈캔슬링 헤드폰', 'ANC 기능 탑재', 'https://picsum.photos/seed/prod03/400/400', 349000),
  (gen_random_uuid(), '보조 배터리 20000mAh', '초고속 충전 지원', 'https://picsum.photos/seed/prod04/400/400', 39000),
  (gen_random_uuid(), 'USB-C 멀티 허브', '7in1 포트 확장', 'https://picsum.photos/seed/prod05/400/400', 59000),
  (gen_random_uuid(), '기계식 키보드', '적축 RGB 백라이트', 'https://picsum.photos/seed/prod06/400/400', 129000),
  (gen_random_uuid(), '에르고노믹 마우스', '인체공학 설계', 'https://picsum.photos/seed/prod07/400/400', 79000),
  (gen_random_uuid(), '4K 웹캠', '자동 초점 + 노이즈 캔슬링 마이크', 'https://picsum.photos/seed/prod08/400/400', 149000),
  (gen_random_uuid(), '모니터 암', '듀얼 모니터 거치대', 'https://picsum.photos/seed/prod09/400/400', 89000),
  (gen_random_uuid(), 'LED 데스크 램프', '밝기/색온도 조절', 'https://picsum.photos/seed/prod10/400/400', 49000),
  (gen_random_uuid(), '노트북 스탠드', '알루미늄 접이식', 'https://picsum.photos/seed/prod11/400/400', 35000),
  (gen_random_uuid(), '데스크 매트 XL', '방수 가죽 900x400', 'https://picsum.photos/seed/prod12/400/400', 25000),
  (gen_random_uuid(), '미니 공기청정기', 'HEPA 필터 USB 전원', 'https://picsum.photos/seed/prod13/400/400', 69000),
  (gen_random_uuid(), '텀블러 500ml', '보온보냉 12시간', 'https://picsum.photos/seed/prod14/400/400', 29000),
  (gen_random_uuid(), '스마트 체중계', '체성분 분석 앱 연동', 'https://picsum.photos/seed/prod15/400/400', 45000),
  (gen_random_uuid(), '전동 칫솔', '소닉 진동 4개 모드', 'https://picsum.photos/seed/prod16/400/400', 55000),
  (gen_random_uuid(), '무선 충전 패드', 'Qi2 15W 고속 충전', 'https://picsum.photos/seed/prod17/400/400', 35000),
  (gen_random_uuid(), '카메라 삼각대', '여행용 경량 알루미늄', 'https://picsum.photos/seed/prod18/400/400', 49000),
  (gen_random_uuid(), 'SD 카드 리더기', 'USB 3.2 초고속', 'https://picsum.photos/seed/prod19/400/400', 19000),
  (gen_random_uuid(), 'HDMI 케이블 2m', '8K@60Hz 지원', 'https://picsum.photos/seed/prod20/400/400', 15000),
  (gen_random_uuid(), '스피커 폰', '회의용 360도 마이크', 'https://picsum.photos/seed/prod21/400/400', 119000),
  (gen_random_uuid(), 'NVMe SSD 1TB', 'PCIe 4.0 7000MB/s', 'https://picsum.photos/seed/prod22/400/400', 129000),
  (gen_random_uuid(), '게이밍 마우스패드', 'RGB 발광 대형', 'https://picsum.photos/seed/prod23/400/400', 39000),
  (gen_random_uuid(), '스마트 플러그', 'Wi-Fi 원격 제어', 'https://picsum.photos/seed/prod24/400/400', 19000),
  (gen_random_uuid(), 'Type-C 이어폰', 'DAC 내장 하이레졸', 'https://picsum.photos/seed/prod25/400/400', 49000),
  (gen_random_uuid(), '미니 프로젝터', '1080p 휴대용', 'https://picsum.photos/seed/prod26/400/400', 399000),
  (gen_random_uuid(), '태블릿 케이스', '범용 10인치 스탠드', 'https://picsum.photos/seed/prod27/400/400', 25000),
  (gen_random_uuid(), '보안 USB 메모리', '지문 인식 64GB', 'https://picsum.photos/seed/prod28/400/400', 69000),
  (gen_random_uuid(), '차량용 충전기', '듀얼 USB-C 65W', 'https://picsum.photos/seed/prod29/400/400', 29000),
  (gen_random_uuid(), '에코백', '친환경 캔버스 대형', 'https://picsum.photos/seed/prod30/400/400', 15000);

------------------------------------------------------------
-- 재고 30건 (각 상품에 1:1 매핑)
------------------------------------------------------------
INSERT INTO stocks (product_id, quantity, initial_quantity)
SELECT id, (RANDOM() * 90 + 10)::integer, 100
FROM products;

------------------------------------------------------------
-- 타임 세일 4건 (활성 2, 비활성 2)
------------------------------------------------------------
INSERT INTO time_sales (product_id, discount_rate, sale_price, starts_at, ends_at, is_active)
SELECT id, 30, (original_price * 0.7)::integer,
  now() - interval '1 hour', now() + interval '23 hours', true
FROM products ORDER BY created_at LIMIT 1;

INSERT INTO time_sales (product_id, discount_rate, sale_price, starts_at, ends_at, is_active)
SELECT id, 50, (original_price * 0.5)::integer,
  now() - interval '30 minutes', now() + interval '5 hours 30 minutes', true
FROM products ORDER BY created_at OFFSET 1 LIMIT 1;

INSERT INTO time_sales (product_id, discount_rate, sale_price, starts_at, ends_at, is_active)
SELECT id, 20, (original_price * 0.8)::integer,
  now() + interval '24 hours', now() + interval '48 hours', false
FROM products ORDER BY created_at OFFSET 2 LIMIT 1;

INSERT INTO time_sales (product_id, discount_rate, sale_price, starts_at, ends_at, is_active)
SELECT id, 40, (original_price * 0.6)::integer,
  now() - interval '48 hours', now() - interval '24 hours', false
FROM products ORDER BY created_at OFFSET 3 LIMIT 1;
