import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET!

export const hashPassword = (p: string) => bcrypt.hash(p, 12)

export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h)

export const generateToken = (userId: string) =>
  jwt.sign({ userId }, SECRET, { expiresIn: '7d' })

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, SECRET) as { userId: string }
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.substring(7)
  return req.cookies.get('vigil_token')?.value || null
}

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)?.userId || null
}
