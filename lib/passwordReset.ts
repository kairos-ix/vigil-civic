import crypto from 'crypto'

import { PASSWORD_RESET } from '@/lib/constants'

export function generatePasswordResetCode(): string {
  const min = 10 ** (PASSWORD_RESET.CODE_DIGITS - 1)
  const max = 10 ** PASSWORD_RESET.CODE_DIGITS
  return crypto.randomInt(min, max).toString()
}

export function hashPasswordResetCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export function passwordResetCodeExpiresAt(): Date {
  return new Date(Date.now() + PASSWORD_RESET.EXPIRY_MS)
}
