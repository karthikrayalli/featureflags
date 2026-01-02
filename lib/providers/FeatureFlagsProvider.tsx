import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, FeatureFlagName } from '@/types';

// Storage keys
const STORAGE_KEY = 'feature-flags';
const ENV_KEY = 'current-environment';
const USER_KEY = 'current-user';
const OVERRIDES_KEY = 'flag-overrides';

// Storage helpers
function getStoredFlags(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredFlags(flags: Record<string, any>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
}

function getCurrentEnvironment(): string {
  if (typeof window === 'undefined') return 'production';
  return localStorage.getItem(ENV_KEY) || 'production';
}

function setCurrentEnvironment(env: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ENV_KEY, env);
}

function getUser(): User {
  if (typeof window === 'undefined') {
    return {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    };
  }
  
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fall through to default
  }
  
  return {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };
}

function setStoredUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getStoredOverrides(): Record<string, string | boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredOverrides(overrides: Record<string, string | boolean>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

interface FeatureFlagsContextType {
  flags: Record<string, any>;
  currentEnvironment: string;
  currentUser: User;
  flagOverrides: Record<string, string | boolean>;
  updateFlag: (name: FeatureFlagName, value: any) => void;
  deleteFlag: (name: FeatureFlagName) => void;
  setEnvironment: (env: string) => void;
  setUser: (user: User) => void;
  setFlagOverride: (flagKey: string, value: string | boolean) => void;
  clearFlagOverride: (flagKey: string) => void;
  clearAllOverrides: () => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<string, any>>({});
  const [currentEnvironment, setCurrentEnv] = useState<string>('production');
  const [currentUser, setCurrentUser] = useState<User>(getUser());
  const [flagOverrides, setFlagOverrides] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    setFlags(getStoredFlags());
    setCurrentEnv(getCurrentEnvironment());
    setFlagOverrides(getStoredOverrides());
  }, []);

  const updateFlag = (name: FeatureFlagName, value: any) => {
    const newFlags = { ...flags, [name]: value };
    setFlags(newFlags);
    setStoredFlags(newFlags);
  };

  const deleteFlag = (name: FeatureFlagName) => {
    const newFlags = { ...flags };
    delete newFlags[name];
    setFlags(newFlags);
    setStoredFlags(newFlags);
  };

  const setEnvironment = (env: string) => {
    setCurrentEnv(env);
    setCurrentEnvironment(env);
    window.dispatchEvent(new Event('environment-changed'));
  };

  const setUser = (user: User) => {
    setCurrentUser(user);
    setStoredUser(user);
    window.dispatchEvent(new Event('user-changed'));
  };

  const setFlagOverride = (flagKey: string, value: string | boolean) => {
    const newOverrides = { ...flagOverrides, [flagKey]: value };
    setFlagOverrides(newOverrides);
    setStoredOverrides(newOverrides);
    window.dispatchEvent(new Event('flag-override-changed'));
  };

  const clearFlagOverride = (flagKey: string) => {
    const newOverrides = { ...flagOverrides };
    delete newOverrides[flagKey];
    setFlagOverrides(newOverrides);
    setStoredOverrides(newOverrides);
    window.dispatchEvent(new Event('flag-override-changed'));
  };

  const clearAllOverrides = () => {
    setFlagOverrides({});
    setStoredOverrides({});
    window.dispatchEvent(new Event('flag-override-changed'));
  };

  return (
    <FeatureFlagsContext.Provider 
      value={{ 
        flags, 
        currentEnvironment, 
        currentUser, 
        flagOverrides,
        updateFlag, 
        deleteFlag, 
        setEnvironment, 
        setUser,
        setFlagOverride,
        clearFlagOverride,
        clearAllOverrides
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}