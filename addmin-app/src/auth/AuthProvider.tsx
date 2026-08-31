import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { loginWithPin, logoutSession } from '@/api/admin'
import { clearStoredSession, readStoredSession, writeStoredSession } from './storage'
import type { AdminSession } from './session'

type AuthContextValue = {
  session: AdminSession | null
  loading: boolean
  login: (pin: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    readStoredSession()
      .then((storedSession) => {
        if (active) setSession(storedSession)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (pin: string) => {
    const nextSession = await loginWithPin(pin)
    await writeStoredSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(async () => {
    const currentSession = session
    await clearStoredSession()
    setSession(null)

    if (currentSession) {
      try {
        await logoutSession(currentSession)
      } catch {
        // Logout is stateless on the proxy; local token removal is authoritative.
      }
    }
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, login, logout }),
    [loading, login, logout, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return value
}
