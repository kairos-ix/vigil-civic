import { AlertCircle, Droplet, LightbulbOff, Trash2, Construction, Waves, MapPin } from 'lucide-react'

export const CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: AlertCircle, color: '#0c5f82' },
  { value: 'water_leakage', label: 'Water Leakage', icon: Droplet, color: '#0787b7' },
  { value: 'streetlight', label: 'Broken Streetlight', icon: LightbulbOff, color: '#3aa7c5' },
  { value: 'waste', label: 'Waste/Garbage', icon: Trash2, color: '#0f8ca8' },
  { value: 'road_damage', label: 'Road Damage', icon: Construction, color: '#075f82' },
  { value: 'drainage', label: 'Drainage Issue', icon: Waves, color: '#76c3d6' },
  { value: 'other', label: 'Other', icon: MapPin, color: '#62899b' },
]

export const formatCategory = (category: string) =>
  category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export const SEVERITY_COLORS: Record<string, string> = {
  low: '#76c3d6',
  medium: '#3aa7c5',
  high: '#0787b7',
  critical: '#c2413b',
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  reported: { label: 'Reported', color: '#62899b', bg: '#eef7fb' },
  community_verified: { label: 'Verified', color: '#0787b7', bg: '#e8f6fb' },
  in_progress: { label: 'In Progress', color: '#0c5f82', bg: '#eef9fc' },
  resolved: { label: 'Resolved', color: '#0f8ca8', bg: '#e7f8fb' },
  rejected: { label: 'Rejected', color: '#c2413b', bg: '#fdf0ef' },
}

export const POINTS = {
  REPORT: 10,
  VERIFY: 5,
  REPORTER_VERIFIED_BONUS: 15,
  RESOLVED: 25,
  UPVOTE: 5,
  FIRST_BONUS: 25,
} as const

export const VERIFICATION_THRESHOLD = 3
export const DUPLICATE_RADIUS_METERS = 200
export const DUPLICATE_DAYS = 7
export const CLUSTER_RADIUS_METERS = 500
export const CLUSTER_THRESHOLD = 3
export const ISSUE_DELETE_RESTRICTED_STATUSES = [
  'in_progress',
  'resolved',
  'rejected',
] as const
export const ISSUE_CLOSED_STATUSES = ['resolved', 'rejected'] as const

export const AUTH = {
  COOKIE_NAME: 'vigil_token',
  JWT_EXPIRY_SECONDS: 604800, // 7 days
  JWT_REFRESH_RATIO: 0.5,
  MIN_PASSWORD_LENGTH: 6,
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
  REGISTER_MAX_ATTEMPTS: 5,
  REGISTER_WINDOW_MS: 60 * 60 * 1000,
  VERIFY_EMAIL_MAX_ATTEMPTS: 5,
  VERIFY_EMAIL_WINDOW_MS: 15 * 60 * 1000,
  FORGOT_PASSWORD_MAX_ATTEMPTS: 3,
  FORGOT_PASSWORD_WINDOW_MS: 60 * 60 * 1000,
} as const

export const EMAIL_VERIFICATION = {
  CODE_DIGITS: 6,
  EXPIRY_MS: 10 * 60 * 1000,
} as const

export const PASSWORD_RESET = {
  CODE_DIGITS: 6,
  EXPIRY_MS: 15 * 60 * 1000,
  GENERIC_SUCCESS_MESSAGE:
    'If an account exists for that email, a reset code has been sent.',
} as const

export const EMAIL_THEME = {
  background: '#f7fbfd',
  surface: '#ffffff',
  foreground: '#0b2533',
  bodyText: '#446b7d',
  mutedText: '#62899b',
  primary: '#0787b7',
  primaryActive: '#075f82',
  secondary: '#e8f6fb',
  accent: '#eef9fc',
  muted: '#eef7fb',
  border: '#dcebf2',
  borderStrong: '#c2d8e3',
  shadow: 'rgba(7,135,183,0.16)',
} as const

export const DATABASE = {
  MONGO_SERVER_SELECTION_TIMEOUT_MS: 5000,
} as const
