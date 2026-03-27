-- Phase 2: 핵심 테이블 생성
-- 설계문서: /docs/spec/03-database-design.md

------------------------------------------------------------
-- 1. profiles (Supabase Auth 연동)
------------------------------------------------------------
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    text NOT NULL,
  avatar_url  text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 신규 Auth 사용자 등록 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'nickname', 'User'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

------------------------------------------------------------
-- 2. products
------------------------------------------------------------
CREATE TABLE products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  description     text,
  image_url       text,
  original_price  integer NOT NULL CHECK (original_price > 0),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

------------------------------------------------------------
-- 3. stocks (products와 분리 — 동시성 성능 최적화)
-- ⚠️ REPLICA IDENTITY FULL: CDC 이벤트에 전체 행 데이터 포함
-- 이 테이블에 컬럼 추가 시 WAL 크기 영향을 반드시 검토할 것
------------------------------------------------------------
CREATE TABLE stocks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  quantity          integer NOT NULL CHECK (quantity >= 0),
  initial_quantity  integer NOT NULL CHECK (initial_quantity > 0),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stocks REPLICA IDENTITY FULL;

------------------------------------------------------------
-- 4. orders
------------------------------------------------------------
CREATE TABLE orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      integer NOT NULL CHECK (quantity > 0),
  unit_price    integer NOT NULL,
  total_price   integer NOT NULL,
  status        text NOT NULL DEFAULT 'pending',
  payment_id    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

------------------------------------------------------------
-- 5. time_sales
------------------------------------------------------------
CREATE TABLE time_sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  discount_rate   integer NOT NULL CHECK (discount_rate BETWEEN 1 AND 99),
  sale_price      integer NOT NULL CHECK (sale_price > 0),
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  is_active       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (starts_at < ends_at)
);

------------------------------------------------------------
-- 6. waitlist (DDL만 — RLS, 인덱스, RPC는 Phase 7A)
------------------------------------------------------------
CREATE TABLE waitlist (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_sale_id    uuid NOT NULL REFERENCES time_sales(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position        integer NOT NULL,
  status          text NOT NULL DEFAULT 'waiting',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (time_sale_id, user_id)
);

------------------------------------------------------------
-- updated_at 자동 갱신 트리거
------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
