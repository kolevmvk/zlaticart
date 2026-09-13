import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { loginWithPin, logoutSession, setUnauthorizedListener } from '@/api/admin'
import { clearStoredSession, readStoredSession, writeStoredSession } from './storage'
import type { AdminSession } from './session'

type AuthContextValue = {
  session: AdminSession | null
  loading: boolean
  /**
   * Server je odbio token (istek ili opoziv). Sesija namerno OSTAJE u stanju
   * dok se korisnik ponovo ne prijavi — ekrani se ne preusmeravaju na login,
   * pa otvorena forma i njen unos ostaju netaknuti.
   */
  expired: boolean
  login: (pin: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [expired, setExpired] = useState(false)

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

  useEffect(() => {
    const currentToken = session?.token
    setUnauthorizedListener((token) => {
      // Zakasneli 401 za token pre ponovne prijave ne sme da obori novu sesiju.
      if (token === currentToken) setExpired(true)
    })
    return () => setUnauthorizedListener(null)
  }, [session])

  const login = useCallback(async (pin: string) => {
    const nextSession = await loginWithPin(pin)
    await writeStoredSession(nextSession)
    setSession(nextSession)
    setExpired(false)
  }, [])

  const logout = useCallback(async () => {
    const currentSession = session
    await clearStoredSession()
    setSession(null)
    setExpired(false)

    if (currentSession) {
      try {
        await logoutSession(currentSession)
      } catch {
        // Lokalno brisanje tokena je dovoljno za uređaj; serverski opoziv je
        // najbolji pokušaj (bez mreže token ističe sam, najkasnije za 24h).
      }
    }
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({ session, loading, expired, login, logout }),
    [expired, loading, login, logout, session],
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
