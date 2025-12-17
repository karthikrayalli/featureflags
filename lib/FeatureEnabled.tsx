import { canViewFeature, FeatureFlagName } from "./featureFlags"
import { ReactNode } from "react"
import { useFeatureFlags } from "./featureFlagsProvider"

export function FeatureEnabled({
  featureFlag,
  children,
}: {
  featureFlag: FeatureFlagName
  children: ReactNode
}) {
  const { flags, currentUser } = useFeatureFlags()
  return canViewFeature(featureFlag, currentUser, flags) ? <>{children}</> : null
}