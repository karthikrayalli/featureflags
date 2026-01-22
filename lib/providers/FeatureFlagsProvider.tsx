import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, FeatureFlagName } from '@/types';

// Default user
const defaultUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

// API helpers
async function fetchFlags(): Promise<Record<string, any>> {
  try {
    const response = await fetch('/api/flags');
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

async function saveFlags(flags: Record<string, any>): Promise<void> {
  try {
    await fetch('/api/flags', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flags),
    });
  } catch (error) {
    console.error('Failed to save flags:', error);
  }
}

async function fetchEnvironment(): Promise<string> {
  try {
    const response = await fetch('/api/environment');
    if (!response.ok) return 'production';
    const data = await response.json();
    return data.environment || 'production';
  } catch {
    return 'production';
  }
}

async function saveEnvironment(env: string): Promise<void> {
  try {
    await fetch('/api/environment', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ environment: env }),
    });
  } catch (error) {
    console.error('Failed to save environment:', error);
  }
}

async function fetchUser(): Promise<User> {
  try {
    const response = await fetch('/api/user');
    if (!response.ok) return defaultUser;
    return await response.json();
  } catch {
    return defaultUser;
  }
}

async function saveUser(user: User): Promise<void> {
  try {
    await fetch('/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  } catch (error) {
    console.error('Failed to save user:', error);
  }
}

async function fetchOverrides(): Promise<Record<string, string | boolean>> {
  try {
    const response = await fetch('/api/overrides');
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

async function saveOverrides(overrides: Record<string, string | boolean>): Promise<void> {
  try {
    await fetch('/api/overrides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrides),
    });
  } catch (error) {
    console.error('Failed to save overrides:', error);
  }
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
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [flagOverrides, setFlagOverrides] = useState<Record<string, string | boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [loadedFlags, loadedEnv, loadedUser, loadedOverrides] = await Promise.all([
        fetchFlags(),
        fetchEnvironment(),
        fetchUser(),
        fetchOverrides(),
      ]);
      
      setFlags(loadedFlags);
      setCurrentEnv(loadedEnv);
      setCurrentUser(loadedUser);
      setFlagOverrides(loadedOverrides);
      setIsLoading(false);
    }
    
    loadData();
  }, []);

  const updateFlag = async (name: FeatureFlagName, value: any) => {
    const newFlags = { ...flags, [name]: value };
    setFlags(newFlags);
    await saveFlags(newFlags);
  };

  const deleteFlag = async (name: FeatureFlagName) => {
    const newFlags = { ...flags };
    delete newFlags[name];
    setFlags(newFlags);
    await saveFlags(newFlags);
  };

  const setEnvironment = async (env: string) => {
    setCurrentEnv(env);
    await saveEnvironment(env);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('environment-changed'));
    }
  };

  const setUser = async (user: User) => {
    setCurrentUser(user);
    await saveUser(user);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('user-changed'));
    }
  };

  const setFlagOverride = async (flagKey: string, value: string | boolean) => {
    const newOverrides = { ...flagOverrides, [flagKey]: value };
    setFlagOverrides(newOverrides);
    await saveOverrides(newOverrides);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flag-override-changed'));
    }
  };

  const clearFlagOverride = async (flagKey: string) => {
    const newOverrides = { ...flagOverrides };
    delete newOverrides[flagKey];
    setFlagOverrides(newOverrides);
    await saveOverrides(newOverrides);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flag-override-changed'));
    }
  };

  const clearAllOverrides = async () => {
    setFlagOverrides({});
    await saveOverrides({});
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('flag-override-changed'));
    }
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
