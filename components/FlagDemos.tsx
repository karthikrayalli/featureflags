import { BooleanFlagDemo } from './demos/BooleanFlagDemo';
import { ABTestDemo } from './demos/ABTestDemo';
import { MultivariateFlagDemo } from './demos/MultivariateDemo';
import { ExperimentDemo } from './demos/ExperimentDemo';
import { useFeatureFlags } from '../lib/providers/FeatureFlagsProvider';
import { BookOpen } from 'lucide-react';

export function FlagDemos() {
  const { flags } = useFeatureFlags();
  const hasFlags = Object.keys(flags).length > 0;

  if (!hasFlags) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-8 text-center">
        <BookOpen className="size-12 text-blue-400 mx-auto mb-3" />
        <h3 className="text-gray-900 mb-2">No Feature Flags Yet</h3>
        <p className="text-gray-600 text-sm">
          Create your first feature flag to see live usage examples that automatically respond to user roles and environments
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
        <h2 className="text-white mb-2">Live Usage Examples</h2>
        <p className="text-indigo-100 text-sm">
          These examples automatically update when you change user roles, environments, or flag configurations. 
          No manual overrides needed - just switch contexts and watch the UI respond!
        </p>
      </div>

      <BooleanFlagDemo />
      <ABTestDemo />
      <MultivariateFlagDemo />
      <ExperimentDemo />
    </div>
  );
}
