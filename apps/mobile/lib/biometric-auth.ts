/**
 * 생체 인증 — FaceID/지문 인증 + PIN 폴백
 */
import * as LocalAuthentication from "expo-local-authentication";

export type BiometricResult =
  | { success: true }
  | { success: false; error: "NOT_ENROLLED" | "NOT_AVAILABLE" | "CANCELLED" | "FAILED" };

/**
 * 생체 인증 가능 여부 확인
 */
export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

/**
 * 생체 인증 수행
 */
export async function authenticateWithBiometric(
  promptMessage = "결제를 위해 인증해주세요"
): Promise<BiometricResult> {
  const available = await isBiometricAvailable();

  if (!available) {
    return { success: false, error: "NOT_AVAILABLE" };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: "취소",
    fallbackLabel: "PIN 입력",
    disableDeviceFallback: false, // PIN 폴백 허용
  });

  if (result.success) {
    return { success: true };
  }

  if (result.error === "user_cancel") {
    return { success: false, error: "CANCELLED" };
  }

  return { success: false, error: "FAILED" };
}
