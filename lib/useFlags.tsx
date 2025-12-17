import { useMemo } from 'react';
import { useFeatureFlags } from './featureFlagsProvider';
import { canViewFeature, FeatureFlagName } from './featureFlags';

/**
 * Hook to check multiple feature flags at once
 * @param flagNames - Array of feature flag names to check
 * @returns Object with flag names as keys and boolean values
 * 
 * @example
 * const { viewAccountingNavTab, advancedAnalytics } = useFlags(['viewAccountingNavTab', 'advancedAnalytics']);
 * 
 * const filteredTabs = viewAccountingNavTab
 *   ? tabsList
 *   : tabsList.filter((tab) => tab.tabValue !== "accounting");
 */
export function useFlags<T extends FeatureFlagName[]>(
  flagNames: T
): Record<T[number], boolean> {
  const { flags, currentUser } = useFeatureFlags();

  const flagValues = useMemo(() => {
    const result: Record<string, boolean> = {};
    
    flagNames.forEach((flagName) => {
      result[flagName] = canViewFeature(flagName, currentUser, flags);
    });
    
    return result as Record<T[number], boolean>;
  }, [flagNames, flags, currentUser]);

  return flagValues;
}
