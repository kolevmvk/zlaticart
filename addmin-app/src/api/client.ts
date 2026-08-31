export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export const API_BASE_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL ?? ''
