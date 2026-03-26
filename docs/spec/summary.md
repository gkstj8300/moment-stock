# ⚡ moment-stock: 실시간 재고 동기화 및 타임 세일 플랫폼

> **"찰나의 순간, 가장 정확한 재고를 제공하다 (The Moment of Perfect Stock)"**
> **`moment-stock`**은 초당 수천 건의 동시 요청이 발생하는 타임 세일 환경에서 데이터 무결성을 보장하고, 웹과 앱 클라이언트에 0.1초 이내로 재고 상태를 전파하는 **고성능 실시간 커머스 엔진**입니다.

---

## 📌 프로젝트 핵심 테마: [데이터 무결성 & 초저지연 동기화]
단순한 쇼핑몰 구현을 넘어, **'재고(Stock)'**라는 단일 소스(Single Source of Truth)가 수많은 클라이언트와 서버 사이에서 어떻게 충돌 없이 동기화되고 시각화되는지에 대한 기술적 해답을 제시합니다.

--- 

## 🎯 핵심 기술 목표 (Core Technical Goals)
* **Zero-Lag Realtime Sync:** Supabase Realtime(CDC)을 활용하여 DB의 재고 변화를 모든 클라이언트에 100ms 이내 전파.
* **Atomic Concurrency Control:** Postgres RPC 및 트랜잭션을 설계하여 동시 요청 시 '초과 판매(Overselling)' 발생 가능성 0% 달성.
* **High-Frequency UI Optimization:** 잦은 데이터 업데이트 상황에서도 `requestAnimationFrame` 등을 활용해 60fps 이상의 부드러운 UI 유지.
* **Unified Cross-Platform:** TurboRepo 기반 모노레포를 구축하여 Web(Next.js)과 App(React Native) 간 비즈니스 로직 및 Supabase 스키마 공유.

---

## ✨ 주요 기능 및 아키텍처

### 🛠 실시간 재고 엔진 (Core Engine)
* **Postgres Change Data Capture:** 데이터베이스 수준의 변경 사항을 감지하여 실시간 브로드캐스팅.
* **Database-Level Atomic Updates:** 클라이언트가 아닌 DB 내부에서 `stock > 0` 조건을 검증하는 RPC(Stored Procedures) 구현.
* **Smart Throttling & Batching:** 네트워크 오버헤드를 줄이기 위해 클라이언트 측에서 수신된 이벤트를 효율적으로 처리.

### 🌐 Web (Next.js 14+)
* **Hybrid Rendering:** 상품 상세 정보는 ISR로 고속 서빙하고, 재고 수량만 실시간 스트리밍으로 렌더링.
* **Optimistic UI & Rollback:** 구매 즉시 UI 상의 재고를 차감하되, 서버 검증 실패 시 TanStack Query를 통해 자연스러운 롤백 수행.
* **Waitlist Queue:** 트래픽 폭주 상황을 대비한 클라이언트 사이드 가상 대기열 시스템.

### 📱 App (React Native Expo)
* **Real-time Push Trigger:** 관심 상품 재고 임박(예: 5개 미만) 시 Supabase Edge Functions와 FCM을 연동한 즉각적인 알림.
* **Native Quick Pay:** 생체 인증(FaceID/지문) 연동 및 앱 전용 간편 결제 인터페이스.
* **Offline Resilience:** 네트워크 단절 후 복구 시 최신 재고 상태로의 자동 재동기화(Re-sync) 로직.

---

## 🛠 기술 스택 (Tech Stack)

| 구분 | 기술 스택 | 선정 이유 |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Expo | SSR을 통한 SEO 확보 및 모바일 네이티브 기능 활용 |
| **Backend** | **Supabase (PostgreSQL)** | Auth, Realtime, DB 트랜잭션 관리를 위한 통합 BaaS |
| **Real-time** | Supabase Realtime | DB와 클라이언트 간 저지연 양방향 통신 구현 |
| **Logic** | Supabase Edge Functions | 보안이 필요한 결제 검증 및 재고 차감 로직 처리 |
| **Monorepo** | TurboRepo | 웹/앱 간 Common Utils 및 Type Definition 공유 |
| **State** | TanStack Query v5, Zustand | 서버 상태 캐싱 및 가벼운 전역 상태 관리 |

---

## 🧠 기술적 챌린지 (Technical Challenges)

### 1. Race Condition 해결을 위한 DB 트랜잭션 설계
* **문제:** 수백 명의 사용자가 동시에 마지막 재고를 선점하려 할 때 발생하는 부정합 문제.
* **해결:** SQL 수준에서 `UPDATE ... SET stock = stock - 1 WHERE id = x AND stock > 0` 쿼리를 원자적으로 실행하는 RPC 함수를 작성하여 애플리케이션 계층의 동시성 문제 차단.

### 2. 고주파 업데이트 상황에서의 렌더링 최적화
* **문제:** 실시간 재고 숫자가 빠르게 변할 때 발생하는 잦은 리렌더링과 CPU 점유율 상승.
* **해결:** 재고 상태를 원자 단위(Atomic State)로 관리하고, 변경된 부분만 부분 렌더링되도록 컴포넌트 구조 최적화 및 `React.memo` 적용.

### 3. 모노레포 기반의 코드 공유 전략
* **문제:** 웹과 앱에서 동일한 Supabase Client 설정과 유효성 검사 로직이 중복되는 문제.
* **해결:** `@repo/shared` 패키지를 생성하여 Zod 스키마, 공통 타입, Supabase 클라이언트 설정을 중앙화하여 유지보수 효율 향상.