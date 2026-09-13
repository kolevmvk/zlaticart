import 'server-only'

import { createClient } from '@supabase/supabase-js'

/**
 * Deljeni store za admin prijavu: limiter pokušaja i evidentirane sesije.
 *
 * Zašto baza a ne memorija: Next.js na Vercel-u radi u više instanci koje ne
 * dele memoriju, pa in-memory limiter daje napadaču N puta više pokušaja.
 *
 * Pristup ide isključivo preko `service_role` ključa, samo sa servera. Tabele
 * imaju RLS bez policy-ja, pa anon/publishable ključ ne može ništa.
 *
 * FAIL CLOSED: ako store nije konfigurisan ili ne odgovara, prijava se ODBIJA.
 * Greška store-a ne sme da otvori pristup.
 */

export const LOGIN_WINDOW_SECONDS = 15 * 60
export const LOGIN_MAX_ATTEMPTS = 5

export type AdminStoreErrorCode = 'store_not_configured' | 'store_unavailable'

export class AdminStoreError extends Error {
  constructor(
    public readonly code: AdminStoreErrorCode,
    /** Originalna greška store-a; namerno se ne prosleđuje klijentu. */
    public readonly detail?: unknown,
  ) {
    super(code)
  }
}

function makeClient(url: string, key: string) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'zlaticart' },
  })
}

let cached: ReturnType<typeof makeClient> | null = null

function readServiceKey() {
  // Supabase je preimenovao service_role -> secret key; podržavamo oba imena.
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    null
  )
}

export function adminStoreConfigured() {
  return Boolean(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) && readServiceKey(),
  )
}

function client() {
  if (cached) return cached

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = readServiceKey()

  if (!url || !key) {
    throw new AdminStoreError('store_not_configured')
  }

  cached = makeClient(url, key)
  return cached
}

/** Samo za testove — briše keširan klijent između slučajeva. */
export function resetAdminStoreClientForTest() {
  cached = null
}

/**
 * Atomski registruje pokušaj prijave i kaže da li je dozvoljen.
 *
 * Prebrojavanje i upis se dešavaju u jednoj transakciji pod advisory lock-om,
 * pa dve paralelne instance ne mogu da vide isto stanje i obe propuste pokušaj.
 */
export async function registerLoginAttempt(attemptKey: string, succeeded: boolean) {
  const { data, error } = await client().rpc('admin_register_login_attempt', {
    p_key: attemptKey,
    p_window_seconds: LOGIN_WINDOW_SECONDS,
    p_max_attempts: LOGIN_MAX_ATTEMPTS,
    p_succeeded: succeeded,
  })

  if (error) {
    throw new AdminStoreError('store_unavailable', error)
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row.allowed !== 'boolean') {
    throw new AdminStoreError('store_unavailable', data)
  }

  return {
    allowed: row.allowed as boolean,
    retryAfterSeconds: Number(row.retry_after_seconds ?? 0),
  }
}

/** Upisuje sesiju pri prijavi. Bez ovog zapisa token se kasnije odbija. */
export async function recordSession(jti: string, expiresAtUnix: number) {
  const { error } = await client()
    .from('admin_sessions')
    .insert({ jti, expires_at: new Date(expiresAtUnix * 1000).toISOString() })

  if (error) {
    throw new AdminStoreError('store_unavailable', error)
  }
}

/**
 * Da li je sesija još aktivna.
 *
 * Nepoznat `jti` je NEVALIDAN — token potpisan ispravnim tajnim ključem ali
 * bez zapisa u bazi ne prolazi. Time stari tokeni izdati pre uvođenja store-a
 * prestaju da rade, što je namerno.
 */
export async function isSessionActive(jti: string) {
  const { data, error } = await client()
    .from('admin_sessions')
    .select('jti, revoked_at, expires_at')
    .eq('jti', jti)
    .maybeSingle()

  if (error) {
    throw new AdminStoreError('store_unavailable', error)
  }

  if (!data || data.revoked_at) return false
  return new Date(data.expires_at).getTime() > Date.now()
}

/** Opoziva sesiju. Idempotentno — ponovni logout ne menja prvo vreme opoziva. */
export async function revokeSession(jti: string) {
  const { error } = await client()
    .from('admin_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('jti', jti)
    .is('revoked_at', null)

  if (error) {
    throw new AdminStoreError('store_unavailable', error)
  }
}
