# 모노레포 패키지 구조

## 1. 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 모노레포 패키지 구조 |
| 버전 | v0.1.0 |
| 작성일 | 2026-03-26 |
| 기반 문서 | /docs/spec/summary.md |

### 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v0.1.0 | 2026-03-26 | Claude | 신규 작성 |

---

## 2. 디렉터리 구조

```
moment-stock/                         # 프로젝트 루트
├── apps/
│   ├── web/                          # Next.js 14 (App Router) 웹 애플리케이션
│   │   ├── app/                      # App Router 라우트
│   │   ├── components/               # 웹 전용 컴포넌트
│   │   ├── hooks/                    # 웹 전용 훅
│   │   ├── styles/                   # Tailwind CSS 설정 및 글로벌 스타일
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                       # Expo (React Native) 모바일 앱
│       ├── app/                      # Expo Router 라우트
│       ├── components/               # 앱 전용 컴포넌트 (Tamagui 기반)
│       ├── hooks/                    # 앱 전용 훅
│       ├── tamagui.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                       # @repo/shared — 공유 비즈니스 로직
│   │   ├── src/
│   │   │   ├── types/                # 공유 타입 정의 (DB 스키마 타입 포함)
│   │   │   ├── schemas/              # Zod 유효성 검사 스키마
│   │   │   ├── supabase/             # Supabase 클라이언트 팩토리 및 설정
│   │   │   ├── queries/              # TanStack Query 키·훅 팩토리
│   │   │   ├── stores/               # Zustand 스토어 (플랫폼 무관 로직)
│   │   │   ├── utils/                # 공통 유틸리티 함수
│   │   │   └── constants/            # 공유 상수
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                           # @repo/ui — 공유 UI 컴포넌트
│   │   ├── src/
│   │   │   ├── primitives/           # 플랫폼 분기 래퍼 (Text, View 등)
│   │   │   └── components/           # 플랫폼 무관 공유 컴포넌트
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── tsconfig/                     # @repo/tsconfig — 공유 TypeScript 설정
│       ├── base.json                 # 기본 컴파일러 옵션
│       ├── nextjs.json               # Next.js 전용 확장 설정
│       ├── expo.json                 # Expo 전용 확장 설정
│       └── package.json
│
├── supabase/                         # Supabase 프로젝트 설정
│   ├── migrations/                   # SQL 마이그레이션 파일
│   ├── functions/                    # Edge Functions
│   ├── seed.sql                      # 시드 데이터
│   └── config.toml                   # Supabase CLI 설정
│
├── turbo.json                        # TurboRepo 파이프라인 설정
├── pnpm-workspace.yaml               # pnpm 워크스페이스 정의
├── package.json                      # 루트 package.json
└── tsconfig.json                     # 루트 TypeScript 설정
```

---

## 3. 패키지 역할 정의

| 패키지 | 이름 | 역할 | 주요 의존성 | 내보내기(Exports) |
|--------|------|------|-------------|-------------------|
| `apps/web` | `@repo/web` | Next.js 14 웹 애플리케이션. ISR + 실시간 재고 스트리밍 | `@repo/shared`, `@repo/ui`, `next`, `tailwindcss` | — (배포 대상) |
| `apps/mobile` | `@repo/mobile` | Expo 모바일 앱. 푸시 알림, 간편 결제, 오프라인 복구 | `@repo/shared`, `@repo/ui`, `expo`, `tamagui` | — (배포 대상) |
| `packages/shared` | `@repo/shared` | 플랫폼 무관 비즈니스 로직 및 데이터 계층 | `@supabase/supabase-js`, `zod`, `@tanstack/react-query`, `zustand` | 타입, Zod 스키마, Supabase 클라이언트, Query 훅, Zustand 스토어, 유틸 |
| `packages/ui` | `@repo/ui` | 공유 UI 프리미티브 및 컴포넌트 | `react`, `react-native` (peer) | 플랫폼 분기 래퍼 컴포넌트 |
| `packages/tsconfig` | `@repo/tsconfig` | TypeScript 컴파일러 설정 공유 | — | JSON 설정 파일 |

---

## 4. 의존성 그래프

```
┌─────────────┐     ┌──────────────┐
│  apps/web   │     │ apps/mobile  │
│ (Next.js)   │     │   (Expo)     │
└──────┬──────┘     └──────┬───────┘
       │                   │
       │   ┌───────────┐   │
       ├──▶│ @repo/ui  │◀──┤
       │   └───────────┘   │
       │                   │
       │  ┌─────────────┐  │
       └─▶│@repo/shared │◀─┘
          └──────┬──────┘
                 │
          ┌──────┴──────┐
          │ @repo/      │
          │ tsconfig    │
          └─────────────┘
```

### 의존성 규칙

| 규칙 | 설명 |
|------|------|
| **단방향 의존** | 의존 방향은 항상 `apps → packages`이다. 역방향 참조는 금지한다. |
| **순환 참조 금지** | 패키지 간 순환 의존(A → B → A)을 절대 허용하지 않는다. |
| **shared → ui 참조 금지** | `@repo/shared`는 `@repo/ui`를 참조하지 않는다. 데이터 계층과 UI 계층을 분리한다. |
| **ui → shared 허용** | `@repo/ui`는 필요 시 `@repo/shared`의 타입만 참조할 수 있다. |
| **외부 의존성 최소화** | `packages/*`는 외부 라이브러리 의존을 최소한으로 유지한다. |

---

## 5. 페르소나 관점 토론

### 5.1 Monorepo Lead 의견

> **이 문서의 핵심 도메인입니다. 패키지 경계와 빌드 전략에 대해 상세히 기술합니다.**

#### 패키지 경계 원칙

- **DRY 원칙 적용**: 두 개 이상의 앱에서 동일한 로직이 발견되면 즉시 `@repo/shared`로 추출한다. 단, 단일 앱에서만 사용되는 로직은 해당 앱 내부에 유지한다.
- **패키지 단위 응집도**: 각 패키지는 하나의 명확한 책임을 갖는다. `@repo/shared`에 UI 코드가 섞이거나 `@repo/ui`에 비즈니스 로직이 포함되는 것을 금지한다.
- **인터페이스 기반 설계**: 패키지 진입점(`index.ts`)에서 명시적으로 내보내기한 항목만 외부에서 접근 가능하도록 한다. 내부 구현 파일의 직접 import를 금지한다.

#### 빌드 파이프라인

- TurboRepo의 `turbo.json`을 통해 `build`, `lint`, `test`, `typecheck` 태스크를 정의한다.
- 패키지 간 의존 순서를 TurboRepo가 자동으로 해석하므로, `@repo/tsconfig` → `@repo/shared` → `@repo/ui` → `apps/*` 순으로 빌드된다.
- 각 태스크의 입력(inputs)과 출력(outputs)을 명확히 선언하여 캐시 적중률을 극대화한다.

#### 캐싱 전략

- **로컬 캐시**: 기본으로 `.turbo` 디렉터리에 태스크 결과를 캐싱한다. 입력 파일에 변경이 없으면 이전 결과를 재사용한다.
- **원격 캐시**: CI 환경에서 TurboRepo Remote Cache를 활성화하여 팀원 간 빌드 결과를 공유한다.
- **캐시 무효화**: `tsconfig`, `package.json`, 환경 변수 변경 시 관련 태스크 캐시를 자동 무효화한다.

#### 의존성 관리

- pnpm의 `workspace:*` 프로토콜을 사용하여 내부 패키지를 참조한다.
- 외부 라이브러리 버전은 루트 `package.json`의 `pnpm.overrides`로 통일하여 버전 충돌을 방지한다.
- `pnpm-workspace.yaml`에 모든 워크스페이스 경로를 명시한다.

---

### 5.2 Engine Designer 의견

> **Supabase 관련 코드의 배치 전략에 집중합니다.**

#### Supabase 타입 배치

- Supabase CLI(`supabase gen types`)로 자동 생성된 DB 타입 파일은 `packages/shared/src/types/database.types.ts`에 배치한다.
- 자동 생성 타입을 기반으로 도메인별 가공 타입(예: `Product`, `TimeSale`, `StockEvent`)을 `packages/shared/src/types/` 하위에 정의한다.
- 이를 통해 웹과 앱 모두 동일한 DB 스키마 타입을 참조하게 되어 타입 안정성을 확보한다.

#### RPC 정의 배치

- Supabase RPC 함수(예: `decrease_stock`, `reserve_stock`)의 SQL 정의는 `supabase/migrations/`에 마이그레이션으로 관리한다.
- RPC를 호출하는 TypeScript 래퍼 함수는 `packages/shared/src/supabase/rpc.ts`에 집중 배치하여, 앱 코드에서 직접 SQL 문자열을 작성하지 않도록 한다.

#### 마이그레이션 관리

- `supabase/` 디렉터리는 독립적으로 루트에 배치한다. 특정 앱이나 패키지에 종속시키지 않는다.
- Edge Functions(`supabase/functions/`)도 같은 디렉터리에 관리하되, `@repo/shared`의 타입을 직접 import할 수 있도록 설정한다.

---

### 5.3 Sync Master 의견

> **실시간 동기화 및 상태 관리 코드의 배치 전략에 집중합니다.**

#### 실시간 구독 훅 배치

- Supabase Realtime 구독 로직의 **코어(채널 생성, 이벤트 파싱)**는 `packages/shared/src/supabase/realtime.ts`에 배치한다.
- 이를 React 훅으로 감싼 `useRealtimeStock`, `useRealtimeTimeSale` 등은 `packages/shared/src/queries/`에 정의한다.
- 플랫폼별 차이(예: 앱의 백그라운드 전환 시 구독 해제/재연결)는 각 `apps/` 내부에서 래퍼 훅으로 처리한다.

#### TanStack Query 키·훅 배치

- Query Key 팩토리(예: `productKeys.detail(id)`)는 `packages/shared/src/queries/keys.ts`에 중앙 관리한다.
- Query/Mutation 훅(예: `useProductDetail`, `usePurchaseMutation`)은 `packages/shared/src/queries/` 하위에 도메인별로 배치한다.
- 낙관적 업데이트(Optimistic Update) 로직은 Mutation 훅 내부에 캡슐화하여 웹과 앱에서 동일하게 동작하도록 한다.

#### Zustand 스토어 배치

- 플랫폼 무관 전역 상태(예: 대기열 상태, 사용자 세션)는 `packages/shared/src/stores/`에 정의한다.
- 플랫폼 고유 상태(예: 앱의 네비게이션 상태, 웹의 모달 상태)는 각 `apps/` 내부에서 관리한다.

---

### 5.4 UI Artisan 의견

> **크로스 플랫폼 UI 전략에 집중합니다.**

#### 플랫폼별 스타일링 분리

- **웹(Next.js)**: Tailwind CSS를 사용한다. 설정 및 글로벌 스타일은 `apps/web/styles/`에 배치한다.
- **앱(Expo)**: Tamagui를 사용한다. 테마 설정은 `apps/mobile/tamagui.config.ts`에 배치한다.
- 두 스타일링 시스템은 근본적으로 다르므로, **UI 컴포넌트 수준의 완전한 코드 공유는 목표로 하지 않는다.**

#### 공유 UI 컴포넌트 전략

- `@repo/ui`는 **플랫폼 분기 래퍼(primitives)**를 제공한다. 예를 들어, `Text` 컴포넌트는 웹에서 `<span>`, 앱에서 React Native `<Text>`로 렌더링된다.
- 복잡한 UI 컴포넌트(예: 상품 카드, 재고 게이지)는 각 앱에서 플랫폼 네이티브로 구현한다.
- **공유 가능한 영역**: 컴포넌트 인터페이스(Props 타입), 표시 로직(포맷팅, 조건부 렌더링 판단), 디자인 토큰(색상, 간격 값)을 `@repo/shared` 또는 `@repo/ui`에서 공유한다.

#### 디자인 토큰 통합

- 색상 팔레트, 간격(spacing), 타이포그래피 스케일 등 디자인 토큰은 `@repo/ui/src/tokens.ts`에 정의한다.
- Tailwind 설정과 Tamagui 테마가 동일 토큰을 참조하도록 하여 시각적 일관성을 유지한다.

---

## 6. TurboRepo 파이프라인 설계

### 6.1 파이프라인 정의

```jsonc
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "inputs": ["src/**", "app/**", "package.json", "tsconfig.json"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "app/**", ".eslintrc.*"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**", "__tests__/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "app/**", "tsconfig.json"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 6.2 태스크 설명

| 태스크 | 설명 | 캐시 여부 | 의존 관계 |
|--------|------|-----------|-----------|
| `build` | 프로덕션 빌드. Next.js 빌드 및 패키지 컴파일 | O | 의존 패키지 빌드 완료 후 실행 |
| `lint` | ESLint 검사 | O | 의존 패키지 빌드 완료 후 실행 |
| `test` | 단위·통합 테스트 실행 | O | 의존 패키지 빌드 완료 후 실행 |
| `typecheck` | `tsc --noEmit` 타입 검사 | O | 의존 패키지 빌드 완료 후 실행 |
| `dev` | 개발 서버 실행 | X | 캐시 비활성, 영속 프로세스 |

### 6.3 캐싱 전략

- **inputs 명시**: 각 태스크에 `inputs`를 선언하여, 관련 없는 파일 변경(예: README 수정)이 캐시를 무효화하지 않도록 한다.
- **outputs 명시**: `build` 태스크의 출력 디렉터리를 명확히 지정하여 캐시 복원 시 정확한 파일이 복원되도록 한다.
- **globalDependencies**: 환경 변수 파일(`.env.*local`)을 전역 의존으로 등록하여, 환경 변수 변경 시 전체 캐시를 무효화한다.

---

## 7. 공유 코드 기준

### 7.1 `packages/shared`에 배치하는 경우

| 조건 | 예시 |
|------|------|
| 웹과 앱 **모두**에서 사용하는 로직 | Supabase 클라이언트, 재고 차감 Mutation 훅 |
| DB 스키마에서 파생된 타입 | `Product`, `TimeSale`, `Order` 타입 |
| 유효성 검사 스키마 | Zod 기반 `purchaseSchema`, `productSchema` |
| Query Key 팩토리 및 공유 Query 훅 | `useProductList`, `useStockRealtime` |
| 비즈니스 규칙 유틸리티 | 할인율 계산, 타임 세일 잔여 시간 계산 |

### 7.2 `apps/` 내부에 유지하는 경우

| 조건 | 예시 |
|------|------|
| **단일 플랫폼**에서만 사용하는 로직 | 웹 전용 ISR 설정, 앱 전용 푸시 알림 |
| 플랫폼 고유 UI 컴포넌트 | Tailwind 기반 웹 컴포넌트, Tamagui 기반 앱 컴포넌트 |
| 플랫폼 고유 상태 관리 | 웹 모달 상태, 앱 네비게이션 상태 |
| 라우팅 및 페이지 구성 | Next.js App Router 페이지, Expo Router 화면 |
| 플랫폼 고유 환경 설정 | `next.config.js`, `app.json` |

### 7.3 판단 기준 플로우

```
해당 코드가 웹과 앱 모두에서 필요한가?
  ├─ YES → 플랫폼 종속 API를 사용하는가?
  │         ├─ YES → 인터페이스를 shared에, 구현을 각 apps/에 배치
  │         └─ NO  → packages/shared에 배치
  └─ NO  → 해당 apps/ 내부에 유지
```
