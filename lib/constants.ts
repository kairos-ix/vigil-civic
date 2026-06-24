export const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️', color: '#DC2626' },
  { value: 'water_leakage', label: 'Water Leakage', icon: '💧', color: '#2563EB' },
  { value: 'streetlight', label: 'Broken Streetlight', icon: '💡', color: '#D97706' },
  { value: 'waste', label: 'Waste/Garbage', icon: '🗑️', color: '#16A34A' },
  { value: 'road_damage', label: 'Road Damage', icon: '🚧', color: '#9333EA' },
  { value: 'drainage', label: 'Drainage Issue', icon: '🌊', color: '#0891B2' },
  { value: 'other', label: 'Other', icon: '📍', color: '#6B7280' },
]

export const SEVERITY_COLORS: Record<string, string> = {
  low: '#16A34A',
  medium: '#D97706',
  high: '#EA580C',
  critical: '#DC2626',
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  reported: { label: 'Reported', color: '#6B7280', bg: '#F3F4F6' },
  community_verified: { label: 'Verified', color: '#2563EB', bg: '#EFF6FF' },
  in_progress: { label: 'In Progress', color: '#D97706', bg: '#FFFBEB' },
  resolved: { label: 'Resolved', color: '#16A34A', bg: '#F0FDF4' },
  rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2' },
}

export const POINTS = {
  REPORT: 10,
  FIRST_BONUS: 25,
  VERIFY: 5,
  RESOLVE: 25,
  UPVOTE: 5,
}

export const VERIFICATION_THRESHOLD = 3
export const DUPLICATE_RADIUS_METERS = 200
export const DUPLICATE_DAYS = 7
export const CLUSTER_RADIUS_METERS = 500
export const CLUSTER_THRESHOLD = 3
