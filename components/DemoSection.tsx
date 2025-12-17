import { FeatureEnabled } from '../lib/FeatureEnabled';
import { useFeatureFlags } from '../lib/featureFlagsProvider';

export function DemoSection() {
    const { flags } = useFeatureFlags();
    const flagKeys = Object.keys(flags);
  
    if (flagKeys.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-gray-900 mb-4">Live Demo - Feature Flag Controlled UI</h2>
          <p className="text-gray-600">
            Create feature flags to see live examples of how they control UI visibility based on environment and user role.
          </p>
        </div>
      );
    }
  
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-gray-900 mb-4">Live Demo - Feature Flag Controlled UI</h2>
        <p className="text-gray-600 mb-6">
          The sections below are controlled by your feature flags. Toggle environments and user roles to see them appear/disappear.
        </p>
  
        <div className="space-y-4">
          {flagKeys.map((flagKey, index) => (
            <FeatureEnabled key={flagKey} featureFlag={flagKey}>
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 95%)`,
                  borderColor: `hsl(${(index * 137.5) % 360}, 70%, 70%)`,
                }}
              >
                <h3 className="mb-1" style={{ color: `hsl(${(index * 137.5) % 360}, 70%, 30%)` }}>
                  ✅ {flagKey}
                </h3>
                <p className="text-sm" style={{ color: `hsl(${(index * 137.5) % 360}, 70%, 40%)` }}>
                  This feature is enabled for the current environment and user role!
                </p>
              </div>
            </FeatureEnabled>
          ))}
  
          <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <h3 className="text-gray-700 mb-1">ℹ️ Always Visible</h3>
            <p className="text-gray-600 text-sm">
              This section is not controlled by any feature flag and is always visible.
            </p>
          </div>
        </div>
      </div>
    );
  }