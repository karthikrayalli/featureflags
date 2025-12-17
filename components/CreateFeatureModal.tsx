import { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Toggle } from './Toggle';
import { useFeatureFlags } from '../lib/featureFlagsProvider';
import { FeatureFlagRule } from '@/app/page';

interface CreateFeatureModalProps {
    onClose: () => void;
    editingFlagKey?: string | null;
  }
  
  const ENVIRONMENTS = ['dev', 'production', 'testing'];
  const USER_ROLES = ['user', 'admin', 'tester'];
  
  export function CreateFeatureModal({ onClose, editingFlagKey }: CreateFeatureModalProps) {
    const { updateFlag, flags, deleteFlag } = useFeatureFlags();
    const isEditing = !!editingFlagKey;
    
    const [featureKey, setFeatureKey] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [showTags, setShowTags] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [valueType, setValueType] = useState<'boolean' | 'string' | 'number' | 'json'>('boolean');
    const [isSimpleMode, setIsSimpleMode] = useState(true);
    
    // Simple mode: just environment toggles
    const [simpleEnvironments, setSimpleEnvironments] = useState({
      dev: false,
      production: false,
      testing: false,
    });
    const [simpleDefaultValue, setSimpleDefaultValue] = useState(false);
  
    // Advanced mode: rules per environment
    const [advancedRules, setAdvancedRules] = useState<FeatureFlagRule[]>([
      { environment: 'production', enabled: false }
    ]);
    
    const [error, setError] = useState('');
  
    // Load existing flag data when editing
    useEffect(() => {
      if (isEditing && editingFlagKey) {
        setFeatureKey(editingFlagKey);
        const flagValue = flags[editingFlagKey];
        
        if (typeof flagValue === 'boolean') {
          // Simple boolean flag
          setIsSimpleMode(true);
          setSimpleDefaultValue(flagValue);
          setSimpleEnvironments({
            dev: flagValue,
            production: flagValue,
            testing: flagValue,
          });
        } else if (Array.isArray(flagValue)) {
          // Check if it's simple mode (just environment toggles) or advanced mode
          const hasAdvancedRules = flagValue.some((rule: any) => 
            rule.percentageOfUsers !== undefined || 
            (rule.userRoles && rule.userRoles.length > 0)
          );
  
          if (hasAdvancedRules) {
            // Advanced mode
            setIsSimpleMode(false);
            setAdvancedRules(flagValue.map((rule: any) => ({
              environment: rule.environment || 'production',
              enabled: true,
              percentageOfUsers: rule.percentageOfUsers,
              userRoles: rule.userRoles,
            })));
          } else {
            // Simple mode with environment-specific rules
            setIsSimpleMode(true);
            const envStates = {
              dev: false,
              production: false,
              testing: false,
            };
            flagValue.forEach((rule: any) => {
              if (rule.environment && rule.environment in envStates) {
                envStates[rule.environment as keyof typeof envStates] = true;
              }
            });
            setSimpleEnvironments(envStates);
            setSimpleDefaultValue(true);
          }
        }
      }
    }, [isEditing, editingFlagKey, flags]);
  
    const toggleSimpleEnvironment = (env: keyof typeof simpleEnvironments) => {
      setSimpleEnvironments(prev => ({ ...prev, [env]: !prev[env] }));
    };
  
    const validateFeatureKey = (key: string) => {
      const validPattern = /^[a-zA-Z0-9_\-.:|\s]*$/;
      return validPattern.test(key);
    };
  
    const handleFeatureKeyChange = (value: string) => {
      const cleaned = value.replace(/\s/g, '');
      if (validateFeatureKey(cleaned)) {
        setFeatureKey(cleaned);
        setError('');
      }
    };
  
    const addRule = () => {
      setAdvancedRules([...advancedRules, { environment: 'production', enabled: false }]);
    };
  
    const removeRule = (index: number) => {
      setAdvancedRules(advancedRules.filter((_, i) => i !== index));
    };
  
    const updateRule = (index: number, updates: Partial<FeatureFlagRule>) => {
      setAdvancedRules(advancedRules.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      ));
    };
  
    const handleSubmit = () => {
      if (!featureKey.trim()) {
        setError('Feature key is required');
        return;
      }
  
      let flagValue: any;
  
      if (isSimpleMode) {
        // Simple boolean flag or environment-based rules
        const enabledEnvs = Object.entries(simpleEnvironments)
          .filter(([_, enabled]) => enabled)
          .map(([env]) => env);
  
        if (enabledEnvs.length === 0) {
          flagValue = false;
        } else if (enabledEnvs.length === ENVIRONMENTS.length) {
          flagValue = simpleDefaultValue;
        } else {
          flagValue = enabledEnvs.map(env => ({
            environment: env,
            enabled: simpleDefaultValue,
          }));
        }
      } else {
        // Advanced mode with rules
        const activeRules = advancedRules.filter(r => r.enabled);
        if (activeRules.length === 0) {
          flagValue = false;
        } else {
          flagValue = activeRules.map(rule => {
            const cleanRule: any = { environment: rule.environment };
            if (rule.percentageOfUsers !== undefined && rule.percentageOfUsers > 0) {
              cleanRule.percentageOfUsers = rule.percentageOfUsers;
            }
            if (rule.userRoles && rule.userRoles.length > 0) {
              cleanRule.userRoles = rule.userRoles;
            }
            return cleanRule;
          });
        }
      }
  
      updateFlag(featureKey, flagValue);
      onClose();
    };
  
    const handleDelete = () => {
      if (isEditing && editingFlagKey && confirm(`Are you sure you want to delete the feature flag "${editingFlagKey}"?`)) {
        deleteFlag(editingFlagKey);
        onClose();
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-gray-900">{isEditing ? 'Edit Feature' : 'Create Feature'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="size-5" />
            </button>
          </div>
  
          <div className="px-6 py-6 space-y-6">
            {/* Feature Key */}
            <div>
              <label htmlFor="feature-key" className="block text-gray-700 mb-2">
                Feature Key
              </label>
              <input
                id="feature-key"
                type="text"
                value={featureKey}
                onChange={(e) => handleFeatureKeyChange(e.target.value)}
                disabled={isEditing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="my-feature"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              {!isEditing && (
                <p className="mt-2 text-sm text-gray-500">
                  Only letters, numbers, and the characters{' '}
                  <span className="font-mono">_</span>,{' '}
                  <span className="font-mono">-</span>,{' '}
                  <span className="font-mono">.</span>,{' '}
                  <span className="font-mono">:</span>, and{' '}
                  <span className="font-mono">|</span> allowed. No spaces.
                </p>
              )}
              {isEditing && (
                <p className="mt-2 text-sm text-gray-500">
                  Feature key cannot be changed after creation.
                </p>
              )}
            </div>
  
            {/* Mode Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSimpleMode(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isSimpleMode ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Simple Mode
              </button>
              <button
                onClick={() => setIsSimpleMode(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !isSimpleMode ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Advanced Mode
              </button>
            </div>
  
            {isSimpleMode ? (
              <>
                {/* Simple Mode: Environment Toggles */}
                <div>
                  <label className="block text-gray-700 mb-3">
                    Enabled Environments
                  </label>
                  <div className="bg-gray-50 rounded-lg px-6 py-5 flex gap-8">
                    {ENVIRONMENTS.map(env => (
                      <div key={env} className="flex items-center gap-3">
                        <span className="text-gray-700">{env}:</span>
                        <Toggle
                          checked={simpleEnvironments[env as keyof typeof simpleEnvironments]}
                          onChange={() => toggleSimpleEnvironment(env as keyof typeof simpleEnvironments)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
  
                <div>
                  <label className="block text-gray-700 mb-3">
                    Default Value when Enabled
                  </label>
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={simpleDefaultValue}
                      onChange={() => setSimpleDefaultValue(!simpleDefaultValue)}
                    />
                    <span className="text-gray-700">{simpleDefaultValue ? 'on' : 'off'}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Advanced Mode: Rules */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-gray-700">
                      Targeting Rules
                    </label>
                    <button
                      onClick={addRule}
                      className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
                    >
                      <Plus className="size-4" />
                      Add Rule
                    </button>
                  </div>
  
                  <div className="space-y-4">
                    {advancedRules.map((rule, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-700">Enabled:</span>
                            <Toggle
                              checked={rule.enabled}
                              onChange={() => updateRule(index, { enabled: !rule.enabled })}
                            />
                          </div>
                          {advancedRules.length > 1 && (
                            <button
                              onClick={() => removeRule(index)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
  
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Environment</label>
                          <select
                            value={rule.environment}
                            onChange={(e) => updateRule(index, { environment: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {ENVIRONMENTS.map(env => (
                              <option key={env} value={env}>{env}</option>
                            ))}
                          </select>
                        </div>
  
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Percentage Rollout (0-100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rule.percentageOfUsers ? rule.percentageOfUsers * 100 : 100}
                            onChange={(e) => updateRule(index, { 
                              percentageOfUsers: Number(e.target.value) / 100 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
  
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">User Roles</label>
                          <div className="flex gap-2 flex-wrap">
                            {USER_ROLES.map(role => {
                              const isSelected = rule.userRoles?.includes(role) ?? false;
                              return (
                                <button
                                  key={role}
                                  onClick={() => {
                                    const currentRoles = rule.userRoles || [];
                                    const newRoles = isSelected
                                      ? currentRoles.filter(r => r !== role)
                                      : [...currentRoles, role];
                                    updateRule(index, { userRoles: newRoles.length > 0 ? newRoles : undefined });
                                  }}
                                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                    isSelected
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {role}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
  
            {/* Info Box */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-5 py-4">
              <p className="text-cyan-900">
                {isSimpleMode 
                  ? 'Simple mode creates basic on/off flags per environment. Switch to Advanced Mode for percentage rollouts and role-based targeting.'
                  : 'Advanced mode lets you add targeted rules such as A/B Tests and Percentage Rollouts to control exactly how features get released to users.'
                }
              </p>
            </div>
          </div>
  
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div>
              {isEditing && (
                <button
                  onClick={handleDelete}
                  className="px-5 py-2.5 text-red-600 hover:text-red-700 transition-colors"
                >
                  Delete Feature
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-purple-600 hover:text-purple-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!featureKey.trim()}
              >
                {isEditing ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  