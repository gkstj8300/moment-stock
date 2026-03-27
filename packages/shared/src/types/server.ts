/**
 * Server 타입 — database.types.ts에서 파생된 DB 행 타입
 * 이 파일의 타입은 api/*.ts와 test/msw 핸들러에서만 직접 참조한다.
 * "ServerXxx" 접두어로 UI 엔티티 타입과 구분한다.
 */
import type { Database } from "./database.types";

// profiles
export type ServerProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type ServerProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ServerProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// products
export type ServerProduct = Database["public"]["Tables"]["products"]["Row"];
export type ServerProductInsert = Database["public"]["Tables"]["products"]["Insert"];

// stocks
export type ServerStock = Database["public"]["Tables"]["stocks"]["Row"];
export type ServerStockUpdate = Database["public"]["Tables"]["stocks"]["Update"];

// orders
export type ServerOrder = Database["public"]["Tables"]["orders"]["Row"];
export type ServerOrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

// time_sales
export type ServerTimeSale = Database["public"]["Tables"]["time_sales"]["Row"];
export type ServerTimeSaleInsert = Database["public"]["Tables"]["time_sales"]["Insert"];

// waitlist
export type ServerWaitlist = Database["public"]["Tables"]["waitlist"]["Row"];

// RPC 함수 타입
export type PurchaseStockArgs = Database["public"]["Functions"]["purchase_stock"]["Args"];
export type CancelOrderArgs = Database["public"]["Functions"]["cancel_order"]["Args"];
