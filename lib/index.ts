/**
 * Feature Flags Library - Main Exports
 */

// Provider
export { FeatureFlagsProvider, useFeatureFlags } from './providers/FeatureFlagsProvider';

// Hooks
export { useFlags, useFlagVariants } from './hooks/useFlags';

// Types
export type { 
  User, 
  FeatureFlag, 
  FlagRule, 
  FlagVariant, 
  Environment, 
  FeatureFlagName 
} from '@/types';
