import { User, UserRole } from "./getUser"
import { murmurhash } from "./murmurhash"

export type FeatureFlagName = string

type FeatureFlagRule = {
  percentageOfUsers?: number
  userRoles?: UserRole[]
  environment?: string
} & (
  | {
      percentageOfUsers: number
    }
  | { userRoles: UserRole[] }
)

export function getStoredFlags() {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem('featureFlags')
  return stored ? JSON.parse(stored) : {}
}

export function setStoredFlags(flags: Record<string, any>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('featureFlags', JSON.stringify(flags))
  }
}

export function getCurrentEnvironment(): string {
  if (typeof window === 'undefined') return 'production'
  const stored = localStorage.getItem('currentEnvironment')
  return stored || 'production'
}

export function setCurrentEnvironment(env: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentEnvironment', env)
  }
}

export const FEATURE_FLAGS = getStoredFlags()

export function canViewFeature(featureName: FeatureFlagName, user: User, flags?: Record<string, any>) {
  const currentFlags = flags || getStoredFlags()
  const rules = currentFlags[featureName]
  const currentEnv = getCurrentEnvironment()
  
  if (rules === undefined) return false
  if (typeof rules === "boolean") return rules
  
  return (rules as FeatureFlagRule[]).some(rule => {
    // Check if rule applies to current environment
    if (rule.environment && rule.environment !== currentEnv) return false
    return checkRule(rule, featureName, user)
  })
}

function checkRule(
  { userRoles, percentageOfUsers }: FeatureFlagRule,
  featureName: FeatureFlagName,
  user: User
) {
  return (
    userHasValidRole(userRoles, user.role) &&
    userIsWithinPercentage(featureName, percentageOfUsers, user.id)
  )
}

function userHasValidRole(
  allowedRoles: UserRole[] | undefined,
  userRole: UserRole
) {
  return allowedRoles == null || allowedRoles.includes(userRole)
}

const MAX_UINT_32 = 4294967295
function userIsWithinPercentage(
  featureName: FeatureFlagName,
  allowedPercent: number | undefined,
  flagId: string
) {
  if (allowedPercent == null) return true

  return murmurhash(`${featureName}-${flagId}`) / MAX_UINT_32 < allowedPercent
}