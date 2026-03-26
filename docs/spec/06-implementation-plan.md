# 구현 계획서

## 1. 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 구현 계획서 |
| 버전 | v0.2.0 |
| 작성일 | 2026-03-26 |
| 기반 문서 | /docs/spec/01-system-architecture.md, /docs/spec/02-monorepo-structure.md, /docs/spec/03-database-design.md, /docs/spec/04-realtime-sync.md, /docs/spec/05-frontend-architecture.md |

### 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v0.1.0 | 2026-03-26 | Claude | 신규 작성 |
| v0.2.0 | 2026-03-26 | Claude | 페르소나 검토 결과 반영: Phase 1 공통 설정 추가, Phase 2 RPC 배치 조정 및 REPLICA IDENTITY 설정 추가, Phase 3 설정 주입 구조·디자인 토큰 배치 변경, Phase 4 긴박감 UI 껍데기·접근성·반응형 추가, Phase 5 구독 레지스트리·측정 방법 추가, Phase 6 Tamagui 토큰 매핑·접근성 추가, Phase 7 RPC 이동(confirm_payment·admit_from_waitlist), orders Realtime 제거, 리스크 항목 추가 |
| v0.3.0 | 2026-03-26 | Claude | 페르소나 교차 토론 결과 반영: Phase 2 waitlist 테이블 Phase 7 이관, Phase 3 스코프 축소(Realtime 훅→Phase 5), Supabase 클라이언트 서버/브라우저 분리 명시, Phase 7 분할(7A 타임세일+결제, 7B 모바일고급), Phase 각 단위 테스트 분산, Edge Function 타입 import 전략 추가, 리스크 항목 추가 |

---

## 2. 구현 전략 개요

### 원칙

- **의존 방향 순서**: 하위 계층(DB → 공유 패키지 → 앱)부터 구축하여 상위 계층이 항상 안정된 기반 위에서 작업한다.
- **수직 슬라이스 검증**: 각 Phase 종료 시 해당 Phase의 산출물만으로 동작하는 최소 검증이 가능해야 한다.
- **병렬 가능 구간 활용**: Phase 내에서 독립적인 작업은 페르소나별로 병렬 진행한다.
- **접근성 동시 구현**: 접근성(a11y)은 별도 Phase로 미루지 않고 각 UI 구현 시점에 함께 처리한다.

### Phase 구성 요약

| Phase | 명칭 | 목표 | 주도 페르소나 |
|-------|------|------|---------------|
| 1 | 프로젝트 기반 구축 | 모노레포 스캐폴딩 + Supabase 프로젝트 초기화 | Monorepo Lead |
| 2 | 데이터베이스 구축 | 스키마, 핵심 RPC, RLS, 인덱스 완성 | Engine Designer |
| 3 | 공유 패키지 구축 | @repo/shared 타입·훅·유틸 + @repo/ui 디자인 토큰·프리미티브 | Sync Master, Monorepo Lead |
| 4 | 웹 앱 코어 구현 | Next.js 핵심 페이지 + ISR/SSR + 긴박감 UI 껍데기 | UI Artisan |
| 5 | 실시간 동기화 통합 | Realtime CDC 연결 + 낙관적 업데이트 + 스로틀링 | Sync Master |
| 6 | 모바일 앱 구현 | Expo 핵심 화면 + 네이티브 기능 | UI Artisan |
| 7A | 타임 세일 + 결제 + 대기열 | 타임 세일 비즈니스 로직, 결제 Edge Function, 대기열 시스템 | Engine Designer, Sync Master |
| 7B | 모바일 고급 기능 | 푸시 알림, 오프라인 복구, 생체 인증 | UI Artisan, Sync Master |
| 8 | 최적화 및 안정화 | 성능 튜닝, E2E 테스트, 배포 준비 | 전체 |

---

## 3. Phase 1 — 프로젝트 기반 구축

### 목표

모노레포 구조를 확립하고, 모든 패키지가 빌드·린트·타입체크를 통과하는 빈 스캐폴드를 완성한다.

### 산출물

- TurboRepo + pnpm workspace 설정 완료
  - `pnpm-workspace.yaml` 워크스페이스 정의
  - `turbo.json` 태스크 정의 (TurboRepo v2 `tasks` 키 사용: build, lint, typecheck, test, dev)
  - pnpm `catalog:` 프로토콜로 핵심 의존성 버전 통일 (Supabase SDK, TanStack Query, Zustand, Zod 등)
- `apps/web` (Next.js 14 App Router) 빈 프로젝트
- `apps/mobile` (Expo) 빈 프로젝트
- `packages/shared` (@repo/shared) 초기 구조 — 빈 진입점 + package.json
- `packages/ui` (@repo/ui) 초기 구조 — 디자인 토큰 + 프리미티브 배치 예정
- `packages/tsconfig` (@repo/tsconfig) — base.json, nextjs.json, expo.json
- `packages/eslint-config` (@repo/eslint-config) — ESLint + Prettier 공유 설정
- `supabase/` 디렉터리 + Supabase CLI 설정 (`config.toml`)
- `.env` 관리 전략: `.env.example` 템플릿 + `.gitignore` 패턴 확정 (`.env*.local` 제외)
- CI 기본 설정 (GitHub Actions): install → typecheck → lint → build

### 완료 기준

- `pnpm install` → `pnpm turbo build` → 전체 패키지 빌드 성공
- `pnpm turbo lint` → 전체 패키지 린트 통과 (공유 ESLint 설정 적용 확인)
- `apps/web`: `localhost:3000`에 빈 페이지 렌더링
- `apps/mobile`: Expo Go에서 빈 화면 렌더링
- `packages/shared`에서 export한 더미 함수를 `apps/web`에서 import하여 사용 가능
- CI 파이프라인 정상 실행 확인

---

## 4. Phase 2 — 데이터베이스 구축

### 목표

Supabase PostgreSQL에 전체 스키마를 구축하고, 핵심 RPC와 보안 정책을 완성한다.

### 산출물

- **마이그레이션 파일**: `profiles`, `products`, `stocks`, `orders`, `time_sales` 테이블 + `waitlist` 테이블 DDL만 (RLS·인덱스·RPC는 Phase 7A로 이관)
- **제약 조건**:
  - `stocks`: `CHECK (quantity >= 0)`
  - `time_sales`: `CHECK (starts_at < ends_at)`
  - `waitlist`: `UNIQUE (time_sale_id, user_id)`
- **RPC 함수 (이 Phase에서 구현하는 것만)**:
  - `purchase_stock` — 원자적 재고 차감 + 주문 생성
  - `cancel_order` — 주문 취소 + 재고 복구
  - `get_active_time_sales` — 활성 타임 세일 목록 조회
- **RPC 함수 (Phase 7로 이관)**:
  - `confirm_payment` — 결제 검증 Edge Function과 함께 구현
  - `admit_from_waitlist` — 대기열 시스템과 함께 구현
- **RLS 정책**: 테이블별 SELECT/INSERT/UPDATE 권한
- **인덱스**: 고트래픽 대응 필수 인덱스 (설계문서 03 기준)
- **Realtime 설정**:
  - `stocks`, `time_sales` 테이블 CDC Publication 활성화
  - `stocks` 테이블 `REPLICA IDENTITY FULL` 설정 (CDC 이벤트에 전체 행 데이터 포함)
- **시드 데이터**:
  - 상품 + 재고: 최소 30건 (목록 페이지네이션 검증용)
  - 타임 세일: 활성/비활성 각 2건 이상 (Phase 5 Realtime 테스트용)
  - 테스트 사용자: 2명 이상 (RLS 검증용)
  - `supabase gen types` → `supabase/functions/_shared/database.types.ts` 복사 스크립트
- **테스트**: `purchase_stock` RPC 단위 테스트 + pgbench 동시 호출 시뮬레이션

### 완료 기준

- `supabase db reset` → 마이그레이션 전체 적용 성공
- `purchase_stock` RPC를 SQL로 직접 호출하여 재고 차감 및 주문 생성 확인
- 동시 호출 시뮬레이션(pgbench 등)에서 초과 판매 0건 확인
- RLS 적용 상태에서 비인가 접근 차단 확인
- `REPLICA IDENTITY FULL` 설정 확인: CDC 이벤트에 `quantity`, `initial_quantity` 등 전체 컬럼 포함

### 선행 조건

- Phase 1 완료 (supabase/ 디렉터리 존재)

---

## 5. Phase 3 — 공유 패키지 구축

### 목표

`@repo/shared`에 타입 정의, API 훅, 상태 관리 스토어를 구축하고, `@repo/ui`에 디자인 토큰과 플랫폼 무관 프리미티브를 배치하여 웹과 앱이 동일한 비즈니스 로직과 시각적 일관성을 공유할 수 있게 한다.

### 산출물

**@repo/shared:**

- **타입 계층**: `supabase gen types` 자동 생성 → `types/server.ts` → `types/entities.ts` (UI 모델) → `types/api.ts` (Request/Response)
- **Supabase 클라이언트**: 서버/브라우저 분리 팩토리 — `createServerClient`(Next.js RSC/SSR용), `createBrowserClient`(브라우저/Expo용, AsyncStorage 어댑터 주입 가능)
- **Zod 스키마**: 구매 요청, 로그인 폼 등 유효성 검증
- **TanStack Query 훅**: `useProducts`, `useProductDetail`, `usePurchaseMutation`, `useOrders` (Realtime 구독 훅은 Phase 5로 이관)
  - 플랫폼별 설정 주입 구조: `QueryClientConfig`를 팩토리 함수의 인자로 받아 각 앱에서 `staleTime`, `refetchOnWindowFocus` 등을 오버라이드할 수 있도록 설계
- **Query Key 팩토리**: 도메인별 쿼리 키 중앙 관리 (`productKeys`, `orderKeys`, `timeSaleKeys`)
- **Zustand 스토어**: `cartStore`, `connectionStore`
- **유틸리티**: 가격 포맷, 재고 상태 판단 (`getStockLevel`), 날짜 계산, 할인율 계산
- **테스트**: 유틸리티 함수 단위 테스트, Zod 스키마 검증 테스트

**@repo/ui:**

- **디자인 토큰**: `src/tokens.ts`에 색상 팔레트, 간격 스케일, 타이포그래피, 그림자 등을 TypeScript 상수로 정의 — Tailwind·Tamagui 양쪽의 단일 소스
- **플랫폼 무관 프리미티브**: `Text`, `View` 등 래퍼 컴포넌트 (선택적, 필요 시 Phase 4·6에서 점진적 추가)

### 완료 기준

- `@repo/shared`를 `apps/web`에서 import하여 타입 체크 통과
- TanStack Query 훅으로 Supabase에서 상품 목록 조회 성공
- Zustand 스토어의 장바구니 상태 관리 동작 확인
- `@repo/ui/src/tokens.ts`의 디자인 토큰을 `apps/web`에서 import 가능
- Query 훅의 플랫폼별 설정 오버라이드 동작 확인

### 선행 조건

- Phase 2 완료 (DB 스키마 → 타입 생성 의존)

---

## 6. Phase 4 — 웹 앱 코어 구현

### 목표

Next.js 14 App Router 기반 핵심 페이지를 구현하고, ISR/SSR 렌더링 전략을 적용하며, 긴박감 UI 컴포넌트의 기본 구조를 잡는다.

### 산출물

- **페이지 구현**:
  - 홈: 타임세일 배너 + 상품 목록 (ISR)
  - 상품 목록: 필터/정렬 + 페이지네이션 (ISR + CSR)
  - 상품 상세: 상품 정보(ISR) + 재고 표시(CSR 영역 준비)
  - 장바구니: 클라이언트 상태 기반
  - 주문 내역: SSR
- **공통 레이아웃**: 헤더, 푸터, 네비게이션
- **인증 연동**: Supabase Auth (로그인/회원가입/로그아웃)
- **미들웨어**: 인증 리다이렉트, 보호 라우트
- **디자인 토큰 적용**: `@repo/ui/src/tokens.ts`에서 토큰 import → `tailwind.config.ts` 테마로 변환하여 적용
- **긴박감 UI 컴포넌트 껍데기** (Phase 5에서 실시간 데이터 연결 예정):
  - 카운트다운 타이머 컴포넌트
  - 재고 게이지 바 컴포넌트 (잔량 비율에 따른 색상 변화: 초록 → 노랑 → 빨강)
  - 희소성 뱃지 컴포넌트 ("마지막 3개!", "곧 품절")
  - 재고 숫자 표시 컴포넌트 (React.memo 분리)
- **반응형 레이아웃**: 모바일(360px) → 태블릿(768px) → 데스크톱(1280px) 3단계 브레이크포인트
- **접근성 기본 적용**:
  - 모든 인터랙티브 요소에 ARIA 레이블
  - 터치 타겟 최소 44x44px
  - 키보드 네비게이션 지원
  - `prefers-reduced-motion` 미디어 쿼리 대응 (애니메이션 비활성화 분기)

### 완료 기준

- 각 페이지에서 Supabase 데이터 렌더링 확인 (시드 데이터 기반)
- ISR 페이지가 빌드 타임에 정적 생성되고 revalidate 동작 확인
- 로그인/로그아웃 플로우 정상 동작
- 긴박감 UI 컴포넌트 상태별 검증:
  - 재고 게이지 바: 100%/50%/10%/0% 각 상태에서 올바른 색상(초록/노랑/빨강/회색) 표시
  - 카운트다운 타이머: 더미 종료 시각까지 정상 카운트다운
  - 희소성 뱃지: 재고 5개/3개/0개 조건에서 올바른 텍스트 표시
- 반응형 레이아웃: 360px, 768px, 1280px 각 뷰포트에서 레이아웃 정상 확인
- RLS 재검증: 실제 Supabase Auth 세션으로 로그인한 사용자의 데이터 접근 권한 확인 (본인 주문만 조회 가능 등)
- Lighthouse 접근성 점수 80+ 이상

### 선행 조건

- Phase 3 완료 (공유 훅·타입·디자인 토큰 의존)

---

## 7. Phase 5 — 실시간 동기화 통합

### 목표

Supabase Realtime CDC를 클라이언트에 연결하고, 재고 변화가 100ms 이내에 UI에 반영되는 실시간 파이프라인을 완성한다.

### 산출물

- **Realtime 구독 훅**: `useRealtimeStock(productId)` — @repo/shared에 구현
- **구독 레지스트리**: 참조 카운팅 방식으로 동일 채널 중복 구독 방지. 참조 카운트가 0이 되면 채널 해제.
- **이벤트 스로틀링**: requestAnimationFrame 기반 배칭 유틸리티
  - 품절 이벤트(`quantity = 0`)는 스로틀링 우회하여 즉시 반영
- **낙관적 업데이트**: 구매 뮤테이션의 `onMutate` → `onError` 롤백 → `onSettled` 확정
  - 뮤테이션 진행 중 도착하는 Realtime 이벤트는 `onSettled` 완료까지 반영 지연 (UI 깜빡임 방지)
- **채널 관리**: `product-stock:{id}`, `time-sale:{id}`
  - ※ `order-status` 채널은 제외: 주문 상태는 뮤테이션 응답 + TanStack Query 캐시 무효화로 처리 (설계문서 03 Sync Master 의견 반영)
- **구독 생명주기**: 컴포넌트 마운트/언마운트 시 자동 구독/해제 (구독 레지스트리 연동)
- **연결 상태 관리**:
  - Zustand `connectionStore`에 WebSocket 상태 반영
  - 온라인/오프라인 배너 UI (웹)
  - 오프라인 시 구매 버튼 비활성화 + "네트워크 연결을 확인해주세요" 메시지
- **긴박감 UI 컴포넌트 실시간 연결**: Phase 4에서 만든 껍데기에 실제 Realtime 데이터 바인딩
  - 재고 숫자 롤링 애니메이션 (`requestAnimationFrame` 기반)
  - `prefers-reduced-motion` 사용자: 즉시 값 변경으로 대체
- **테스트**: 구독 레지스트리 단위 테스트, 스로틀링 유틸 단위 테스트, 낙관적 업데이트 롤백 통합 테스트

### 완료 기준

- 브라우저 2개를 열고, 한쪽에서 구매 시 다른 쪽의 재고 숫자가 변경됨
  - 측정 방법: CDC 이벤트의 `updated_at` 타임스탬프와 클라이언트 `setQueryData` 호출 시점의 `performance.now()` 차이를 콘솔에 기록하여 100ms 이내 확인
- 구매 클릭 즉시 UI 재고 차감 → 서버 실패 시 원래 값으로 롤백
- 동일 상품을 2개 컴포넌트에서 동시 구독 시 채널 1개만 생성됨 (구독 레지스트리 검증)
- 고빈도 업데이트(1초 10회 이상) 시 60fps 유지 (Chrome DevTools Performance 탭으로 확인)
- 네트워크 차단 → 복구 시 최신 재고로 자동 갱신
- 품절 이벤트 즉시 반영: 재고 1→0 변경 시 스로틀링 없이 즉시 "품절" 표시

### 선행 조건

- Phase 2 (CDC Publication + REPLICA IDENTITY 설정)
- Phase 3 (TanStack Query 훅 + 설정 주입 구조)
- Phase 4 (재고 표시 UI + 긴박감 컴포넌트)

---

## 8. Phase 6 — 모바일 앱 구현

### 목표

Expo 기반 모바일 앱의 핵심 화면을 구현하고, 웹과 동일한 비즈니스 로직(@repo/shared)을 공유한다.

### 산출물

- **화면 구현**: 홈, 상품 목록, 상품 상세, 장바구니, 주문 내역
- **네비게이션**: Expo Router (Tab + Stack)
- **디자인 토큰 매핑**: `@repo/ui/src/tokens.ts`에서 토큰 import → `tamagui.config.ts` 테마로 변환
- **스타일링**: Tamagui 기반 컴포넌트 (웹과 컴포넌트 코드는 공유하지 않되, 동일 디자인 토큰으로 시각적 일관성 유지)
- **인증 연동**: Supabase Auth + SecureStore 토큰 저장
- **실시간 동기화**: @repo/shared의 Realtime 훅 재사용
  - TanStack Query 설정 오버라이드: 앱 포그라운드 복귀 시 리패치, 앱 전용 `staleTime`/`gcTime` 적용
- **Realtime 연결 PoC**: Phase 6 초기에 Expo + Supabase Realtime WebSocket 연결 확인 (호환성 검증)
- **접근성 기본 적용**:
  - 모든 인터랙티브 요소에 `accessibilityLabel` 적용
  - 터치 타겟 최소 44x44pt
  - 스크린 리더(VoiceOver/TalkBack) 기본 호환

### 완료 기준

- 웹과 동일한 상품 데이터 조회 및 구매 플로우 동작
- @repo/shared 훅 재사용률 확인 (타입·훅·유틸 공유)
- 실시간 재고 업데이트 앱에서 동작 확인
- Tamagui 테마가 `@repo/ui` 디자인 토큰과 일치하는지 시각적 검증
- RLS 재검증: 앱에서 SecureStore 기반 Auth 세션으로 데이터 접근 권한 확인

### 선행 조건

- Phase 3 (공유 패키지 + 디자인 토큰)
- Phase 5 (실시간 동기화 — 훅 재사용)

---

## 9. Phase 7A — 타임 세일 + 결제 + 대기열

### 목표

타임 세일 비즈니스 로직을 완성하고, 결제 검증 Edge Function과 대기열 시스템을 구현한다.

### 산출물

- **타임 세일 시스템**: 세일 생성/종료, 카운트다운 타이머 실시간 연결, 할인 가격 적용
- **결제 검증**:
  - RPC: `confirm_payment` — 이 Phase에서 구현
  - Edge Function에서 결제 유효성 검증 후 `purchase_stock` RPC 호출
  - Edge Function이 직접 `UPDATE stocks`를 실행하는 경로 차단 — 반드시 RPC를 통해서만 재고 차감
  - Edge Function 타입 공유: `supabase gen types` → `supabase/functions/_shared/database.types.ts`에 복사
- **대기열 시스템 (Waitlist)**:
  - 추가 마이그레이션: `waitlist` RLS 정책, 인덱스, `admit_from_waitlist` RPC
  - 트래픽 폭주 시 가상 대기열 → 순번 표시 → 입장 허가
- **테스트**: 결제 검증 통합 테스트, 대기열 순번 진행 테스트

### 완료 기준

- 타임 세일 활성화 → 할인가 표시 → 카운트다운 → 세일 종료 플로우 동작
- 결제 검증 Edge Function → `purchase_stock` RPC → 주문 확정 → `confirm_payment` 전체 플로우 동작
- 대기열 진입 → 순번 감소 → 입장 허가 → 타임 세일 페이지 이동

### 선행 조건

- Phase 5 (실시간 동기화)

---

## 10. Phase 7B — 모바일 고급 기능

### 목표

모바일 전용 고급 기능(푸시 알림, 오프라인 복구, 생체 인증)을 구현한다.

### 산출물

- **푸시 알림**: Supabase Edge Function + FCM 연동, 재고 임박(5개 미만) 알림
- **오프라인 복구 (모바일 전용)**: AsyncStorage 캐시 + 재연결 시 자동 재동기화 + 로컬 큐 순차 전송
  - 웹의 오프라인 처리(배너 + 구매 차단)는 Phase 5에서 완료됨
- **생체 인증**: FaceID/지문 연동 간편 결제 (PIN 폴백 포함)
- **테스트**: 오프라인→온라인 재동기화 통합 테스트, 푸시 알림 수신 테스트

### 완료 기준

- 앱 푸시 알림 수신 확인 (재고 임박 트리거)
- 모바일: 네트워크 차단 후 복구 시 앱 데이터 정합성 확인
- 생체 인증 → 결제 확인 → 주문 생성 플로우 동작

### 선행 조건

- Phase 6 (모바일 앱 기본 화면)
- Phase 7A (결제 검증 Edge Function — 생체 인증 결제에 필요)

---

## 11. Phase 8 — 최적화 및 안정화

### 목표

전체 시스템의 성능을 튜닝하고, 테스트를 강화하며, 배포를 준비한다.

### 산출물

- **성능 최적화**:
  - 웹: Lighthouse 성능 점수 90+ 목표, 번들 사이즈 분석 및 최적화
  - 앱: 렌더링 프로파일링, FlashList 최적화
  - DB: 쿼리 실행 계획 분석, 인덱스 효율성 점검
- **E2E 테스트 및 부하 테스트** (단위·통합 테스트는 각 Phase에서 수행):
  - E2E 테스트: 구매 전체 플로우 (Playwright — 웹)
  - 부하 테스트: 동시 100명 구매 시뮬레이션
- **접근성 점검 및 보완**: Phase 4·6에서 구현한 기본 접근성을 전체 검수
  - Lighthouse 접근성 90+ 확인
  - 스크린 리더 전체 플로우 수동 테스트
  - 고대비 모드 확인
- **배포**:
  - 웹: Vercel 배포 설정
  - 앱: EAS Build 설정
  - Supabase: Production 환경 분리
- **문서 갱신**: 설계 문서 최종 버전 반영

### 완료 기준

- 전체 테스트 스위트 통과
- 웹 Lighthouse 성능 90+, 접근성 90+
- 동시 100명 구매 시뮬레이션에서 초과 판매 0건
- 프로덕션 배포 완료 및 스모크 테스트 통과

### 선행 조건

- Phase 1~7B 완료

---

## 12. Phase 간 의존 관계

```
Phase 1 (기반 구축)
  │
  ▼
Phase 2 (DB 구축)
  │
  ▼
Phase 3 (공유 패키지 + 디자인 토큰)
  │
  ├───────────────────────────┐
  ▼                           ▼
Phase 4 (웹 코어)           Phase 6 (모바일) ── 시작 가능
  │                           │ (기본 화면 구현)
  ▼                           │
Phase 5 (실시간 동기화)       │
  │                           │
  ├────── Phase 6 완료 ◀──────┘ (Realtime 연결 + 최종 검증)
  │
  ├──────────────────┐
  ▼                  ▼
Phase 7A            Phase 7B
(타임세일+결제)     (모바일 고급)
  │                  │
  └────────┬─────────┘
           ▼
        Phase 8 (최적화)
```

### 병렬 가능 구간

| 구간 | 병렬 작업 | 조건 |
|------|-----------|------|
| Phase 3 내부 | 타입 정의 ↔ Zustand 스토어 ↔ 디자인 토큰 | 타입 정의 선행 후 나머지 병렬 |
| Phase 4 + Phase 6 | 웹 페이지 ↔ 모바일 기본 화면 | Phase 3 완료 후. Phase 6의 Realtime 연결·최종 검증은 Phase 5 완료 대기 |
| Phase 7A + Phase 7B | 타임세일+결제 ↔ 모바일 고급 | Phase 7A는 Phase 5 이후, Phase 7B는 Phase 6 이후. 병렬 진행 가능하나 7B의 생체 인증 결제는 7A 완료 필요 |

---

## 12. 페르소나 교차 토론

### 쟁점 1: Phase 3의 스코프가 과대하지 않은가?

**Monorepo Lead (문제 제기):**
Phase 3 산출물을 보면 @repo/shared에 타입, Supabase 클라이언트, Zod 스키마, TanStack Query 훅, Query Key 팩토리, Zustand 스토어, 유틸리티가 모두 포함되어 있다. 여기에 @repo/ui 디자인 토큰까지 합치면 한 Phase에서 다루는 범위가 너무 넓다. "수직 슬라이스 검증" 원칙에 따르면 Phase 3 종료 시 이 모든 것이 동작해야 하는데, 검증 범위가 광범위해진다.

**Sync Master (반론):**
동의한다. 특히 `useRealtimeStock` 같은 Realtime 구독 훅은 Phase 5에서 CDC를 연결하기 전까지 실질적으로 검증이 불가능하다. Phase 3에서 Realtime 훅까지 만들면 "빈 껍데기 코드"가 되어 수직 슬라이스 원칙에 위배된다. Realtime 관련 코드(`useRealtimeStock`, 구독 레지스트리, 스로틀링 유틸`)는 Phase 5로 옮기는 것이 맞다.

**Engine Designer (보충):**
`createSupabaseClient` 팩토리도 Phase 3에서 구현하되, 서버 사이드(Next.js RSC)용과 브라우저용을 명확히 분리해야 한다. 서버에서는 `createServerClient`, 브라우저에서는 `createBrowserClient`를 사용하며, Expo에서는 `createBrowserClient`에 AsyncStorage 어댑터를 주입한다. 이 분리가 Phase 3에서 확정되지 않으면 Phase 4에서 SSR/ISR 구현 시 인증 컨텍스트 문제가 발생한다.

**UI Artisan (동의):**
디자인 토큰은 Phase 3에서 반드시 확정되어야 한다. 하지만 @repo/ui의 프리미티브 컴포넌트(`Text`, `View` 래퍼)는 Phase 4에서 실제로 필요해질 때 추가해도 늦지 않다. Phase 3에서는 토큰 정의에 집중하자.

> **합의:** Phase 3의 Realtime 관련 코드(구독 훅, 레지스트리, 스로틀링)를 Phase 5로 이관. Phase 3은 타입·Supabase 클라이언트(서버/브라우저 분리)·Zod·기본 Query 훅·Zustand·유틸·디자인 토큰에 집중. @repo/ui 프리미티브는 Phase 4·6에서 필요 시 점진적 추가.

---

### 쟁점 2: waitlist 테이블을 Phase 2에서 만드는 것이 적절한가?

**Monorepo Lead (문제 제기):**
Phase 2에서 `waitlist` 테이블을 생성하지만, 실제 대기열 기능은 Phase 7에서 구현한다. `admit_from_waitlist` RPC도 Phase 7로 이관했다. 그렇다면 Phase 2에서 `waitlist` 테이블을 만드는 이유가 무엇인가? 사용하지 않는 테이블이 4개 Phase 동안 방치된다.

**Engine Designer (반론):**
마이그레이션 파일의 일관성 측면에서 전체 스키마를 한 번에 생성하는 것이 좋다. 나중에 테이블을 추가하면 마이그레이션 순서 관리가 복잡해진다. 다만, RPC와 인덱스는 해당 기능 구현 시점에 추가 마이그레이션으로 만드는 것이 맞다.

**Sync Master (반론):**
그런데 `waitlist`의 UNIQUE 제약조건, 인덱스, RLS 정책까지 Phase 2에서 만들면 테스트 대상이 불필요하게 늘어난다. Phase 2의 완료 기준은 "핵심 RPC 검증"에 집중해야 한다. `waitlist` 관련 검증은 Phase 7에서 하는 것이 수직 슬라이스 원칙에 맞다.

**Engine Designer (재반론):**
타협안을 제안한다. Phase 2에서 `waitlist` 테이블 구조(DDL)만 생성하고, RLS 정책과 `admit_from_waitlist` RPC는 Phase 7의 추가 마이그레이션으로 구현한다. 이렇게 하면 스키마 전체를 한 곳에서 조망할 수 있으면서도, 검증 범위는 Phase 7으로 미룰 수 있다.

> **합의:** Phase 2에서 `waitlist` 테이블 DDL만 생성 (UNIQUE 제약 포함). RLS 정책, 인덱스, `admit_from_waitlist` RPC는 Phase 7 마이그레이션으로 이관. Phase 2 완료 기준에서 waitlist 관련 검증은 제외.

---

### 쟁점 3: REPLICA IDENTITY FULL의 성능 비용

**Sync Master (문제 제기):**
`REPLICA IDENTITY FULL`을 설정하면 CDC 이벤트에 전체 행 데이터가 포함되어 `setQueryData`로 직접 캐시를 갱신할 수 있다. 이것이 Phase 5의 핵심 전략이다.

**Engine Designer (우려 제기):**
`REPLICA IDENTITY FULL`은 UPDATE 시 변경 전 행의 **모든 컬럼**을 WAL에 기록한다. `stocks` 테이블은 컬럼이 5개뿐이라 오버헤드가 미미하지만, 만약 나중에 `stocks` 테이블에 컬럼이 추가되면 WAL 크기가 증가한다. 그리고 `REPLICA IDENTITY FULL`은 테이블에 PK가 없을 때 주로 사용하는 것인데, `stocks`는 이미 PK(`id`)가 있다.

**Sync Master (반론):**
`REPLICA IDENTITY DEFAULT`(PK만 전달)를 사용하면 CDC 이벤트에 `quantity`가 포함되지 않아 클라이언트에서 추가 SELECT를 해야 한다. 타임 세일 상황에서 초당 수십 건의 CDC 이벤트마다 추가 쿼리가 발생하면 DB 부하가 오히려 더 크다.

**Engine Designer (동의):**
맞다. `stocks` 테이블은 행 수가 적고(상품 수 = 수천 건), 컬럼도 5개뿐이므로 WAL 오버헤드보다 추가 쿼리 제거의 이점이 훨씬 크다. `REPLICA IDENTITY FULL` 유지에 동의한다. 단, `stocks` 테이블에 새 컬럼을 추가할 때는 WAL 크기 영향을 반드시 검토해야 한다는 주석을 마이그레이션 파일에 남기자.

> **합의:** `REPLICA IDENTITY FULL` 유지. 마이그레이션 파일에 "이 테이블은 REPLICA IDENTITY FULL이 설정되어 있으므로 컬럼 추가 시 WAL 크기 영향을 검토할 것" 주석 추가.

---

### 쟁점 4: 긴박감 UI "껍데기"를 Phase 4에 넣는 것의 타당성

**Monorepo Lead (문제 제기):**
Phase 4에 카운트다운 타이머, 재고 게이지 바, 희소성 뱃지를 "껍데기"로 만든다고 했는데, 이 컴포넌트들은 실시간 데이터(Phase 5)와 타임 세일 로직(Phase 7) 없이는 의미 있는 검증이 불가능하다. 더미 데이터로 렌더링만 확인하는 것이 수직 슬라이스 검증에 부합하는가?

**UI Artisan (반론):**
껍데기라도 Phase 4에서 만들어야 하는 이유가 세 가지 있다. 첫째, 이 컴포넌트들은 반응형 레이아웃과 접근성(`aria-live`, `prefers-reduced-motion`)을 포함한다. 정적 상태에서 이 속성들을 먼저 구현하고 검증하는 것이 Phase 5에서 실시간 데이터를 연결한 뒤에 하는 것보다 안전하다. 둘째, 디자인 토큰(색상 변화 임계값, 간격)이 올바르게 적용되는지 Phase 4에서 시각적으로 확인할 수 있다. 셋째, `React.memo` 분리와 props 인터페이스를 Phase 4에서 확정해야 Phase 5에서 Realtime 데이터를 연결할 때 컴포넌트 구조를 변경하지 않는다.

**Sync Master (동의):**
Phase 5 관점에서도 동의한다. 재고 숫자 컴포넌트가 이미 `React.memo`로 분리되어 있고, props 인터페이스(`currentStock`, `initialStock`, `stockPercentage`)가 확정되어 있으면, Phase 5에서는 `useRealtimeStock` 훅의 반환값을 그대로 연결하기만 하면 된다. 컴포넌트 구조와 데이터 연결을 동시에 하면 디버깅이 어렵다.

**Monorepo Lead (수용):**
이해했다. 컴포넌트 인터페이스 확정과 접근성 검증이 목적이라면 수직 슬라이스 원칙에 부합한다. 단, Phase 4 완료 기준의 "더미 데이터로 렌더링됨"을 좀 더 구체적으로 명시하자. 예를 들어 "재고 게이지 바가 100%, 50%, 10%, 0% 상태에서 각각 올바른 색상으로 표시됨"처럼 검증 가능한 조건으로.

> **합의:** 긴박감 UI 껍데기를 Phase 4에 유지하되, 완료 기준을 구체화: "재고 게이지 바가 100%/50%/10%/0% 각 상태에서 올바른 색상(초록/노랑/빨강/회색) 표시 확인. 카운트다운 타이머가 더미 종료 시각까지 정상 카운트다운 확인. 희소성 뱃지가 재고 5개/3개/0개 조건에서 올바른 텍스트 표시 확인."

---

### 쟁점 5: Phase 7의 스코프가 과대하다

**UI Artisan (문제 제기):**
Phase 7에 타임 세일 시스템, 대기열, 결제 검증, 푸시 알림, 오프라인 복구, 생체 인증이 모두 들어 있다. 이 중 타임 세일과 결제는 웹+앱 공통이고, 푸시 알림·오프라인 복구·생체 인증은 모바일 전용이다. 하나의 Phase에서 이 모든 것을 완료하기에는 범위가 넓다.

**Engine Designer (동의):**
결제 검증 Edge Function + `confirm_payment` RPC + `purchase_stock` 연동은 그 자체로 상당한 작업이다. 외부 PG사 연동, 결제 실패 시 롤백, 중복 결제 방지까지 포함하면 이것만으로도 하나의 Phase 분량이다.

**Sync Master (동의):**
오프라인 복구(AsyncStorage 큐 + 재동기화)도 단순하지 않다. 네트워크 복구 후 로컬 큐의 작업을 순차 전송하면서 서버 상태와 충돌을 해결하는 로직이 필요하다.

**Monorepo Lead (제안):**
Phase 7을 두 단계로 분할하자. Phase 7A는 웹+앱 공통 기능(타임 세일 비즈니스 로직 + 결제 검증 + 대기열), Phase 7B는 모바일 전용 고급 기능(푸시 알림 + 오프라인 복구 + 생체 인증). 7A는 Phase 5 이후 바로 시작 가능하고, 7B는 Phase 6(모바일 기본 화면) 완료 후 시작한다.

> **합의:** Phase 7을 7A(타임 세일 + 결제 + 대기열)와 7B(푸시 알림 + 오프라인 복구 + 생체 인증)로 분할. 7A는 Phase 5 이후, 7B는 Phase 6 이후 시작. 7A와 7B는 병렬 가능.

---

### 쟁점 6: 테스트를 Phase 8에 몰아넣는 것이 맞는가?

**Engine Designer (문제 제기):**
Phase 8에 단위 테스트, 통합 테스트, E2E 테스트가 모두 포함되어 있다. 하지만 `purchase_stock` RPC의 동시 호출 테스트는 Phase 2 완료 기준에 이미 pgbench 시뮬레이션이 포함되어 있다. Phase 8에서 다시 테스트하는 것은 중복이다.

**Monorepo Lead (동의):**
테스트를 마지막 Phase에 몰아넣으면 "Phase 8에 가서야 버그를 발견"하는 상황이 생긴다. 각 Phase에서 해당 Phase의 산출물에 대한 테스트를 함께 작성해야 한다. Phase 8은 "전체 플로우 E2E 테스트"와 "성능 부하 테스트"만 담당해야 한다.

**Sync Master (제안):**
구체적으로 분산하자:
- Phase 2: RPC 단위 테스트 (pgbench 시뮬레이션 포함)
- Phase 3: 공유 유틸·Zod 스키마 단위 테스트
- Phase 4: 컴포넌트 렌더링 테스트 (긴박감 UI 상태별 검증 포함)
- Phase 5: 구독 레지스트리·스로틀링 유틸 단위 테스트, 낙관적 업데이트 통합 테스트
- Phase 8: E2E 구매 전체 플로우, 동시 100명 부하 테스트

**UI Artisan (동의):**
Phase 4에서 긴박감 UI 컴포넌트의 상태별 렌더링을 테스트해야 한다. Phase 8에서 하면 이미 Phase 5에서 실시간 데이터가 연결된 후라 순수 컴포넌트 로직 검증이 어려워진다.

> **합의:** 각 Phase에 해당 산출물의 단위·통합 테스트를 분산 배치. Phase 8은 E2E 테스트(구매 전체 플로우)와 부하 테스트(동시 100명)만 담당.

---

### 쟁점 7: Edge Function에서 @repo/shared 타입 import

**Monorepo Lead (문제 제기):**
설계문서 02에서 "Edge Functions(`supabase/functions/`)가 `@repo/shared`의 타입을 직접 import할 수 있도록 설정한다"고 했다. 하지만 Supabase Edge Functions는 Deno 런타임에서 실행되며, pnpm workspace의 패키지를 직접 참조할 수 없다. 이 부분이 구현계획서에 전혀 언급되지 않았다.

**Engine Designer (우려):**
Edge Function이 `@repo/shared`의 타입을 import할 수 없으면 타입 불일치 위험이 있다. `purchase_stock` RPC의 입력/출력 타입이 프론트엔드와 Edge Function에서 다르게 정의될 수 있다.

**Monorepo Lead (해결안):**
두 가지 방법이 있다. 첫째, `supabase gen types`로 생성한 타입 파일을 `supabase/functions/_shared/` 디렉터리에 복사하여 Edge Function 내에서 참조. 둘째, `@repo/shared`의 타입 정의 파일만 빌드 시 Edge Function 디렉터리에 복사하는 스크립트를 TurboRepo 파이프라인에 추가. 현실적으로 첫 번째 방법이 Supabase CLI와의 호환성이 높다.

**Sync Master (보충):**
Edge Function은 Phase 7A(결제 검증)에서 처음 구현되므로, 이 타입 공유 전략을 Phase 7A 산출물에 명시해야 한다.

> **합의:** `supabase gen types`로 생성한 타입 파일을 `supabase/functions/_shared/database.types.ts`에 배치하여 Edge Function에서 참조. 타입 생성 → 복사 스크립트를 Phase 2의 마이그레이션 워크플로에 포함. Phase 7A 산출물에 Edge Function 타입 공유 전략 명시.

---

### 쟁점 8: Phase 4+6 병렬 진행은 실현 가능한가?

**Monorepo Lead (문제 제기):**
의존 관계도에서 Phase 4와 Phase 6을 "Phase 3 완료 후 병렬 가능"으로 표시했지만, 동시에 "모바일은 Phase 5 이후 권장"이라고 했다. 이 두 문장은 사실상 모순이다. 실제로는 Phase 4 → 5 → 6의 순차 진행이 아닌가?

**UI Artisan (반론):**
Phase 6의 기본 화면(홈, 상품 목록, 상품 상세)은 @repo/shared의 Query 훅만으로 구현 가능하다. Realtime이 없어도 시드 데이터 기반으로 화면을 완성할 수 있다. Phase 5의 Realtime 훅은 Phase 6 후반에 연결하면 된다.

**Sync Master (반론):**
그런데 Phase 6의 완료 기준에 "실시간 재고 업데이트 앱에서 동작 확인"이 포함되어 있다. Phase 5가 완료되지 않으면 이 기준을 충족할 수 없다. Phase 6을 Phase 4와 병렬로 시작하되, 완료는 Phase 5 이후에만 가능하다는 의미다.

**Monorepo Lead (정리):**
그러면 의존 관계도를 정확히 표현하자. Phase 6은 "시작은 Phase 3 이후 가능, 완료는 Phase 5 이후 가능"으로 명시한다. 실질적으로 Phase 4와 Phase 6의 기본 화면 구현은 병렬 가능하지만, Phase 6의 Realtime 연결과 최종 검증은 Phase 5 완료를 대기해야 한다.

> **합의:** Phase 6의 시작 조건(Phase 3)과 완료 조건(Phase 5)을 분리하여 명시. 기본 화면 구현은 Phase 4와 병렬 가능하나, Realtime 연결 및 최종 검증은 Phase 5 완료 후 수행.

---

## 13. 리스크 및 대응 방안

| 리스크 | 영향 Phase | 대응 방안 |
|--------|------------|-----------|
| Supabase Realtime 연결 수 제한 | Phase 5, 7 | Free tier 한계 파악 후 Pro 플랜 전환 시점 결정; 채널 수 최소화 + 구독 레지스트리로 중복 방지 |
| 웹/앱 공유 패키지 인터페이스 변경 | Phase 4, 6 | Phase 3에서 인터페이스 안정화 + 설정 주입 구조 확보 후 진행; Breaking Change 시 semver 적용 |
| RPC 동시성 성능 병목 | Phase 5, 7 | Phase 2에서 pgbench 시뮬레이션으로 조기 발견; 필요 시 Advisory Lock 검토 |
| 디자인 토큰 미확정 | Phase 4, 6 | Phase 3에서 `@repo/ui/src/tokens.ts`에 최소 토큰 셋 확정; Figma 연동 시 별도 태스크로 관리 |
| Expo + Supabase Realtime 호환성 | Phase 6 | Phase 6 초기에 Realtime 연결 PoC 수행; 문제 시 폴링 폴백 준비 |
| REPLICA IDENTITY 미설정 | Phase 5 | Phase 2 완료 기준에 `REPLICA IDENTITY FULL` 설정 확인을 포함; 미설정 시 CDC 이벤트에 PK만 전달되어 추가 쿼리 필요 |
| TurboRepo v2 마이그레이션 | Phase 1 | `pipeline` → `tasks` 키 변경 등 v2 스키마 준수; 공식 마이그레이션 가이드 참조 |
| Edge Function 타입 불일치 | Phase 7A | `supabase gen types` → Edge Function 디렉터리 복사 스크립트를 Phase 2에서 구축; CI에서 타입 일치 검증 |
| Phase 7 스코프 과대 | Phase 7A, 7B | 7A(타임세일+결제+대기열)와 7B(모바일 고급)로 분할하여 병렬 진행; 7B의 생체 인증 결제만 7A 의존 |
| Phase 3 스코프 과대 | Phase 3, 5 | Realtime 관련 코드(구독 훅, 레지스트리, 스로틀링)를 Phase 5로 이관하여 Phase 3 범위 축소 |

---

## 14. 페르소나 검토 이력

v0.2.0에서 반영한 페르소나 검토 항목 전체 목록이다.

| # | 검토 페르소나 | 유형 | 내용 | 반영 위치 |
|---|---------------|------|------|-----------|
| 1 | Monorepo Lead | 불일치 | `turbo.json` 키 이름 `pipeline` → `tasks` (v2) | Phase 1 산출물 |
| 2 | Monorepo Lead | 누락 | ESLint + Prettier 공유 설정 패키지 | Phase 1 산출물 |
| 3 | Monorepo Lead | 누락 | `.env` 관리 전략 | Phase 1 산출물 |
| 4 | Monorepo Lead | 누락 | pnpm `catalog:` 프로토콜 | Phase 1 산출물 |
| 5 | Monorepo Lead | 불일치 | `@repo/realtime` 분리 vs @repo/shared 포함 | @repo/shared에 포함으로 확정 (Phase 3·5) |
| 6 | Monorepo Lead | 위험 | `@repo/ui` 위상 모호 ("선택적") | Phase 3 산출물에서 필수로 변경 (디자인 토큰 배치) |
| 7 | Engine Designer | 불일치 | `confirm_payment` RPC Phase 불일치 | Phase 2 → Phase 7로 이관 |
| 8 | Engine Designer | 불일치 | `admit_from_waitlist` RPC Phase 불일치 | Phase 2 → Phase 7로 이관 |
| 9 | Engine Designer | 누락 | `REPLICA IDENTITY FULL` 미명시 | Phase 2 산출물 + 완료 기준 |
| 10 | Engine Designer | 누락 | `time_sales` CHECK 제약 (`starts_at < ends_at`) | Phase 2 산출물 |
| 11 | Engine Designer | 위험 | 시드 데이터 범위 부족 | Phase 2 산출물 (30건 상품, 타임세일, 테스트 사용자) |
| 12 | Engine Designer | 검증 누락 | Phase 4·6에서 RLS 재검증 미포함 | Phase 4·6 완료 기준 |
| 13 | Sync Master | 불일치 | `orders` Realtime 활성화 여부 모순 | `order-status` 채널 제거 (Phase 5) |
| 14 | Sync Master | 누락 | 구독 레지스트리(참조 카운팅) | Phase 5 산출물 + 완료 기준 |
| 15 | Sync Master | 중복 | 오프라인 처리 Phase 중복 | Phase 5: 웹 오프라인, Phase 7: 모바일 전용으로 분리 |
| 16 | Sync Master | 누락 | TanStack Query 플랫폼별 설정 주입 구조 | Phase 3 산출물 |
| 17 | Sync Master | 위험 | 100ms 측정 방법 부재 | Phase 5 완료 기준 |
| 18 | UI Artisan | 불일치 | 디자인 토큰 배치 위치 | Phase 3 `@repo/ui/src/tokens.ts` → Phase 4 Tailwind 변환 |
| 19 | UI Artisan | 누락 | 긴박감 UI 컴포넌트 껍데기 | Phase 4 산출물 |
| 20 | UI Artisan | 모순 | 접근성 처리 시점 | Phase 4·6 완료 기준에 접근성 추가, Phase 8은 검수만 |
| 21 | UI Artisan | 누락 | Tamagui 디자인 토큰 매핑 | Phase 6 산출물 |
| 22 | UI Artisan | 누락 | 반응형 브레이크포인트 | Phase 4 산출물 |
| 23 | 교차 토론 | 스코프 과대 | Phase 3에서 Realtime 훅을 Phase 5로 이관 | Phase 3·5 산출물 |
| 24 | 교차 토론 | 시점 부적절 | waitlist RLS·인덱스·RPC를 Phase 7A로 이관 | Phase 2·7A 산출물 |
| 25 | 교차 토론 | 누락 | Supabase 클라이언트 서버/브라우저 분리 명시 | Phase 3 산출물 |
| 26 | 교차 토론 | 검증 부족 | 긴박감 UI 완료 기준 구체화 (색상·텍스트 조건별 검증) | Phase 4 완료 기준 |
| 27 | 교차 토론 | 스코프 과대 | Phase 7을 7A(타임세일+결제+대기열)와 7B(모바일 고급)로 분할 | Phase 7A·7B |
| 28 | 교차 토론 | 시점 부적절 | 단위·통합 테스트를 각 Phase로 분산, Phase 8은 E2E+부하만 | Phase 2~7B, 8 |
| 29 | 교차 토론 | 누락 | Edge Function 타입 공유 전략 (gen types → _shared/ 복사) | Phase 2·7A |
| 30 | 교차 토론 | 모호 | Phase 6 시작 조건(Phase 3)과 완료 조건(Phase 5) 분리 명시 | Phase 6·의존 관계도 |
