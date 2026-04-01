#!/bin/bash
# 테스트 사용자 생성 — Supabase Admin API 사용
# 사용법: bash scripts/create-test-users.sh
#
# ⚠️ supabase start 실행 후 사용할 것

SERVICE_KEY=$(npx supabase status 2>/dev/null | grep "Secret" | head -1 | awk '{print $4}')
API_URL="http://127.0.0.1:54321"

if [ -z "$SERVICE_KEY" ]; then
  echo "ERROR: Supabase가 실행되지 않았습니다. 'pnpm db:start'를 먼저 실행하세요."
  exit 1
fi

echo "=== 테스트 사용자 생성 ==="

# 사용자 1
RESULT1=$(curl -s -X POST "$API_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@moment-stock.com","password":"password123","email_confirm":true,"user_metadata":{"nickname":"테스트유저1"}}')

echo "User1: $RESULT1" | grep -o '"email":"[^"]*"'

# 사용자 2
RESULT2=$(curl -s -X POST "$API_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@moment-stock.com","password":"password123","email_confirm":true,"user_metadata":{"nickname":"테스트유저2"}}')

echo "User2: $RESULT2" | grep -o '"email":"[^"]*"'

# 로그인 테스트
ANON_KEY=$(npx supabase status 2>/dev/null | grep "Publishable" | awk '{print $4}')
LOGIN=$(curl -s -X POST "$API_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@moment-stock.com","password":"password123"}')

if echo "$LOGIN" | grep -q "access_token"; then
  echo "=== 로그인 테스트 성공 ==="
else
  echo "=== 로그인 테스트 실패 ==="
  echo "$LOGIN"
fi
