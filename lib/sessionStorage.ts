'use client'

/**
 * Typed helpers for sessionStorage.
 * - Keeps login data, form drafts, and UI state across reloads within the same tab.
 * - Automatically cleared when the tab is closed (sessionStorage behavior).
 */

const PREFIX = 'vigil:'

// ── Keys ──────────────────────────────────────────────────────
export const SESSION_KEYS = {
  /** Cached user object from /api/auth/me */
  USER: `${PREFIX}user`,
  /** Report form draft (text fields only, no images) */
  REPORT_DRAFT: `${PREFIX}report-draft`,
  /** Report form step */
  REPORT_STEP: `${PREFIX}report-step`,
  /** Report form image as base64 data url */
  REPORT_IMAGE_BASE64: `${PREFIX}report-image-base64`,
  /** Last known user location */
  USER_LOCATION: `${PREFIX}user-location`,
} as const

// ── Read / Write ──────────────────────────────────────────────
export function getSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function setSession<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export function removeSession(key: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function clearAllSessions(): void {
  if (typeof window === 'undefined') return
  try {
    const keys = Object.values(SESSION_KEYS)
    keys.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignore
  }
}
