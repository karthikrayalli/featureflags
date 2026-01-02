import { useFlagVariants } from "@/lib/hooks/useFlags";
import { useFeatureFlags } from "@/lib/providers/FeatureFlagsProvider";
import { canViewFeature } from "@/lib/utils/featureFlagUtils";
import { Palette, Eye } from "lucide-react";

export function MultivariateFlagDemo() {
  const { currentUser, currentEnvironment } = useFeatureFlags();
  // FLAG NAME MUST MATCH
  const { "my-feature1": myFeature1 } = useFlagVariants(["my-feature1"]);
  console.log('myFeature1', myFeature1);
  if (!myFeature1?.variant) return null;

  const variantMap: Record<string, { label: string; emoji: string; bg: string }> = {
    "variant-a": {
      label: "Professional",
      emoji: "💼",
      bg: "bg-blue-100 text-blue-700",
    },
    "variant-b": {
      label: "Creative",
      emoji: "🎨",
      bg: "bg-purple-100 text-purple-700",
    },
    "variant-c": {
      label: "Modern",
      emoji: "✨",
      bg: "bg-teal-100 text-teal-700",
    },
    "variant-d": {
      label: "Bold",
      emoji: "🔥",
      bg: "bg-orange-100 text-orange-700",
    },
  };

  const activeVariant = variantMap[myFeature1.variant];
  if (!activeVariant) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 mb-1">
              Multivariate Flag Example
            </h3>
            <p className="text-sm text-gray-600">
              Using{" "}
              <code className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                my-feature1
              </code>
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${activeVariant.bg}`}
          >
            <Palette className="size-4" />
            <span className="text-sm font-medium">
              {activeVariant.label}
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
            <strong>Demo:</strong> Landing Page Theme Variant
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <div
              className={`inline-flex flex-col items-center gap-2 px-6 py-4 rounded-lg ${activeVariant.bg}`}
            >
              <div className="text-3xl">{activeVariant.emoji}</div>
              <div className="font-medium">
                {activeVariant.label} Theme
              </div>
              <div className="text-xs opacity-80">
                Variant: {myFeature1.variant}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
