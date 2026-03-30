# moment-stock

> **찰나의 순간, 가장 정확한 재고를 제공하다 — The Moment of Perfect Stock**

초당 수천 건의 동시 요청이 발생하는 타임 세일 환경에서 **데이터 무결성을 보장**하고, 웹과 앱 클라이언트에 **0.1초 이내**로 재고 상태를 전파하는 고성능 실시간 커머스 엔진입니다.

---

## 핵심 기술 목표

| 목표 | 설명 | 달성 현황 |
|------|------|-----------|
| **Zero-Lag Realtime Sync** | Supabase Realtime(CDC)으로 DB 재고 변화를 100ms 이내 전파 | 구현 완료 |
| **Atomic Concurrency Control** | PostgreSQL RPC 트랜잭션으로 초과 판매(Overselling) 0% | 부하 테스트 통과 (100회 동시 구매 → 초과 판매 0건) |
| **60fps UI Optimization** | requestAnimationFrame 기반 스로틀링/배칭으로 부드러운 렌더링 | 구현 완료 |
| **Unified Cross-Platform** | TurboRepo 모노레포로 Web/App 비즈니스 로직 공유 | 공유 훅 6개 재사용 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Monorepo** | TurboRepo v2, pnpm |
| **Web** | Next.js 15 (App Router), Tailwind CSS v4 |
| **Mobile** | React Native (Expo 53), Expo Router |
| **Backend** | Supabase (PostgreSQL 17, Edge Functions, Auth, Realtime) |
| **State** | TanStack Query v5, Zustand |
| **Validation** | Zod |
| **Test** | Vitest |
| **CI** | GitHub Actions |

---

## 프로젝트 구조

```
moment-stock/
├── apps/
│   ├── web/                    # Next.js 15 웹 앱
│   │   ├── app/
│   │   │   ├── _components/    # 공통 UI (Header, ProductCard)
│   │   │   │   └── urgency/    # 긴박감 UI (StockGaugeBar, CountdownTimer, ScarcityBadge)
│   │   │   ├── _providers/     # QueryProvider, SupabaseProvider
│   │   │   ├── products/       # 상품 목록/상세
│   │   │   ├── time-sale/      # 타임 세일
│   │   │   ├── waitlist/       # 대기열
│   │   │   ├── cart/           # 장바구니
│   │   │   ├── checkout/       # 결제
│   │   │   ├── orders/         # 주문 내역
│   │   │   └── auth/           # 로그인/회원가입
│   │   └── middleware.ts       # 인증 보호 라우트
│   │
│   └── mobile/                 # Expo 모바일 앱
│       ├── app/
│       │   ├── (tabs)/         # Tab 네비게이션 (홈, 상품, 장바구니, MY)
│       │   └── product/[id]/   # 상품 상세 (생체 인증 결제)
│       ├── components/         # 모바일 전용 UI
│       └── lib/                # 생체 인증, 오프라인 큐, 네트워크 모니터
│
├── packages/
│   ├── shared/                 # @repo/shared — 비즈니스 로직 공유
│   │   └── src/
│   │       ├── types/          # 타입 계층 (server → entities → api)
│   │       ├── supabase/       # 서버/브라우저 클라이언트 팩토리
│   │       ├── queries/        # TanStack Query 훅 + Key 팩토리
│   │       ├── realtime/       # 구독 레지스트리 + 스로틀링 + useRealtimeStock
│   │       ├── stores/         # Zustand (cart, connection)
│   │       ├── schemas/        # Zod 유효성 검증
│   │       └── utils/          # 유틸리티 (formatPrice, getStockLevel 등)
│   ├── ui/                     # @repo/ui — 디자인 토큰
│   ├── tsconfig/               # 공유 TypeScript 설정
│   └── eslint-config/          # 공유 ESLint + Prettier
│
├── supabase/
│   ├── migrations/             # SQL 마이그레이션 (5개)
│   ├── functions/              # Edge Functions (verify-payment, stock-alert)
│   └── seed.sql                # 시드 데이터 (상품 30건, 타임세일 4건)
│
├── scripts/
│   └── load-test.sql           # 동시 100명 부하 테스트
│
└── docs/
    ├── spec/                   # 설계 문서 (아키텍처, DB, Realtime 등 7개)
    ├── rules/                  # 코딩 규칙, 문서 규격, Phase 검토 규칙
    ├── personas/               # 개발 페르소나 (4종)
    └── reviews/                # Phase별 검토 결과 (9개)
```

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 10+
- Docker Desktop (Supabase 로컬 환경)

### 설치 및 실행

```bash
# 1. 의존성 설치
pnpm install

# 2. Supabase 로컬 환경 시작
pnpm db:start

# 3. DB 마이그레이션 + 시드 데이터 적용
pnpm db:reset

# 4. TypeScript 타입 생성
pnpm db:gen-types

# 5. 웹 개발 서버 실행
pnpm turbo dev --filter=@repo/web
# → http://localhost:3000

# 6. 모바일 개발 서버 실행 (별도 터미널)
pnpm turbo dev --filter=@repo/mobile
# → Expo Go 앱으로 QR 스캔
```

### 테스트 계정

| 이메일 | 비밀번호 |
|--------|----------|
| `test1@moment-stock.com` | `password123` |
| `test2@moment-stock.com` | `password123` |

---

## 주요 기능

### 실시간 재고 동기화

- Supabase Realtime CDC로 `stocks` 테이블 변경 감지
- requestAnimationFrame 기반 스로틀링 (60fps 유지)
- 품절 이벤트(`quantity = 0`)는 스로틀링 우회하여 즉시 반영
- 구독 레지스트리: 참조 카운팅으로 동일 채널 중복 구독 방지

### 원자적 재고 차감

- `purchase_stock` RPC: 단일 UPDATE 문의 행 레벨 락으로 Race Condition 차단
- `CHECK (quantity >= 0)` 제약 조건: DB 수준 음수 재고 원천 차단
- `stocks` 테이블 분리 설계: HOT 업데이트 최적화

### 낙관적 업데이트

- 구매 클릭 → UI 즉시 차감 → 서버 검증 → 성공 확정 또는 롤백
- 뮤테이션 진행 중 Realtime 이벤트 지연 처리 (UI 깜빡임 방지)

### 타임 세일 + 대기열

- 카운트다운 타이머, 재고 게이지 바, 희소성 뱃지로 긴박감 전달
- 대기열 시스템: 순번 등록 → 실시간 순번 업데이트 → 자동 입장

### 결제

- Edge Function: PG 결제 검증 → `purchase_stock` RPC → `confirm_payment`
- 모바일: 생체 인증(FaceID/지문) + PIN 폴백으로 간편 결제

### 모바일 고급 기능

- 오프라인 큐: AsyncStorage 기반 로컬 작업 저장 → 네트워크 복구 시 순차 전송
- 네트워크 모니터: AppState 감지 → 포그라운드 복귀 시 자동 재동기화
- 푸시 알림: Edge Function 기반 재고 임박(5개 미만) 알림 (FCM)

---

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 전체 개발 서버 실행 |
| `pnpm build` | 전체 프로덕션 빌드 |
| `pnpm typecheck` | TypeScript 타입 체크 |
| `pnpm lint` | ESLint 검사 |
| `pnpm test` | Vitest 단위 테스트 |
| `pnpm db:start` | Supabase 로컬 환경 시작 |
| `pnpm db:stop` | Supabase 로컬 환경 중지 |
| `pnpm db:reset` | DB 초기화 (마이그레이션 + 시드) |
| `pnpm db:gen-types` | DB 스키마 → TypeScript 타입 생성 |

---

## 아키텍처

```
[사용자 구매 요청]
    │
    ▼
[Edge Function: 결제 검증 + purchase_stock RPC]
    │
    ▼
[PostgreSQL: UPDATE stock SET quantity = quantity - 1 WHERE quantity > 0]
    │
    ▼
[CDC: WAL 변경 감지 → Supabase Realtime 브로드캐스트]
    │
    ▼
[모든 클라이언트: 스로틀링 → TanStack Query 캐시 갱신 → UI 리렌더링]
```

---

## 문서

| 문서 | 설명 |
|------|------|
| [전체 시스템 아키텍처](docs/spec/01-system-architecture.md) | 계층별 역할, 데이터 흐름 |
| [모노레포 패키지 구조](docs/spec/02-monorepo-structure.md) | 디렉터리, 의존성, TurboRepo 파이프라인 |
| [데이터베이스 설계](docs/spec/03-database-design.md) | 테이블 스키마, RPC, RLS, 인덱스 |
| [실시간 동기화 아키텍처](docs/spec/04-realtime-sync.md) | CDC, 스로틀링, 낙관적 업데이트 |
| [프론트엔드 아키텍처](docs/spec/05-frontend-architecture.md) | 렌더링 전략, 크로스플랫폼 |
| [구현 계획서](docs/spec/06-implementation-plan.md) | Phase 1~8 구현 계획 + 페르소나 토론 |

---

## 라이선스

MIT
