/**
 * 푸시 알림 등록 및 관리
 * expo-notifications를 통해 FCM 토큰 등록
 */

// TODO: expo-notifications 패키지 설치 후 활성화
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";

export async function registerForPushNotifications(): Promise<string | null> {
  // TODO: 실제 구현
  // 1. 권한 요청
  // 2. FCM 토큰 획득
  // 3. 서버에 토큰 저장
  console.log("[notifications] Push notification registration (mock)");
  return null;
}

export async function sendLocalNotification(
  title: string,
  body: string
): Promise<void> {
  // TODO: expo-notifications로 로컬 알림 전송
  console.log(`[notifications] Local: ${title} - ${body}`);
}
