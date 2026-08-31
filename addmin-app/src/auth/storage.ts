import * as SecureStore from 'expo-secure-store'

import { ADMIN_SESSION_STORAGE_KEY, type AdminSession } from './session'

export async function readStoredSession(): Promise<AdminSession | null> {
  const raw = await SecureStore.getItemAsync(ADMIN_SESSION_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSession>
    return typeof parsed.token === 'string' && parsed.token ? { token: parsed.token } : null
  } catch {
    await clearStoredSession()
    return null
  }
}

export async function writeStoredSession(session: AdminSession) {
  await SecureStore.setItemAsync(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export async function clearStoredSession() {
  await SecureStore.deleteItemAsync(ADMIN_SESSION_STORAGE_KEY)
}
