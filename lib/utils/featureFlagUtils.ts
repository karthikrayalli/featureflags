import type { User, FeatureFlagName, FlagVariant } from '../../types';
import { murmurhash } from './murmurhash';

interface FeatureFlagRule {
  percentageOfUsers?: number;
  userRoles?: string[];
  environment?: string;
  type?: 'boolean' | 'ab-test' | 'multivariate' | 'experiment';
  variants?: FlagVariant[];
  controlGroup?: number;
}

const MAX_UINT_32 = 4294967295;

export function canViewFeature(
  featureName: FeatureFlagName,
  user: User,
  currentEnvironment: string,
  flags: Record<string, any>
): boolean {
  const rules = flags[featureName];
  
  if (rules === undefined) return false;
  if (typeof rules === 'boolean') return rules;
  
  // Handle array of rules
  if (Array.isArray(rules)) {
    return rules.some(rule => {
      // Check if rule applies to current environment
      if (rule.environment && rule.environment !== currentEnvironment) return false;
      // Check if rule applies to current user role
      if (rule.userRoles && !rule.userRoles.includes(user.role)) return false;
      return checkRule(rule, featureName, user);
    });
  }
  
  // Handle single rule object
  if (rules.environment && rules.environment !== currentEnvironment) return false;
  if (rules.userRoles && !rules.userRoles.includes(user.role)) return false;
  return checkRule(rules, featureName, user);
}

function checkRule(
  rule: FeatureFlagRule,
  featureName: FeatureFlagName,
  user: User
): boolean {
  return (
    userHasValidRole(rule.userRoles, user.role) &&
    userIsWithinPercentage(featureName, rule.percentageOfUsers, user.id)
  );
}

function userHasValidRole(
  allowedRoles: string[] | undefined,
  userRole: string
): boolean {
  return allowedRoles == null || allowedRoles.includes(userRole);
}

function userIsWithinPercentage(
  featureName: FeatureFlagName,
  allowedPercent: number | undefined,
  userId: string
): boolean {
  if (allowedPercent == null) return true;
  return murmurhash(`${featureName}-${userId}`) / MAX_UINT_32 < allowedPercent;
}

export function getVariantAssignment(
  featureName: FeatureFlagName,
  user: User,
  currentEnvironment: string,
  flags: Record<string, any>
): { enabled: boolean; variant: string | null; isControlGroup: boolean; variants?: FlagVariant[]; controlGroup?: number } {
  const rules = flags[featureName];
  
  const defaultResponse = { enabled: false, variant: null, isControlGroup: false };
  
  if (rules === undefined) return defaultResponse;
  
  if (typeof rules === 'boolean') {
    return { enabled: rules, variant: null, isControlGroup: false };
  }
  
  const matchingRules = Array.isArray(rules)
    ? rules.filter((rule: FeatureFlagRule) => {
        if (rule.environment && rule.environment !== currentEnvironment) return false;
        if (rule.userRoles && !rule.userRoles.includes(user.role)) return false;
        return true;
      })
    : (() => {
        // For single rule objects, check if they match before wrapping in array
        if (rules.environment && rules.environment !== currentEnvironment) return [];
        if (rules.userRoles && !rules.userRoles.includes(user.role)) return [];
        return [rules];
      })();
  
  if (matchingRules.length === 0) return defaultResponse;
  
  for (const rule of matchingRules) {
    if (rule.variants && Array.isArray(rule.variants)) {
      if (rule.percentageOfUsers !== undefined) {
        const isEligible = userIsWithinPercentage(featureName, rule.percentageOfUsers, user.id);
        if (!isEligible) continue;
      }
      
      const hash = murmurhash(`${featureName}-${user.id}`);
      const percentage = (hash / MAX_UINT_32) * 100;
      
      if (rule.type === 'experiment' && rule.controlGroup) {
        if (percentage < rule.controlGroup) {
          return { 
            enabled: true, 
            variant: null, 
            isControlGroup: true,
            variants: rule.variants,
            controlGroup: rule.controlGroup
          };
        }
        const adjustedPercentage = ((percentage - rule.controlGroup) / (100 - rule.controlGroup)) * 100;
        const variant = assignVariant(adjustedPercentage, rule.variants);
        return { 
          enabled: true, 
          variant, 
          isControlGroup: false,
          variants: rule.variants,
          controlGroup: rule.controlGroup
        };
      }
      
      const variant = assignVariant(percentage, rule.variants);
      return { enabled: true, variant, isControlGroup: false, variants: rule.variants };
    }
    
    const isEligible = checkRule(rule, featureName, user);
    if (isEligible) {
      return { enabled: true, variant: null, isControlGroup: false };
    }
  }
  
  return defaultResponse;
}

function assignVariant(percentage: number, variants: FlagVariant[]): string {
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.weight;
    if (percentage < cumulative) {
      return variant.name;
    }
  }
  
  return variants[variants.length - 1]?.name || 'default';
}
