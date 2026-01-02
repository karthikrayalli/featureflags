import { useMemo, useEffect, useState } from 'react';
import { useFeatureFlags } from '../providers/FeatureFlagsProvider';
import { canViewFeature, getVariantAssignment } from '../utils/featureFlagUtils';
import type { FeatureFlagName } from '../../types';

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
  const { flags, currentUser, currentEnvironment } = useFeatureFlags();
  const flagValues = useMemo(() => {
    const result: Record<string, boolean> = {};
    
    flagNames.forEach((flagName) => {
      result[flagName] = canViewFeature(flagName, currentUser, currentEnvironment, flags);
    });
    
    return result as Record<T[number], boolean>;
  }, [flagNames, flags, currentUser, currentEnvironment]);

  return flagValues;
}

/**
 * Hook to get variant assignments for A/B tests and multivariate tests
 * @param flagNames - Array of feature flag names to check for variants
 * @returns Object with flag names as keys and variant info (enabled, variant, isControlGroup)
 * 
 * @example
 * const { checkoutButton } = useFlagVariants(['checkoutButton']);
 * if (checkoutButton.enabled) {
 *   if (checkoutButton.isControlGroup) {
 *     return <OldCheckoutButton />;
 *   }
 *   if (checkoutButton.variant === 'blue') {
 *     return <BlueButton />;
 *   }
 *   if (checkoutButton.variant === 'green') {
 *     return <GreenButton />;
 *   }
 * }
 */
export function useFlagVariants<T extends FeatureFlagName[]>(
  flagNames: T
): Record<T[number], { enabled: boolean; variant: string | null; isControlGroup: boolean; variants?: any[]; controlGroup?: number }> {
  const { flags, currentUser, currentEnvironment } = useFeatureFlags();

  const flagVariants = useMemo(() => {
    const result: Record<string, { enabled: boolean; variant: string | null; isControlGroup: boolean; variants?: any[]; controlGroup?: number }> = {};
    
    flagNames.forEach((flagName) => {
      result[flagName] = getVariantAssignment(flagName, currentUser, currentEnvironment, flags);
    });
    
    return result as Record<T[number], { enabled: boolean; variant: string | null; isControlGroup: boolean; variants?: any[]; controlGroup?: number }>;
  }, [flagNames, flags, currentUser, currentEnvironment]);

  return flagVariants;
}