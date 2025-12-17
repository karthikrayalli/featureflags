"use client"

import { useFlags } from '@/lib/useFlags';

// Example component showing how to use the useFlags hook
export function UsageExample() {
  // Check multiple flags at once
  const { viewAccountingNavTab, advancedAnalytics } = useFlags([
    'viewAccountingNavTab',
    'advancedAnalytics',
  ]);

  // Example: Filter tabs based on flag
  const tabsList = [
    { tabValue: 'dashboard', label: 'Dashboard' },
    { tabValue: 'accounting', label: 'Accounting' },
    { tabValue: 'reports', label: 'Reports' },
  ];

  const filteredTabs = viewAccountingNavTab
    ? tabsList
    : tabsList.filter((tab) => tab.tabValue !== "accounting");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">useFlags Hook Example</h3>
        
        <div className="space-y-4">
          {/* Example 1: Conditional rendering */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-2">Example 1: Conditional Tab Filtering</h4>
            <div className="flex gap-2">
              {filteredTabs.map((tab) => (
                <div
                  key={tab.tabValue}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  {tab.label}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {viewAccountingNavTab 
                ? 'Accounting tab is visible (flag enabled)' 
                : 'Accounting tab is hidden (flag disabled)'}
            </p>
          </div>

          {/* Example 2: Show/hide features */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-2">Example 2: Show/Hide Features</h4>
            {advancedAnalytics ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                ✅ Advanced Analytics is enabled
              </div>
            ) : (
              <div className="p-3 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600">
                ❌ Advanced Analytics is disabled
              </div>
            )}
          </div>

          {/* Example 3: Multiple conditions */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm text-gray-700 mb-2">Example 3: Multiple Conditions</h4>
            {viewAccountingNavTab && advancedAnalytics ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✅ Both Accounting and Analytics are enabled
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ⚠️ Not all features are enabled
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
