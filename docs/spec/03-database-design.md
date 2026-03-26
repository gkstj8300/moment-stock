# 데이터베이스 설계

## 1. 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 데이터베이스 설계 |
| 버전 | v0.1.0 |
| 작성일 | 2026-03-26 |
| 기반 문서 | /docs/spec/summary.md |

### 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v0.1.0 | 2026-03-26 | Claude | 신규 작성 |

---

## 2. 데이터 모델 개요

### 핵심 엔티티

본 프로젝트의 데이터 모델은 **재고(Stock)**를 단일 진실 공급원(Single Source of Truth)으로 두고, 타임 세일 환경에서 동시성 안전한 구매 트랜잭션을 지원하기 위해 설계되었다.

| 엔티티 | 설명 |
|--------|------|
| **profiles** | Supabase Auth와 연동되는 사용자 프로필 정보 |
| **products** | 상품 기본 정보 (이름, 설명, 이미지, 가격 등) |
| **stocks** | 상품별 재고 수량. 원자적 차감의 핵심 대상 테이블 |
| **orders** | 사용자의 구매 주문 내역 |
| **time_sales** | 타임 세일 이벤트 정의 (시작/종료 시각, 할인율 등) |
| **waitlist** | 트래픽 폭주 시 대기열 관리를 위한 대기자 목록 |

### 엔티티 관계

- `profiles`는 Supabase Auth의 `auth.users`와 1:1 관계를 가진다 (`id`가 `auth.users.id`를 참조).
- `products`와 `stocks`는 1:1 관계이다. 재고를 별도 테이블로 분리하여 상품 조회와 재고 갱신의 락 범위를 최소화한다.
- `orders`는 `profiles`와 N:1, `products`와 N:1 관계를 가진다.
- `time_sales`는 `products`와 N:1 관계를 가진다. 하나의 상품에 여러 타임 세일이 시간대별로 존재할 수 있다.
- `waitlist`는 `time_sales`와 N:1, `profiles`와 N:1 관계를 가진다.

---

## 3. 핵심 테이블 설계

### 3.1 profiles

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, FK → auth.users(id) | Supabase Auth 사용자 ID |
| nickname | text | NOT NULL | 사용자 닉네임 |
| avatar_url | text | | 프로필 이미지 URL |
| phone | text | | 연락처 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성 시각 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 수정 시각 |

### 3.2 products

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 상품 고유 ID |
| name | text | NOT NULL | 상품명 |
| description | text | | 상품 설명 |
| image_url | text | | 대표 이미지 URL |
| original_price | integer | NOT NULL, CHECK (original_price > 0) | 정가 (원) |
| is_active | boolean | NOT NULL, DEFAULT true | 활성화 여부 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성 시각 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 수정 시각 |

### 3.3 stocks

상품 테이블과 분리하여 **재고 갱신 시 products 행에 대한 락을 방지**한다. 이 테이블이 원자적 차감의 핵심 대상이다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 재고 레코드 ID |
| product_id | uuid | NOT NULL, UNIQUE, FK → products(id) | 상품 참조 |
| quantity | integer | NOT NULL, CHECK (quantity >= 0) | 현재 잔여 재고 수량 |
| initial_quantity | integer | NOT NULL, CHECK (initial_quantity > 0) | 초기 재고 수량 (진행률 계산용) |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 최종 갱신 시각 |

> `CHECK (quantity >= 0)` 제약조건이 DB 레벨에서 초과 판매를 물리적으로 차단한다.

### 3.4 orders

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 주문 고유 ID |
| user_id | uuid | NOT NULL, FK → profiles(id) | 구매자 |
| product_id | uuid | NOT NULL, FK → products(id) | 구매 상품 |
| quantity | integer | NOT NULL, CHECK (quantity > 0) | 구매 수량 |
| unit_price | integer | NOT NULL | 구매 시점 단가 (원) |
| total_price | integer | NOT NULL | 총 결제 금액 (원) |
| status | text | NOT NULL, DEFAULT 'pending' | 주문 상태 (pending / confirmed / cancelled / refunded) |
| payment_id | text | | 외부 결제 고유 ID |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 주문 생성 시각 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 주문 수정 시각 |

### 3.5 time_sales

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 타임 세일 고유 ID |
| product_id | uuid | NOT NULL, FK → products(id) | 대상 상품 |
| discount_rate | integer | NOT NULL, CHECK (discount_rate BETWEEN 1 AND 99) | 할인율 (%) |
| sale_price | integer | NOT NULL, CHECK (sale_price > 0) | 세일 가격 (원) |
| starts_at | timestamptz | NOT NULL | 세일 시작 시각 |
| ends_at | timestamptz | NOT NULL | 세일 종료 시각 |
| is_active | boolean | NOT NULL, DEFAULT false | 활성화 여부 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 생성 시각 |

> `starts_at < ends_at` 제약조건을 CHECK로 추가하여 잘못된 기간 설정을 방지한다.

### 3.6 waitlist

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 대기열 항목 ID |
| time_sale_id | uuid | NOT NULL, FK → time_sales(id) | 대상 타임 세일 |
| user_id | uuid | NOT NULL, FK → profiles(id) | 대기 사용자 |
| position | integer | NOT NULL | 대기 순번 |
| status | text | NOT NULL, DEFAULT 'waiting' | 상태 (waiting / admitted / expired) |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 등록 시각 |

> `(time_sale_id, user_id)` 복합 UNIQUE 제약으로 중복 대기 등록을 방지한다.

---

## 4. RPC (Stored Procedures) 설계

### 4.1 purchase_stock (핵심 RPC)

재고 차감과 주문 생성을 하나의 트랜잭션으로 처리하여 Race Condition을 원천 차단한다.

**시그니처:**

```sql
CREATE OR REPLACE FUNCTION purchase_stock(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer,
  p_unit_price integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
```

**처리 흐름:**

1. `stocks` 테이블에서 `UPDATE ... SET quantity = quantity - p_quantity WHERE product_id = p_product_id AND quantity >= p_quantity` 실행
2. 영향 받은 행이 0이면 → 재고 부족 에러 반환 (롤백)
3. `orders` 테이블에 주문 레코드 삽입 (status = 'pending')
4. 성공 시 주문 ID와 잔여 재고를 JSON으로 반환

**핵심 설계 원칙:**

- `SECURITY DEFINER`로 실행하여 RLS를 우회하고, 함수 내부에서 권한을 직접 검증한다.
- `CHECK (quantity >= 0)` 제약조건이 최종 안전장치로 동작한다.
- 단일 UPDATE 문의 원자성을 활용하여 별도의 명시적 락(SELECT FOR UPDATE) 없이도 동시성을 보장한다.

### 4.2 기타 RPC

| RPC 이름 | 설명 |
|----------|------|
| `cancel_order` | 주문 취소 시 재고 복구 (`quantity + 복구량`) 및 주문 상태 변경을 원자적으로 처리 |
| `confirm_payment` | Edge Function에서 결제 검증 완료 후 호출. 주문 상태를 `confirmed`로 변경 |
| `get_active_time_sales` | 현재 활성화된 타임 세일 목록과 잔여 재고를 조인하여 반환 |
| `admit_from_waitlist` | 대기열에서 순번대로 사용자를 입장시키고 상태를 `admitted`로 변경 |

---

## 5. RLS (Row Level Security) 정책

### 5.1 profiles

| 정책명 | 동작 | 대상 | 조건 |
|--------|------|------|------|
| profiles_select_own | SELECT | authenticated | `auth.uid() = id` |
| profiles_update_own | UPDATE | authenticated | `auth.uid() = id` |

### 5.2 products

| 정책명 | 동작 | 대상 | 조건 |
|--------|------|------|------|
| products_select_all | SELECT | authenticated, anon | 조건 없음 (공개 조회) |
| products_insert_admin | INSERT | authenticated | 관리자 역할 확인 (별도 admin 체크) |
| products_update_admin | UPDATE | authenticated | 관리자 역할 확인 |

### 5.3 stocks

| 정책명 | 동작 | 대상 | 조건 |
|--------|------|------|------|
| stocks_select_all | SELECT | authenticated, anon | 조건 없음 (재고 조회는 공개) |
| stocks_update_none | UPDATE | - | 직접 UPDATE 불가. 반드시 RPC를 통해서만 수정 |

> `stocks` 테이블의 직접 UPDATE를 RLS로 차단하고, `SECURITY DEFINER` RPC만 수정 권한을 가진다.

### 5.4 orders

| 정책명 | 동작 | 대상 | 조건 |
|--------|------|------|------|
| orders_select_own | SELECT | authenticated | `auth.uid() = user_id` |
| orders_insert_via_rpc | INSERT | - | 직접 INSERT 불가. RPC를 통해서만 생성 |

### 5.5 time_sales

| 정책명 | 동작 | 대상 | 조건 |
|--------|------|------|------|
| time_sales_select_active | SELECT | authenticated, anon | `is_active = true` |
| time_sales_manage_admin | ALL | authenticated | 관리자 역할 확인 |

### 5.6 waitlist

| 정책명 | 동작 | 대상 | 조건 |
|--------|------|------|------|
| waitlist_select_own | SELECT | authenticated | `auth.uid() = user_id` |
| waitlist_insert_own | INSERT | authenticated | `auth.uid() = user_id` |

---

## 6. 인덱스 전략

타임 세일 트래픽 폭주 상황에서 쿼리 성능을 확보하기 위한 인덱스 설계이다.

### 필수 인덱스

| 테이블 | 인덱스 | 타입 | 목적 |
|--------|--------|------|------|
| stocks | `idx_stocks_product_id` | UNIQUE (이미 UNIQUE 제약으로 존재) | `purchase_stock` RPC에서 product_id로 조회 |
| orders | `idx_orders_user_id` | B-Tree | 사용자별 주문 내역 조회 |
| orders | `idx_orders_product_id_status` | B-Tree (복합) | 상품별 주문 상태 집계 |
| orders | `idx_orders_created_at` | B-Tree | 주문 시간순 정렬 및 페이지네이션 |
| time_sales | `idx_time_sales_active` | B-Tree (부분 인덱스) | `WHERE is_active = true` 활성 세일만 필터링 |
| time_sales | `idx_time_sales_product_starts` | B-Tree (복합) | 상품별 세일 시간 조회 |
| waitlist | `idx_waitlist_time_sale_position` | B-Tree (복합) | 타임 세일별 대기 순번 조회 |
| waitlist | `idx_waitlist_user_id` | B-Tree | 사용자별 대기 현황 조회 |

### 인덱스 설계 원칙

- 재고 테이블(`stocks`)은 행 수가 적으므로 과도한 인덱스를 추가하지 않는다. `product_id` UNIQUE 인덱스만으로 충분하다.
- 주문 테이블(`orders`)은 지속적으로 증가하므로 페이지네이션용 인덱스가 필수이다.
- 부분 인덱스(Partial Index)를 활용하여 활성 데이터만 빠르게 조회한다.

---

## 7. 페르소나 관점 토론

### Monorepo Lead 의견

**마이그레이션 파일 관리:**

- Supabase CLI의 마이그레이션 파일은 `supabase/migrations/` 디렉터리에 타임스탬프 기반으로 생성된다. 이 디렉터리를 모노레포 루트에 배치하여 모든 앱에서 동일한 스키마를 참조한다.
- `supabase gen types typescript` 명령으로 생성되는 DB 타입 정의는 `packages/shared/src/types/database.types.ts`에 배치한다.

**타입 공유 전략:**

- 자동 생성된 DB 타입을 기반으로 프론트엔드용 DTO 타입을 `packages/shared`에서 파생(Derive)하여 웹(Next.js)과 앱(Expo) 양쪽에서 import한다.
- CI 파이프라인에서 마이그레이션 적용 후 타입 재생성 → 타입 체크 → 빌드 순으로 실행하여 스키마 변경이 프론트엔드 빌드를 깨뜨리지 않도록 보장한다.

**디렉터리 구조 예시:**

```
moment-stock/
├── supabase/
│   ├── migrations/       # SQL 마이그레이션 파일
│   ├── functions/        # Edge Functions
│   └── config.toml       # Supabase 프로젝트 설정
├── packages/
│   └── shared/
│       └── src/types/
│           └── database.types.ts  # 자동 생성된 DB 타입
├── apps/
│   ├── web/              # Next.js
│   └── mobile/           # Expo
```

### Engine Designer 의견

> 이 문서의 핵심 도메인 오너로서 가장 상세한 의견을 제시한다.

**재고 분리 설계의 근거:**

`stocks` 테이블을 `products`에서 분리한 것은 단순히 정규화가 아니라 **동시성 성능**을 위한 결정이다. PostgreSQL의 MVCC 특성상 UPDATE가 발생하면 해당 행의 새 버전이 생성된다. 상품 정보와 재고가 같은 행에 있으면, 재고 갱신마다 상품 정보까지 복사되어 불필요한 I/O가 발생한다. 분리함으로써 재고 행의 크기를 최소화하고 `HOT(Heap-Only Tuple)` 업데이트 가능성을 높인다.

**단일 UPDATE 문의 원자성 활용:**

`UPDATE ... SET quantity = quantity - 1 WHERE product_id = $1 AND quantity > 0`은 PostgreSQL에서 행 레벨 락을 암묵적으로 획득하므로 `SELECT FOR UPDATE`를 별도로 사용할 필요가 없다. 이 패턴은 락 획득 → 조건 검증 → 값 수정을 하나의 원자적 연산으로 처리한다.

**CHECK 제약조건의 역할:**

`CHECK (quantity >= 0)`은 RPC 로직의 버그가 있더라도 DB 레벨에서 음수 재고를 물리적으로 불가능하게 만든다. 이중 안전장치(Defense in Depth) 전략이다.

**CDC 설정 시 주의사항:**

`stocks` 테이블에 Supabase Realtime(CDC)을 활성화할 때, `REPLICA IDENTITY FULL`을 설정하여 변경 전후의 전체 행 데이터를 브로드캐스트해야 한다. 기본값인 `REPLICA IDENTITY DEFAULT`는 PK만 전달하므로 프론트엔드에서 추가 쿼리가 필요해진다.

**인덱스 과잉 방지:**

타임 세일 시나리오에서 `stocks` 테이블의 행 수는 상품 수와 동일하므로(수천~수만 건 수준) 풀 스캔도 충분히 빠르다. 인덱스 최적화는 `orders`와 같이 지속 증가하는 테이블에 집중해야 한다.

### Sync Master 의견

**Realtime 활성화 대상 테이블:**

| 테이블 | Realtime 활성화 | 이유 |
|--------|----------------|------|
| stocks | O | 재고 변경을 모든 클라이언트에 실시간 전파 (핵심) |
| time_sales | O | 타임 세일 시작/종료 상태 변경을 전파 |
| waitlist | X | 개인별 데이터이므로 Realtime 대신 개별 폴링 또는 RPC 결과로 처리 |
| orders | X | 개인 주문 데이터이므로 Realtime 불필요. TanStack Query 캐시 무효화로 처리 |
| products | X | 상품 정보는 자주 변경되지 않으므로 ISR + 캐시 무효화로 충분 |

**CDC 이벤트 최소화 전략:**

- `stocks` 테이블의 CDC는 `UPDATE` 이벤트만 구독한다 (INSERT/DELETE는 운영 시에만 발생).
- 프론트엔드에서는 Supabase Realtime 채널을 `product_id` 필터로 세분화하여, 현재 보고 있는 상품의 재고 변경만 수신한다.
- 클라이언트 측에서 `requestAnimationFrame` 기반 스로틀링으로 수신 이벤트가 폭주해도 렌더링 빈도를 제한한다.

**이벤트 페이로드 형태 (CDC):**

```json
{
  "type": "UPDATE",
  "table": "stocks",
  "schema": "public",
  "record": {
    "id": "uuid",
    "product_id": "uuid",
    "quantity": 42,
    "initial_quantity": 100,
    "updated_at": "2026-03-26T10:30:00Z"
  },
  "old_record": {
    "quantity": 43
  }
}
```

### UI Artisan 의견

**프론트엔드가 필요로 하는 데이터 형태:**

타임 세일 목록 화면에서 최적의 렌더링을 위해 API 응답은 다음 형태가 이상적이다:

```typescript
interface TimeSaleItem {
  productId: string;
  productName: string;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  currentStock: number;       // 현재 잔여 재고
  initialStock: number;       // 초기 재고 (프로그레스 바 계산용)
  stockPercentage: number;    // 재고 비율 (시각적 긴급도 표시)
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}
```

**시각적 긴급도(Visual Urgency) 표현을 위한 필드:**

- `stockPercentage` = `currentStock / initialStock * 100`: 프로그레스 바의 채움 비율로 사용
- `currentStock <= 5`일 때 "마감 임박" 뱃지 표시를 위해 프론트엔드에서 임계값 판단
- `endsAt`을 기준으로 카운트다운 타이머 렌더링

**페이지네이션 전략:**

- 타임 세일 목록: 활성 세일 수가 제한적이므로 전체 조회 (페이지네이션 불필요)
- 주문 내역: 커서 기반 페이지네이션 (`created_at` + `id` 복합 커서) 적용
- 상품 목록: 오프셋 기반 페이지네이션 (관리자 화면 등 정렬 변경이 잦은 경우)

---

## 8. 데이터 흐름: 구매 트랜잭션

타임 세일 상품 구매 시 클라이언트에서 DB까지의 전체 트랜잭션 흐름이다.

### 단계별 흐름

```
[클라이언트]                    [Edge Function]              [PostgreSQL]
    │                               │                            │
    ├─ 1. 구매 버튼 클릭             │                            │
    ├─ 2. Optimistic UI 반영        │                            │
    │    (재고 -1 즉시 표시)          │                            │
    ├─ 3. Edge Function 호출 ──────>│                            │
    │                               ├─ 4. 사용자 인증 검증         │
    │                               ├─ 5. 결제 처리 (외부 PG) ──> │ (외부)
    │                               │    <── 결제 결과 수신         │
    │                               ├─ 6. purchase_stock RPC ──>│
    │                               │                            ├─ 7. UPDATE stocks
    │                               │                            │    SET quantity = quantity - 1
    │                               │                            │    WHERE product_id = $1
    │                               │                            │    AND quantity > 0
    │                               │                            │
    │                               │                            ├─ 8. 영향 행 확인
    │                               │                            │    ├─ 0행: 재고 부족 → 롤백
    │                               │                            │    └─ 1행: INSERT orders
    │                               │                            │
    │                               │    <── RPC 결과 반환 ────────┤
    │                               │                            │
    │    <── 응답 반환 ──────────────┤                            │
    │                               │                            │
    ├─ 9. 성공: UI 확정              │                            │
    │    실패: Optimistic UI 롤백    │                            │
    │                               │                            │
    │                            [Supabase Realtime]             │
    │                               │    <── CDC 이벤트 ──────────┤
    │    <── 10. 재고 변경 브로드캐스트 │                            │
    │                               │                            │
    ├─ 11. 모든 클라이언트           │                            │
    │    재고 UI 실시간 갱신          │                            │
```

### 단계 설명

| 단계 | 주체 | 설명 |
|------|------|------|
| 1 | 클라이언트 | 사용자가 구매 버튼을 클릭한다 |
| 2 | 클라이언트 | TanStack Query의 Optimistic Update로 재고를 즉시 차감 표시한다 |
| 3 | 클라이언트 | Supabase Edge Function을 호출한다 |
| 4 | Edge Function | JWT를 검증하여 인증된 사용자인지 확인한다 |
| 5 | Edge Function | 외부 PG사에 결제를 요청하고 결과를 수신한다 |
| 6 | Edge Function | 결제 성공 시 `purchase_stock` RPC를 호출한다 |
| 7 | PostgreSQL | 원자적 UPDATE로 재고를 차감한다. `CHECK (quantity >= 0)` 제약이 최종 방어선이다 |
| 8 | PostgreSQL | 영향 받은 행 수로 성공/실패를 판단하고, 성공 시 주문을 생성한다 |
| 9 | 클라이언트 | 성공이면 UI를 확정하고, 실패면 Optimistic Update를 롤백한다 |
| 10 | Supabase Realtime | `stocks` 테이블의 CDC 이벤트가 모든 구독 클라이언트에 브로드캐스트된다 |
| 11 | 모든 클라이언트 | 실시간 이벤트를 수신하여 재고 UI를 갱신한다 (100ms 이내 목표) |

### 실패 시나리오

| 실패 지점 | 처리 방식 |
|-----------|-----------|
| 결제 실패 (5단계) | Edge Function이 에러 반환 → 클라이언트 Optimistic UI 롤백 |
| 재고 부족 (7단계) | RPC가 에러 반환 → Edge Function이 결제 취소 요청 → 클라이언트 롤백 |
| 네트워크 오류 | 클라이언트 타임아웃 후 주문 상태 조회 → 상태에 따라 재시도 또는 롤백 |
| CDC 전파 지연 | 클라이언트의 Optimistic Update가 즉시 반영되어 있으므로 UX 영향 최소화 |
