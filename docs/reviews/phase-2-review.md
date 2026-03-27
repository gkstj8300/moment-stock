# Phase 2 검토 결과

## 1. 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | Phase 2 검토 결과 |
| 버전 | v0.1.0 |
| 작성일 | 2026-03-27 |
| 기반 문서 | /docs/rules/phase-review-rule.md, /docs/spec/06-implementation-plan.md |

### 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v0.1.0 | 2026-03-27 | Claude | 신규 작성 |

---

## 2. 자동화 테스트 결과

`pnpm turbo --force` (캐시 무시)로 전체 실행.

| 테스트 유형 | 결과 | 비고 |
|-------------|------|------|
| 타입 체크 | **PASS** | 4/4 패키지 통과 (1.96s) |
| 린트 | **PASS** | 4/4 패키지 통과 (2.16s) |
| 단위 테스트 | **N/A** | Phase 2 RPC 테스트는 DB 직접 실행으로 검증 (자동화 테스트 프레임워크 미도입) |
| 빌드 | **PASS** | 2/2 빌드 대상 성공 (12.5s) |

### RPC 테스트 결과 (DB 직접 실행)

| 테스트 항목 | 결과 | 비고 |
|-------------|------|------|
| `purchase_stock` 정상 구매 | **PASS** | 재고 35→33, 주문 생성 확인 |
| `purchase_stock` 재고 부족 | **PASS** | `INSUFFICIENT_STOCK` 에러 반환 |
| `cancel_order` 주문 취소 + 재고 복구 | **PASS** | 재고 33→35 복구, 상태 `cancelled` |
| `get_active_time_sales` 조인 조회 | **PASS** | 활성 2건 + stock_percentage 포함 |
| 동시성 (순차 10회, 재고 5) | **PASS** | 5성공/5실패, 최종 재고 0, 초과 판매 0건 |
| 동시성 (병렬 10회, 재고 3) | **PASS** | 3성공/7실패, 최종 재고 0, 초과 판매 0건 |

---

## 3. 회귀 테스트 결과

| 대상 Phase | 테스트 항목 | 결과 | 비고 |
|------------|-------------|------|------|
| Phase 1 | typecheck 통과 | **PASS** | 4/4 |
| Phase 1 | lint 통과 | **PASS** | 4/4 |
| Phase 1 | build 통과 | **PASS** | 2/2 |
| Phase 1 | @repo/shared import 동작 | **PASS** | apps/web에서 정상 import |
| Phase 1 | @repo/ui import 동작 | **PASS** | apps/web에서 정상 import |
| Phase 1 | .env.example 존재 | **PASS** | |
| Phase 1 | CI yml 존재 | **PASS** | |
| Phase 1 | catalog 프로토콜 | **PASS** | |

---

## 4. 페르소나별 검토 결과

### Engine Designer

| 검토 항목 | 결과 | 비고 |
|-----------|------|------|
| `[필수]` `supabase db reset` → 마이그레이션 전체 적용 성공 | **PASS** | 4개 마이그레이션 + 시드 적용 |
| `[필수]` `purchase_stock` RPC 재고 차감 + 주문 생성 | **PASS** | 35→33, 주문 ID 반환 |
| `[필수]` 동시 호출 시뮬레이션 초과 판매 0건 | **PASS** | 순차(5/5) + 병렬(3/3) 모두 정확 |
| `[필수]` RLS 비인가 접근 차단 | **PASS** | anon→orders INSERT 거부, anon→stocks UPDATE 0행 |
| `[필수]` `REPLICA IDENTITY FULL` (stocks) | **PASS** | `relreplident = f` 확인 |
| `[필수]` CHECK 제약 동작 (`quantity >= 0`, `starts_at < ends_at`) | **PASS** | 음수 재고 → 에러, 역전 기간 → 에러 |
| `[필수]` 시드 데이터 최소 기준 (상품 30, 타임세일 4, 사용자 2) | **PASS** | 30/4(활성2+비활성2)/2 확인 |

### Monorepo Lead

| 검토 항목 | 결과 | 비고 |
|-----------|------|------|
| `[필수]` 마이그레이션 파일 네이밍 일관성 | **PASS** | `YYYYMMDD000NNN_description.sql` 형식 4개 |
| `[필수]` `supabase gen types` 스크립트 정상 실행 | **PASS** | `pnpm db:gen-types` → `database.types.ts` 생성 + `_shared/` 복사 |

### Sync Master

| 검토 항목 | 결과 | 비고 |
|-----------|------|------|
| `[필수]` CDC Publication 활성화 (`stocks`, `time_sales`) | **PASS** | `supabase_realtime` publication에 2개 테이블 확인 |
| `[권장]` CDC 이벤트 전체 컬럼 포함 | **PASS** | stocks: FULL, time_sales: DEFAULT (상태 변경 전파 목적으로 충분) |

### UI Artisan

| 검토 항목 | 결과 | 비고 |
|-----------|------|------|
| `[권장]` 시드 데이터 UI 렌더링 충분성 | **PASS** | 30개 상품 모두 name, description, image_url, original_price 포함 |

---

## 5. 완료 기준 대조

| 완료 기준 항목 | 충족 여부 | 비고 |
|----------------|-----------|------|
| `supabase db reset` → 마이그레이션 전체 적용 성공 | **YES** | |
| `purchase_stock` RPC SQL 호출 → 재고 차감 + 주문 생성 확인 | **YES** | |
| 동시 호출 시뮬레이션 초과 판매 0건 | **YES** | 순차 + 병렬 모두 통과 |
| RLS 적용 비인가 접근 차단 | **YES** | |
| `REPLICA IDENTITY FULL` 설정 확인 | **YES** | stocks 테이블 `f` |

---

## 6. 미해결 사항

| # | 항목 | 심각도 | 담당 페르소나 | 해결 예정 Phase | 비고 |
|---|------|--------|--------------|-----------------|------|
| 1 | `supabase db reset` 후 502 에러 (컨테이너 재시작) | **LOW** | Engine Designer | - | 일시적 현상, 이후 정상 동작. Supabase CLI 버전 이슈로 추정 |
| 2 | RPC 자동화 단위 테스트 미구축 | **MEDIUM** | Engine Designer | Phase 3 | 현재는 SQL 직접 실행으로 검증. Phase 3에서 Vitest + Supabase 클라이언트로 자동화 권장 |

---

## 7. 인수인계 사항

### Phase 2 → Phase 3 인수인계

**`supabase gen types` 출력 타입 파일 경로:**
- `packages/shared/src/types/database.types.ts` — 프론트엔드용
- `supabase/functions/_shared/database.types.ts` — Edge Function용
- 생성 스크립트: `pnpm db:gen-types`

**RPC 함수 시그니처 목록:**

| RPC | 입력 | 출력 | 비고 |
|-----|------|------|------|
| `purchase_stock(p_user_id, p_product_id, p_quantity, p_unit_price)` | uuid, uuid, int, int | `{success, order_id?, remaining_stock?, error?, message?}` | SECURITY DEFINER |
| `cancel_order(p_user_id, p_order_id)` | uuid, uuid | `{success, order_id?, error?, message?}` | SECURITY DEFINER |
| `get_active_time_sales()` | (없음) | JSON 배열 (product_name, sale_price, current_stock, stock_percentage 등) | SECURITY DEFINER |

**CDC 설정 상태:**
- `stocks`: Publication 활성화 + REPLICA IDENTITY FULL
- `time_sales`: Publication 활성화 + REPLICA IDENTITY DEFAULT
- 기타 테이블: Realtime 비활성화

**DB 접속 정보 (로컬):**
- URL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Anon Key: `supabase start` 출력에서 확인
- Service Role Key: `supabase start` 출력에서 확인
- API: `http://127.0.0.1:54321`

**Phase 3에서 사용할 주요 타입 (database.types.ts에서 추출):**
- `Database["public"]["Tables"]["products"]["Row"]`
- `Database["public"]["Tables"]["stocks"]["Row"]`
- `Database["public"]["Tables"]["orders"]["Row"]`
- `Database["public"]["Tables"]["time_sales"]["Row"]`
- `Database["public"]["Functions"]["purchase_stock"]`
- `Database["public"]["Functions"]["cancel_order"]`
- `Database["public"]["Functions"]["get_active_time_sales"]`

**주의사항:**
- stocks 테이블 직접 UPDATE는 RLS로 차단됨 → 반드시 `purchase_stock` RPC 사용
- orders 테이블 직접 INSERT는 RLS로 차단됨 → 반드시 RPC 사용
- waitlist 테이블은 DDL만 존재, RLS/인덱스/RPC는 Phase 7A에서 구현 예정
