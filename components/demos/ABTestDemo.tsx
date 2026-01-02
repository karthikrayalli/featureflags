import { useFlagVariants } from "@/lib/hooks/useFlags";
import { useFeatureFlags } from "@/lib/providers/FeatureFlagsProvider";
import { canViewFeature } from "@/lib/utils/featureFlagUtils";
import { Target, Eye } from "lucide-react";

export function ABTestDemo() {
  const { currentUser, currentEnvironment, flags } = useFeatureFlags();

  // FLAG NAME MUST MATCH
  const { "my-feature2": myFeature2 } = useFlagVariants(["my-feature2"]);
  console.log('myFeature2', myFeature2);
    // // 🔒 Permission gate (CRITICAL)
  // const canView = canViewFeature(
  //   "my-feature2",
  //   currentUser,
  //   currentEnvironment,
  //   flags
  // );
  // console.log('canView', canView);
  // if (!canView) return null;

  if (!myFeature2?.variant) return null;

  const variantMap: Record<
    string,
    { label: string; emoji: string; buttonClass: string }
  > = {
    "variant": {
      label: "Blue Button",
      emoji: "🔵",
      buttonClass: "bg-blue-600 hover:bg-blue-700",
    },
    "control": {
      label: "Green Button",
      emoji: "🟢",
      buttonClass: "bg-green-600 hover:bg-green-700",
    },
  };

  const activeVariant = variantMap[myFeature2.variant];
  if (!activeVariant) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 mb-1">
              A/B Test Example
            </h3>
            <p className="text-sm text-gray-600">
              Using{" "}
              <code className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                my-feature2
              </code>
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 text-green-700">
            <Target className="size-4" />
            <span className="text-sm font-medium">
              {myFeature2.variant}
            </span>
          </div>
        </div>

        {/* Viewer Info */}
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
            <strong>Demo:</strong> Button color based on A/B test variant
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex justify-center">
            <button
              className={`px-6 py-3 text-white rounded-lg font-medium shadow-md transition-colors ${activeVariant.buttonClass}`}
            >
              {activeVariant.emoji} {activeVariant.label}
            </button>
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            This user is assigned to{" "}
            <strong>{myFeature2.variant}</strong> and will
            consistently see the {activeVariant.label}
          </div>
        </div>
      </div>
    </div>
  );
}
