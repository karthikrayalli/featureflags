import { useFlags } from "@/lib/hooks/useFlags";
import { useFeatureFlags } from "@/lib/providers/FeatureFlagsProvider";
import {
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export function BooleanFlagDemo() {
  const { currentUser, currentEnvironment } = useFeatureFlags();

  // Use existing boolean flags from the system - FLAG NAME IN ARRAY MUST MATCH DESTRUCTURED NAME
  const { settings_tab } = useFlags(["settings_tab"]);

  // Example: Filter tabs based on flag
  const tabsList = [
    { tabValue: "dashboard", label: "Dashboard", icon: "📊" },
    {
      tabValue: "settings",
      label: "Settings",
      icon: "⚙️"
    },
    { tabValue: "reports", label: "Reports", icon: "📄" },
    { tabValue: "profile", label: "Profile", icon: "👤" },
  ];

  const filteredTabs = settings_tab
    ? tabsList
    : tabsList.filter((tab) => tab.tabValue !== "settings");

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 mb-1">
              Boolean Flag Example
            </h3>
            <p className="text-sm text-gray-600">
              Using{" "}
              <code className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                settings_tab
              </code>
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              settings_tab
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {settings_tab ? (
              <>
                <CheckCircle className="size-4" />
                <span className="text-sm font-medium">
                  Enabled
                </span>
              </>
            ) : (
              <>
                <XCircle className="size-4" />
                <span className="text-sm font-medium">
                  Disabled
                </span>
              </>
            )}
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Eye className="size-4" />
            <span>
              Viewing as{" "}
              <span className="font-medium">
                {currentUser.name} ({currentUser.role})
              </span>{" "}
              in{" "}
              <span className="font-medium">
                {currentEnvironment}
              </span>
            </span>
          </div>
        </div>

        {/* Demo */}
        <div className="space-y-3">
          <div className="text-sm text-gray-700">
            <strong>Demo:</strong> Conditional Tab Filtering
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex gap-2 flex-wrap">
              {filteredTabs.map((tab) => (
                <div
                  key={tab.tabValue}
                  className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 bg-white border border-gray-300 text-gray-700`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}