export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'tester';
}

export interface FlagVariant {
  name: string;
  weight: number;
}

export interface FlagRule {
  environment: string;
  enabled?: boolean;
  userRoles?: string[];
  type?: 'boolean' | 'ab-test' | 'multivariate' | 'experiment';
  variants?: FlagVariant[];
  controlGroup?: number;
  percentageOfUsers?: number;
}

export interface FeatureFlag {
  key: string;
  description?: string;
  tags?: string[];
  rules: FlagRule[];
}

export type Environment = 'dev' | 'production' | 'testing';

export type FeatureFlagName = string;
