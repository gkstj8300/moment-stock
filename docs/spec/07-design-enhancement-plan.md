# 디자인 고도화 계획서

## 1. 문서 정보

| 항목 | 내용 |
|------|------|
| 문서명 | 디자인 고도화 계획서 |
| 버전 | v0.1.0 |
| 작성일 | 2026-04-01 |
| 기반 문서 | /docs/rules/design-system-rules.md, /docs/personas/persona-product-designer.md, /packages/ui/src/tokens.ts |

### 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v0.1.0 | 2026-04-01 | Claude | 신규 작성 — 토스·오늘의집 레퍼런스 기반 디자인 고도화 계획 |

---

## 2. 레퍼런스 분석

### 2.1. 토스 디자인 시스템 (TDS)

**출처**: [토스 기술 블로그 — 디자인 시스템 다시 생각해보기](https://toss.tech/article/rethinking-design-system), [TDS 컴포넌트](https://developers-apps-in-toss.toss.im/design/components.html)

| 항목 | 핵심 내용 | moment-stock 적용 포인트 |
|------|-----------|--------------------------|
| **Hybrid API** | 단순 케이스는 Flat, 복잡한 변형은 Compound로 제공. 내부적으로 동일 primitive 레이어 재사용 | 현재 긴박감 UI는 Flat만 사용. ProductCard 등 복합 컴포넌트에 Compound 패턴 도입 |
| **패턴화** | 사용 현황 분석 → 자주 쓰이는 변형을 전용 옵션으로 제공 | 재고 상태 표시의 5가지 변형(high/medium/low/critical/soldOut)을 표준 패턴으로 체계화 |
| **심미성** | 배경 블러, 유리 질감, 세밀한 인터랙션(투명도, 속도, 가속도) | 타임 세일 카드에 글래스모피즘 + 미세 인터랙션 적용 |
| **접근성** | 큰 텍스트 모드 대응, 화면 읽기 초점 관리, 닫기 버튼 | 현재 ARIA 기본만 적용. 스크린 리더 초점 순서 + 큰 텍스트 모드 대응 추가 |
| **생산성** | TDS 도입으로 디자이너 생산성 3~5배 향상 | 컴포넌트 표준화로 신규 페이지 구현 속도 향상 목표 |
| **핵심 철학** | "우회로를 없애는 통제가 아니라 우회할 이유를 줄이는 설계" | 컴포넌트 확장성을 높여 임의 스타일 생성 동기 제거 |

### 2.2. 오늘의집 디자인 원칙

**출처**: [오늘의집 프로덕트 디자인 원칙](https://www.bucketplace.com/post/2020-12-10-%ED%94%84%EB%A1%9C%EB%8D%95%ED%8A%B8-%EB%94%94%EC%9E%90%EC%9D%B8-%EC%9B%90%EC%B9%99/), [오늘의집 디자인 문화](https://www.bucketplace.com/culture/Design/)

| 항목 | 핵심 내용 | moment-stock 적용 포인트 |
|------|-----------|--------------------------|
| **목표 지향** | 완벽함보다 목표 달성 우선. 디자인은 수단, 문제 해결이 목적 | 디자인 고도화도 "사용자 구매 전환율 향상"이라는 목표에 집중 |
| **유저 중심** | 정성적·정량적 데이터로 본질적 문제 발견 | 재고 소진 과정에서 사용자가 느끼는 긴박감의 적정 수준 설계 |
| **1%의 감성** | 마지막 1%의 감성적 터치(사용성의 재미, 말투의 위트) | 구매 완료 시 축하 마이크로인터랙션, 품절 시 위로 메시지 |
| **빠른 시도** | 빠른 시도, 빠른 학습 | Figma MCP로 디자인→코드 변환 속도 단축 |
| **브레이크포인트** | 375px, 768px, 1024px, 1256px | 현재 360px/768px/1280px → 오늘의집과 유사한 체계 유지 |

---

## 3. 현재 디자인 시스템 GAP 분석

### 3.1. 토큰 시스템

| 항목 | 현재 상태 | 목표 상태 | 갭 |
|------|-----------|-----------|-----|
| 색상 | primary(10단계) + stock(5단계) + semantic(4종) | + background, text, border, surface, overlay 시멘틱 레이어 + 다크모드 1:1 대응 | 시멘틱 레이어 부재, 다크모드 미지원 |
| 간격 | spacing 12단계 (0~80px) | 동일 유지 + Figma auto layout 기반 검증 | Figma 연동 미검증 |
| 타이포그래피 | fontSize 8단계 | + fontWeight, lineHeight, letterSpacing 체계화 | weight/height 미정의 |
| 그림자 | 미정의 | elevation 3단계 (sm, md, lg) + 다크모드 대체 | 전체 부재 |
| 반경 | 미정의 | borderRadius 4단계 (sm, md, lg, full) | 전체 부재 |
| 애니메이션 | 미정의 | duration, easing 토큰 (motion-reduce 대응 포함) | 전체 부재 |

### 3.2. 컴포넌트 체계

| 항목 | 현재 상태 | 목표 상태 | 갭 |
|------|-----------|-----------|-----|
| 분류 체계 | 긴박감 UI 4종 + Header + ProductCard (비체계적) | Atoms → Molecules → Organisms 아토믹 분류 | 분류 미적용 |
| API 패턴 | 전부 Flat (props 기반) | Flat(Badge, Button) + Compound(ProductCard, TimeSaleCard) | Compound 미도입 |
| 상태 변형 | 컴포넌트별 개별 처리 | 표준 variants 시스템 (size, variant, state) | 미체계화 |
| 다크모드 | 미지원 | 모든 컴포넌트 라이트/다크 대응 | 전체 부재 |

### 3.3. UX/접근성

| 항목 | 현재 상태 | 목표 상태 | 갭 |
|------|-----------|-----------|-----|
| ARIA | 기본 aria-label, aria-live 적용 | + 초점 관리, 라이브 리전 세분화 (polite/assertive) | 초점 관리 미흡 |
| 명도 대비 | 미검증 | 4.5:1(AA) 전체 검증 | 검증 미수행 |
| 마이크로인터랙션 | 재고 숫자 transition만 존재 | 구매 완료 축하, 품절 위로, 장바구니 추가 피드백 | 피드백 부재 |
| UX Writing | 기본 텍스트만 | 잡초 뽑기 적용, 전문 용어 제거, 감성적 톤 | 미적용 |

---

## 4. 고도화 Phase 구성

### Phase 개요

| Phase | 명칭 | 목표 | 주도 |
|-------|------|------|------|
| D1 | 토큰 체계 고도화 | 시멘틱 컬러 레이어 + 다크모드 + 그림자/반경/애니메이션 토큰 | Product Designer |
| D2 | 컴포넌트 아토믹 재구성 | Atoms/Molecules/Organisms 분류 + Compound 패턴 도입 | UI Artisan + Product Designer |
| D3 | 마이크로인터랙션 + UX Writing | 구매 피드백, 품절 위로, 잡초 뽑기, 감성적 톤 | Product Designer |
| D4 | 접근성 + 다크모드 구현 | 명도 대비 검증, 초점 관리, 다크모드 전체 적용 | UI Artisan |

---

## 5. Phase D1 — 토큰 체계 고도화

### 목표

현재 3개 카테고리(colors, spacing, fontSize)의 토큰을 시멘틱 레이어 체계로 확장하고, 다크모드와 애니메이션 토큰을 추가한다.

### 산출물

**시멘틱 컬러 레이어 확장** (`packages/ui/src/tokens.ts`):

```
colors.background    → { primary, secondary, tertiary, inverse }
colors.text          → { primary, secondary, tertiary, disabled, inverse }
colors.border        → { default, strong, subtle }
colors.surface       → { default, raised, overlay }
colors.interactive   → { default, hover, pressed, disabled }
```

**다크모드 1:1 대응**:

```
colors.light.background.primary = "#ffffff"
colors.dark.background.primary  = "#171B1C"  (쿨그레이, 순수 블랙 지양)
```

**추가 토큰**:

| 토큰 | 내용 |
|------|------|
| `shadow` | sm(`0 1px 2px`), md(`0 4px 8px`), lg(`0 8px 24px`) + 다크모드에서는 명도 차이로 대체 |
| `borderRadius` | sm(4px), md(8px), lg(12px), xl(16px), full(9999px) |
| `fontWeight` | regular(400), medium(500), semibold(600), bold(700) |
| `lineHeight` | tight(1.25), normal(1.5), relaxed(1.75) |
| `animation` | duration: fast(150ms), normal(250ms), slow(350ms) + easing: easeOut, easeInOut |

### 완료 기준

- `tokens.ts`에 시멘틱 컬러 레이어 + 다크모드 팔레트 정의
- 그림자, 반경, fontWeight, lineHeight, animation 토큰 추가
- 기존 컴포넌트(StockGaugeBar 등)가 새 토큰으로 마이그레이션 가능한 구조

---

## 6. Phase D2 — 컴포넌트 아토믹 재구성

### 목표

현재 비체계적으로 배치된 컴포넌트를 Atoms → Molecules → Organisms로 분류하고, 복합 컴포넌트에 Compound 패턴을 도입한다.

### 산출물

**아토믹 분류 구조** (`apps/web/app/_components/`):

```
_components/
├── atoms/
│   ├── badge.tsx          # Flat API (variant: default|success|warning|error)
│   ├── button.tsx         # Flat API (size: sm|md|lg, variant: primary|secondary|ghost)
│   ├── icon.tsx           # SVG 아이콘 래퍼
│   └── skeleton.tsx       # 로딩 스켈레톤
├── molecules/
│   ├── stock-gauge-bar.tsx    # 기존 urgency/ → molecules로 이동
│   ├── countdown-timer.tsx
│   ├── scarcity-badge.tsx
│   ├── stock-display.tsx
│   ├── price-tag.tsx          # 원가/할인가/할인율 조합
│   └── input-field.tsx        # label + input + error message
├── organisms/
│   ├── product-card.tsx       # Compound API (ProductCard.Image, .Info, .Stock, .Action)
│   ├── time-sale-card.tsx     # Compound API (TimeSaleCard.Timer, .Price, .Stock)
│   ├── header.tsx
│   └── cart-item.tsx
└── templates/
    ├── product-grid.tsx       # 상품 그리드 레이아웃
    └── sale-banner.tsx        # 타임 세일 배너
```

**Compound 패턴 예시 (ProductCard)**:

```tsx
// 사용처에서 자유롭게 조합
<ProductCard>
  <ProductCard.Image src={...} alt={...} />
  <ProductCard.Info>
    <ProductCard.Name>{name}</ProductCard.Name>
    <ProductCard.Price original={89000} discounted={62300} />
  </ProductCard.Info>
  <ProductCard.Stock quantity={5} initial={100} />
</ProductCard>
```

### 완료 기준

- 기존 컴포넌트가 atoms/molecules/organisms로 재분류
- ProductCard, TimeSaleCard에 Compound 패턴 적용
- Button, Badge에 표준 variants 시스템 (size, variant) 적용

---

## 7. Phase D3 — 마이크로인터랙션 + UX Writing

### 목표

사용자 행동에 대한 감성적 피드백을 추가하고, 전체 텍스트에 잡초 뽑기(Weed Cutting)를 적용한다.

### 산출물

**마이크로인터랙션**:

| 트리거 | 피드백 | 구현 방식 |
|--------|--------|-----------|
| 장바구니에 담기 | 헤더 장바구니 아이콘 바운스 + 토스트 | CSS animation + Zustand toast |
| 구매 완료 | 체크마크 애니메이션 + "구매 완료!" 텍스트 | Lottie 또는 CSS |
| 품절 전환 | 상품 카드 grayscale 전환 + "다음 기회에!" 위로 메시지 | CSS filter + 텍스트 |
| 재고 5개 이하 | 뱃지 펄스 + 햅틱 피드백(앱) | CSS pulse + Expo Haptics |
| 카운트다운 1분 미만 | 타이머 색상 빨강 전환 + 크기 확대 | CSS transition |
| 대기열 입장 허가 | 축하 이펙트 + 자동 이동 | CSS confetti + router.push |

**UX Writing 잡초 뽑기**:

| 현재 | 개선 | 사유 |
|------|------|------|
| "상품을 불러오는 중..." | "잠시만요" | 불필요한 기술 용어 제거 |
| "네트워크 연결을 확인해주세요. 구매 기능이 제한됩니다." | "인터넷 연결이 끊겼어요" | 간결화 + 쉬운 표현 |
| "결제 처리 중 오류가 발생했습니다." | "결제에 실패했어요. 다시 시도해주세요" | 원인+행동 안내 |
| "유효한 상품 ID가 아닙니다." | "상품을 찾을 수 없어요" | 기술 용어 제거 |

### 완료 기준

- 6가지 마이크로인터랙션 구현 (`prefers-reduced-motion` 대응 포함)
- 전체 사용자 대면 텍스트 잡초 뽑기 완료
- 에러 메시지 "원인 → 행동 안내" 패턴 통일

---

## 8. Phase D4 — 접근성 + 다크모드 구현

### 목표

명도 대비 전수 검증, 키보드/스크린 리더 초점 관리 고도화, 다크모드 전체 적용.

### 산출물

**접근성 고도화**:

| 항목 | 내용 |
|------|------|
| 명도 대비 | 전체 텍스트/배경 조합 4.5:1(AA) 검증. 미달 시 토큰 수정 |
| 초점 관리 | 모달 열림 시 초점 트랩, 닫힘 시 원래 위치 복귀 |
| 라이브 리전 | 재고 변경: `aria-live="polite"`, 품절: `aria-live="assertive"` |
| 큰 텍스트 모드 | `font-size: clamp()`로 동적 크기 대응 |
| 키보드 | Tab 순서 논리적 보장, Enter/Space 버튼 동작, Esc 모달 닫기 |

**다크모드 구현**:

- `tokens.ts`에 정의된 light/dark 팔레트를 Tailwind `dark:` 클래스로 매핑
- `prefers-color-scheme` 미디어 쿼리 + 수동 토글 지원
- 그림자 → 명도 차이(Elevated)로 대체 (다크모드 특화 규칙)
- 모든 시멘틱 컬러가 다크모드에서 1:1 대응 확인

### 완료 기준

- Lighthouse 접근성 95+ 달성
- 스크린 리더(VoiceOver) 전체 구매 플로우 수동 테스트 통과
- 다크모드 전체 페이지 시각적 검증
- 명도 대비 4.5:1 미달 항목 0건

---

## 9. Phase 간 의존 관계

```
Phase D1 (토큰 체계)
  │
  ├───────────────────┐
  ▼                   ▼
Phase D2 (아토믹)   Phase D3 (인터랙션 + UX Writing)
  │                   │
  └────────┬──────────┘
           ▼
        Phase D4 (접근성 + 다크모드)
```

- D1은 모든 Phase의 선행 조건 (토큰이 확정되어야 컴포넌트/인터랙션/다크모드 구현 가능)
- D2와 D3는 병렬 진행 가능
- D4는 D1~D3 완료 후 전체 검수

---

## 10. Figma MCP 활용 계획

각 Design Phase에서 Figma MCP를 다음과 같이 활용한다:

| Phase | Figma MCP 활용 |
|-------|---------------|
| D1 | Figma 파일에서 색상/간격/타이포그래피 토큰 추출 → `tokens.ts` 자동 반영 |
| D2 | Figma 컴포넌트 구조 분석 → Compound 패턴 props 인터페이스 도출 |
| D3 | Figma 프로토타입의 인터랙션 타이밍 추출 → animation 토큰 반영 |
| D4 | Figma의 다크모드 프레임 분석 → dark 팔레트 1:1 매핑 검증 |

워크플로: `get_figma_data` → `design/tokens/` JSON 기록 → `tokens.ts` 반영 → `download_figma_images` 에셋 추출
