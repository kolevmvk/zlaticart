import 'server-only'

import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'

const SESSION_TTL_SECONDS = 24 * 60 * 60
const TOKEN_SUBJECT = 'zlaticart-admin'

type SessionClaims = {
  sub: typeof TOKEN_SUBJECT
  iat: number
  exp: number
}

type PinHashParts = {
  iterations: number
  salt: Buffer
  hash: Buffer
}

export type AdminAuthErrorCode = 'missing_config' | 'invalid_credentials' | 'invalid_token'

export class AdminAuthError extends Error {
  constructor(public readonly code: AdminAuthErrorCode) {
    super(code)
  }
}

export function isSixDigitPin(value: unknown): value is string {
  return typeof value === 'string' && /^\d{6}$/.test(value)
}

export function adminAuthConfigured() {
  return Boolean(process.env.ADMIN_PIN_HASH && process.env.ADMIN_SESSION_SECRET)
}

export function createAdminSessionToken(now = currentUnixSeconds()) {
  const secret = readSessionSecret()
  const claims: SessionClaims = {
    sub: TOKEN_SUBJECT,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  }

  const header = base64UrlEncodeJson({ alg: 'HS256', typ: 'JWT' })
  const payload = base64UrlEncodeJson(claims)
  const signature = sign(`${header}.${payload}`, secret)

  return `${header}.${payload}.${signature}`
}

export function verifyAdminSessionToken(token: string, now = currentUnixSeconds()) {
  const secret = readSessionSecret()
  const [header, payload, signature] = token.split('.')

  if (!header || !payload || !signature) {
    throw new AdminAuthError('invalid_token')
  }

  const expectedSignature = sign(`${header}.${payload}`, secret)
  if (!safeEqual(signature, expectedSignature)) {
    throw new AdminAuthError('invalid_token')
  }

  const claims = parseJsonPart<SessionClaims>(payload)
  if (claims.sub !== TOKEN_SUBJECT || claims.exp <= now) {
    throw new AdminAuthError('invalid_token')
  }

  return claims
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  const prefix = 'Bearer '

  if (!authorization.toLowerCase().startsWith(prefix.toLowerCase())) {
    return null
  }

  return authorization.slice(prefix.length).trim() || null
}

export function verifyAdminRequest(request: Request) {
  const token = getBearerToken(request)
  if (!token) {
    throw new AdminAuthError('invalid_token')
  }

  return verifyAdminSessionToken(token)
}

export function verifyAdminPin(pin: string) {
  const pinHash = process.env.ADMIN_PIN_HASH
  if (!pinHash || !process.env.ADMIN_SESSION_SECRET) {
    throw new AdminAuthError('missing_config')
  }

  const { iterations, salt, hash } = parsePinHash(pinHash)
  const candidate = pbkdf2Sync(pin, salt, iterations, hash.length, 'sha256')

  if (!timingSafeEqual(candidate, hash)) {
    throw new AdminAuthError('invalid_credentials')
  }
}

export function createPinHash(pin: string, salt = randomBytes(16), iterations = 210_000) {
  if (!isSixDigitPin(pin)) {
    throw new Error('PIN must contain exactly 6 digits')
  }

  const hash = pbkdf2Sync(pin, salt, iterations, 32, 'sha256')
  return `pbkdf2:sha256:${iterations}:${salt.toString('base64url')}:${hash.toString('base64url')}`
}

function parsePinHash(value: string): PinHashParts {
  const [scheme, digest, iterationsRaw, saltRaw, hashRaw] = value.split(':')
  const iterations = Number(iterationsRaw)

  if (
    scheme !== 'pbkdf2' ||
    digest !== 'sha256' ||
    !Number.isInteger(iterations) ||
    iterations < 100_000 ||
    !saltRaw ||
    !hashRaw
  ) {
    throw new AdminAuthError('missing_config')
  }

  return {
    iterations,
    salt: Buffer.from(saltRaw, 'base64url'),
    hash: Buffer.from(hashRaw, 'base64url'),
  }
}

function readSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    throw new AdminAuthError('missing_config')
  }
  return secret
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function base64UrlEncodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function parseJsonPart<T>(value: string): T {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T
  } catch {
    throw new AdminAuthError('invalid_token')
  }
}

function currentUnixSeconds() {
  return Math.floor(Date.now() / 1000)
}
