import { Toggle } from '@/components/Toggle';
import { Trash2, Edit2 } from 'lucide-react';
import { useFeatureFlags } from '@/lib/providers/FeatureFlagsProvider';
import { useEffect, useState } from 'react';

interface FeatureFlagListProps {
  onEdit: (flagKey: string) => void;
}

export function FeatureFlagList({ onEdit }: FeatureFlagListProps) {
  const { flags, deleteFlag, updateFlag } = useFeatureFlags();
  const [flagsList, setFlagsList] = useState<Array<{ key: string; value: any }>>([]);

  useEffect(() => {
    const list = Object.entries(flags).map(([key, value]) => ({ key, value }));
    setFlagsList(list);
  }, [flags]);

  const toggleEnvironment = (flagKey: string, env: string) => {
    const flagValue = flags[flagKey];
    
    if (typeof flagValue === 'boolean') {
      // Convert boolean to environment-specific rules
      updateFlag(flagKey, [{ environment: env, enabled: true }]);
    } else if (Array.isArray(flagValue)) {
      const existingRule = flagValue.find((r: any) => r.environment === env);
      if (existingRule) {
        // Remove rule for this environment
        const newRules = flagValue.filter((r: any) => r.environment !== env);
        updateFlag(flagKey, newRules.length > 0 ? newRules : false);
      } else {
        // Add rule for this environment
        updateFlag(flagKey, [...flagValue, { environment: env }]);
      }
    } else {
      // Create new rule
      updateFlag(flagKey, [{ environment: env }]);
    }
  };

  const isEnvironmentEnabled = (value: any, env: string): boolean => {
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      return value.some((rule: any) => rule.environment === env);
    }
    // Handle new variant-based format
    if (typeof value === 'object' && value !== null) {
      return value.environment === env;
    }
    return false;
  };

  const getRuleInfo = (value: any, env: string): string => {
    if (typeof value === 'boolean') return value ? 'All users' : 'Disabled';
    if (Array.isArray(value)) {
      const rule = value.find((r: any) => r.environment === env);
      if (!rule) return 'Disabled';
      
      const parts = [];
      if (rule.percentageOfUsers !== undefined) {
        parts.push(`${Math.round(rule.percentageOfUsers * 100)}%`);
      }
      if (rule.userRoles && rule.userRoles.length > 0) {
        parts.push(rule.userRoles.join(', '));
      }
      return parts.length > 0 ? parts.join(' • ') : 'All users';
    }
    // Handle new variant-based format
    if (typeof value === 'object' && value !== null) {
      if (value.environment !== env) return 'Disabled';
      
      const parts = [];
      
      // Show flag type
      if (value.type === 'ab-test') parts.push('A/B Test');
      if (value.type === 'multivariate') parts.push('Multivariate');
      if (value.type === 'experiment') parts.push(`Experiment (${value.controlGroup}% control)`);
      if (value.type === 'percentage') parts.push(`${Math.round((value.percentageOfUsers || 1) * 100)}%`);
      
      // Show variant count
      if (value.variants) {
        parts.push(`${value.variants.length} variants`);
      }
      
      // Show roles
      if (value.userRoles && value.userRoles.length > 0) {
        parts.push(value.userRoles.join(', '));
      }
      
      return parts.length > 0 ? parts.join(' • ') : 'Enabled';
    }
    return 'Disabled';
  };

  const handleDelete = (flagKey: string) => {
    if (confirm(`Are you sure you want to delete the feature flag "${flagKey}"?`)) {
      deleteFlag(flagKey);
    }
  };

  if (flagsList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center">
        <p className="text-gray-500">No feature flags yet. Click "Create Feature" to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Feature Key</th>
              <th className="px-6 py-3 text-center text-gray-700">Dev</th>
              <th className="px-6 py-3 text-center text-gray-700">Production</th>
              <th className="px-6 py-3 text-center text-gray-700">Testing</th>
              <th className="px-6 py-3 text-center text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flagsList.map(({ key, value }) => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-mono text-purple-600">{key}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <Toggle
                      checked={isEnvironmentEnabled(value, 'dev')}
                      onChange={() => toggleEnvironment(key, 'dev')}
                    />
                    <span className="text-xs text-gray-500">
                      {getRuleInfo(value, 'dev')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <Toggle
                      checked={isEnvironmentEnabled(value, 'production')}
                      onChange={() => toggleEnvironment(key, 'production')}
                    />
                    <span className="text-xs text-gray-500">
                      {getRuleInfo(value, 'production')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <Toggle
                      checked={isEnvironmentEnabled(value, 'testing')}
                      onChange={() => toggleEnvironment(key, 'testing')}
                    />
                    <span className="text-xs text-gray-500">
                      {getRuleInfo(value, 'testing')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(key)}
                      className="text-purple-600 hover:text-purple-700 p-2 hover:bg-purple-50 rounded transition-colors"
                      title="Edit feature"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(key)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Delete feature"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}