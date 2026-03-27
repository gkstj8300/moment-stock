# Project Guidelines

## 개발 페르소나 (Development Personas)
작업의 성격에 따라 아래 페르소나 중 하나를 채택하여 진행한다. 각 페르소나의 상세 지침은 `docs\personas` 폴더의 개별 파일을 참조한다.

- **Monorepo Lead (`persona-lead.md`)**: 프로젝트 구조 설계, TurboRepo 설정, 패키지 간 의존성 및 공통 모듈 관리.
- **Engine Designer (`persona-engine.md`)**: Supabase 스키마 설계, DB 트랜잭션(RPC), RLS 보안 정책 및 데이터 무결성 관리.
- **Sync Master (`persona-sync.md`)**: 실시간 데이터 구독(Realtime), TanStack Query 상태 관리, 낙관적 업데이트 및 데이터 동기화 로직.
- **UI Artisan (`persona-artisan.md`)**: 웹/앱 UI 컴포넌트 구현, 인터랙션 애니메이션, 플랫폼 특화 UX 및 디자인 시스템 관리.

## 문서 작성 및 수정 규칙

문서를 작성하거나 수정할 때 반드시 `/docs/rules/document-template-rule.md`를 먼저 읽고 해당 규격을 따른다.

## 모호한 지시 처리 규칙

사용자의 지시가 모호할 경우 임의로 작업을 시작해서는 안된다. `/docs/rules/unclear-rule.md`를 먼저 읽고 해당 규칙을 따른다.

## 코딩 규칙 + 작업단위 가이드라인

프론트엔드 코드를 작성하거나 수정할 때 반드시 `docs\rules\frontend-coding-rules.md`를 먼저 읽고 해당 규칙을 따른다.

## Phase 완료 검토 규칙

각 Phase 구현 완료 시 반드시 `docs/rules/phase-review-rule.md`를 읽고 해당 절차를 따른다. 자동화 테스트 → 회귀 테스트 → 페르소나별 교차 검토 → 완료 기준 대조 → 결과 기록 순서로 진행하며, 검토 결과는 `docs/reviews/phase-{N}-review.md`에 기록한다.

## 상수·타입 배치

상수 분류, 타입 파일 배치, import 규칙, mapper 패턴은 `docs\rules\code-organization.md`를 참조한다.

## 커밋 메시지
```
feat: 새로운 기능
fix: 버그 수정
docs: 문서 수정
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드/설정 변경
```