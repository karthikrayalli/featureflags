import { useFlagVariants } from "@/lib/hooks/useFlags";
import { useFeatureFlags } from "@/lib/providers/FeatureFlagsProvider";
import { canViewFeature } from "@/lib/utils/featureFlagUtils";
import { FlaskConical, Eye, Users, Sparkles } from "lucide-react";

export function ExperimentDemo() {
  const { currentUser, currentEnvironment, flags } = useFeatureFlags();

  // ✅ ALWAYS call hooks first
  const { "my-feature": myFeature } = useFlagVariants(["my-feature"]);
  console.log('myFeature', myFeature);
  // 🔒 Permission gate (AFTER hooks)
  const canView = canViewFeature(
    "my-feature",
    currentUser,
    currentEnvironment,
    flags
  );
  console.log('canView', canView);
  if (!canView || !myFeature) return null;

  const experimentMap = {
    control: {
      title: "Original Checkout",
      icon: <Users className="size-5" />,
      badgeClass: "bg-blue-100 text-blue-700",
      containerClass: "bg-white border border-gray-300",
      buttonClass: "bg-gray-700",
      buttonLabel: "Complete Purchase",
    },
    experiment: {
      title: "Optimized Checkout",
      icon: <Sparkles className="size-5" />,
      badgeClass: "bg-purple-100 text-purple-700",
      containerClass: "bg-purple-50 border-2 border-purple-300",
      buttonClass: "bg-gradient-to-r from-purple-600 to-pink-600",
      buttonLabel: "✨ Checkout Now",
    },
  };

  const isControl = myFeature.isControlGroup === true;
  const activeExperience = isControl
    ? experimentMap.control
    : experimentMap.experiment;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 mb-1">
              Experiment (with Control Group)
            </h3>
            <p className="text-sm text-gray-600">
              Using{" "}
              <code className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                my-feature
              </code>
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${activeExperience.badgeClass}`}
          >
            {activeExperience.icon}
            <span className="text-sm font-medium">
              {isControl ? "Control Group" : myFeature.variant}
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
            <strong>Demo:</strong> Checkout flow experiment
          </div>

          <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div
              className={`rounded-lg p-5 ${activeExperience.containerClass}`}
            >
              <div className="flex items-center gap-2 mb-4 text-gray-800">
                {activeExperience.icon}
                <span className="font-medium">
                  {activeExperience.title}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="p-3 bg-gray-100 rounded text-sm">
                  📦 Cart Items — $99.99
                </div>
                <div className="p-3 bg-gray-100 rounded text-sm">
                  🚚 Shipping — {isControl ? "$9.99" : "Free"}
                </div>
                {!isControl && (
                  <div className="p-3 bg-purple-100 border border-purple-300 rounded text-sm font-medium text-purple-700">
                    💎 Total — $99.99
                  </div>
                )}
              </div>

              <button
                className={`w-full py-3 text-white rounded-lg font-medium shadow ${activeExperience.buttonClass}`}
              >
                {activeExperience.buttonLabel}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
            {isControl ? (
              <>
                This user is in the <strong>Control Group</strong> and
                sees the baseline checkout experience.
              </>
            ) : (
              <>
                This user is in the <strong>Experiment Group</strong>{" "}
                ({myFeature.variant}) and sees the optimized checkout
                flow.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
