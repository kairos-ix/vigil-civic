import crypto from 'crypto'

import { EMAIL_VERIFICATION } from '@/lib/constants'

export function generateEmailVerificationCode(): string {
  const min = 10 ** (EMAIL_VERIFICATION.CODE_DIGITS - 1)
  const max = 10 ** EMAIL_VERIFICATION.CODE_DIGITS
  return crypto.randomInt(min, max).toString()
}

export function hashEmailVerificationCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export function emailVerificationExpiresAt(): Date {
  return new Date(Date.now() + EMAIL_VERIFICATION.EXPIRY_MS)
}
