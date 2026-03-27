/**
 * Query Key 팩토리 — 도메인별 쿼리 키 중앙 관리
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...orderKeys.lists(), filters] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export const timeSaleKeys = {
  all: ["timeSales"] as const,
  active: () => [...timeSaleKeys.all, "active"] as const,
  detail: (id: string) => [...timeSaleKeys.all, "detail", id] as const,
};

export const stockKeys = {
  all: ["stocks"] as const,
  byProduct: (productId: string) =>
    [...stockKeys.all, productId] as const,
};
