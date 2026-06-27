/** MongoDB filter: real user-submitted issues only (excludes demo seed data). */
export const REAL_ISSUES_FILTER = { isSeedData: { $ne: true } } as const

/** MongoDB filter: real user accounts only (excludes demo seed accounts). */
export const REAL_USERS_FILTER = { isSeedUser: { $ne: true } } as const
