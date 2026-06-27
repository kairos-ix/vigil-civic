import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import { AUTH } from '@/lib/constants'
import User from '@/models/User'
import type { IUser } from '@/models/User'

function getSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET not defined')
  return s
}

type TokenPayload = jwt.JwtPayload & { userId: string }

export const hashPassword = (p: string) => bcrypt.hash(p, 12)

export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h)

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, getSecret(), { expiresIn: `${AUTH.JWT_EXPIRY_SECONDS}s` })

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload
  } catch {
    return null
  }
}

function shouldRefreshToken(payload: TokenPayload): boolean {
  if (payload.iat == null || payload.exp == null) return false
  const now = Math.floor(Date.now() / 1000)
  const lifetime = payload.exp - payload.iat
  const elapsed = now - payload.iat
  return elapsed >= lifetime * AUTH.JWT_REFRESH_RATIO
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH.JWT_EXPIRY_SECONDS,
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set(AUTH.COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export async function getServerUser(): Promise<IUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH.COOKIE_NAME)?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload?.userId) return null

  await connectDB()
  const user = await User.findById(payload.userId).select('-passwordHash')
  if (!user) return null

  if (shouldRefreshToken(payload)) {
    const newToken = generateToken(payload.userId)
    await setAuthCookie(newToken)
  }

  return user
}

/** @deprecated Prefer getServerUser(); kept for route handlers that only need an id. */
export async function getUserIdFromRequest(): Promise<string | null> {
  const user = await getServerUser()
  return user ? user._id.toString() : null
}

export function toSafeUser(user: IUser) {
  const obj = user.toObject() as Record<string, unknown>
  delete obj.passwordHash
  delete obj.resetTokenHash
  delete obj.resetTokenExpiresAt
  delete obj.resetCodeHash
  delete obj.resetCodeExpiresAt
  delete obj.emailVerificationCodeHash
  delete obj.emailVerificationCodeExpiresAt
  return obj
}
