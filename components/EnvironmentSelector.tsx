import { useFeatureFlags } from '../lib/featureFlagsProvider';
import { ChevronDown } from 'lucide-react';

const ENVIRONMENTS = ['dev', 'production', 'testing'];

export function EnvironmentSelector() {
  const { currentEnvironment, setEnvironment } = useFeatureFlags();

  return (
    <div className="relative">
      <label className="block text-xs text-gray-600 mb-1">Environment</label>
      <div className="relative">
        <select
          value={currentEnvironment}
          onChange={(e) => setEnvironment(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {ENVIRONMENTS.map(env => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
