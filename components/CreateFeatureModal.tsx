import { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Toggle } from './Toggle';
import { useFeatureFlags } from '../lib/providers/FeatureFlagsProvider';

interface CreateFeatureModalProps {
  onClose: () => void;
  editingFlagKey?: string | null;
}

const ENVIRONMENTS = ['dev', 'production', 'testing'];
const USER_ROLES = ['user', 'admin', 'tester'];

type RuleType = 'standard' | 'ab-test' | 'multivariate' | 'experiment';

interface AdvancedRule {
  id: string;
  enabled: boolean;
  environment: string;
  ruleType: RuleType;
  percentageOfUsers?: number;
  userRoles?: string[];
  // For A/B tests, multivariate, and experiments
  variants?: Array<{ name: string; weight: number }>;
  controlGroup?: number; // For experiments
}

export function CreateFeatureModal({ onClose, editingFlagKey }: CreateFeatureModalProps) {
  const { updateFlag, flags, deleteFlag } = useFeatureFlags();
  const isEditing = !!editingFlagKey;
  
  const [featureKey, setFeatureKey] = useState('');
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  
  // Simple mode: just environment toggles
  const [simpleEnvironments, setSimpleEnvironments] = useState({
    dev: false,
    production: false,
    testing: false,
  });
  const [simpleDefaultValue, setSimpleDefaultValue] = useState(false);

  // Advanced mode: rules per environment
  const [advancedRules, setAdvancedRules] = useState<AdvancedRule[]>([
    { 
      id: '1',
      enabled: false,
      environment: 'production',
      ruleType: 'standard',
      percentageOfUsers: 100
    }
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
        // Legacy array format - could be simple or advanced
        const hasAdvancedRules = flagValue.some((rule: any) => 
          rule.percentageOfUsers !== undefined || 
          (rule.userRoles && rule.userRoles.length > 0) ||
          rule.variants
        );

        if (hasAdvancedRules) {
          // Advanced mode
          setIsSimpleMode(false);
          setAdvancedRules(flagValue.map((rule: any, index: number) => ({
            id: String(index),
            environment: rule.environment || 'production',
            enabled: true,
            ruleType: rule.type || 'standard',
            percentageOfUsers: rule.percentageOfUsers ? rule.percentageOfUsers * 100 : 100,
            userRoles: rule.userRoles,
            variants: rule.variants,
            controlGroup: rule.controlGroup,
          })));
        } else {
          // Simple mode with environment-specific rules
          setIsSimpleMode(true);
          const envStates = { dev: false, production: false, testing: false };
          flagValue.forEach((rule: any) => {
            if (rule.environment && rule.environment in envStates) {
              envStates[rule.environment as keyof typeof envStates] = true;
            }
          });
          setSimpleEnvironments(envStates);
          setSimpleDefaultValue(true);
        }
      } else if (typeof flagValue === 'object') {
        // New object format with type
        setIsSimpleMode(false);
        setAdvancedRules([{
          id: '1',
          enabled: true,
          environment: flagValue.environment || 'production',
          ruleType: flagValue.type || 'standard',
          percentageOfUsers: flagValue.percentageOfUsers ? flagValue.percentageOfUsers * 100 : 100,
          userRoles: flagValue.userRoles,
          variants: flagValue.variants,
          controlGroup: flagValue.controlGroup,
        }]);
      }
    }
  }, [isEditing, editingFlagKey, flags]);

  const toggleSimpleEnvironment = (env: keyof typeof simpleEnvironments) => {
    setSimpleEnvironments(prev => ({ ...prev, [env]: !prev[env] }));
  };

  const validateFeatureKey = (key: string) => {
    const validPattern = /^[a-zA-Z0-9_\-.:|]*$/;
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
    setAdvancedRules([...advancedRules, { 
      id: String(Date.now()),
      enabled: false,
      environment: 'production',
      ruleType: 'standard',
      percentageOfUsers: 100
    }]);
  };

  const removeRule = (id: string) => {
    setAdvancedRules(advancedRules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, updates: Partial<AdvancedRule>) => {
    setAdvancedRules(advancedRules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const addVariant = (ruleId: string) => {
    const rule = advancedRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const currentVariants = rule.variants || [];
    const newVariants = [...currentVariants, { 
      name: `variant-${currentVariants.length}`, 
      weight: 25 
    }];
    
    updateRule(ruleId, { variants: redistributeWeights(newVariants) });
  };

  const removeVariant = (ruleId: string, variantIndex: number) => {
    const rule = advancedRules.find(r => r.id === ruleId);
    if (!rule || !rule.variants) return;
    
    const newVariants = rule.variants.filter((_, i) => i !== variantIndex);
    updateRule(ruleId, { variants: redistributeWeights(newVariants) });
  };

  const updateVariant = (ruleId: string, variantIndex: number, updates: Partial<{ name: string; weight: number }>) => {
    const rule = advancedRules.find(r => r.id === ruleId);
    if (!rule || !rule.variants) return;
    
    const newVariants = rule.variants.map((v, i) => 
      i === variantIndex ? { ...v, ...updates } : v
    );
    
    updateRule(ruleId, { variants: newVariants });
  };

  const redistributeWeights = (variants: Array<{ name: string; weight: number }>) => {
    const count = variants.length;
    const weight = Math.floor(100 / count);
    const remainder = 100 - (weight * count);
    
    return variants.map((v, i) => ({
      ...v,
      weight: i === 0 ? weight + remainder : weight,
    }));
  };

  const toggleRole = (ruleId: string, role: string) => {
    const rule = advancedRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const currentRoles = rule.userRoles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    updateRule(ruleId, { userRoles: newRoles.length > 0 ? newRoles : undefined });
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
      } else if (activeRules.length === 1) {
        // Single rule - store as object
        const rule = activeRules[0];
        
        if (rule.ruleType === 'standard') {
          // Standard rule with percentage + roles
          const ruleData: any = { environment: rule.environment };
          if (rule.percentageOfUsers && rule.percentageOfUsers < 100) {
            ruleData.percentageOfUsers = rule.percentageOfUsers / 100;
          }
          if (rule.userRoles && rule.userRoles.length > 0) {
            ruleData.userRoles = rule.userRoles;
          }
          
          // If it's just environment with no filters, store as array
          if (!ruleData.percentageOfUsers && !ruleData.userRoles) {
            flagValue = [ruleData];
          } else {
            flagValue = [ruleData];
          }
        } else {
          // A/B test, multivariate, or experiment
          flagValue = {
            type: rule.ruleType,
            environment: rule.environment,
            ...(rule.variants && { variants: rule.variants }),
            ...(rule.controlGroup && { controlGroup: rule.controlGroup }),
            ...(rule.userRoles && rule.userRoles.length > 0 && { userRoles: rule.userRoles }),
          };
        }
      } else {
        // Multiple rules - store as array
        flagValue = activeRules.map(rule => {
          if (rule.ruleType === 'standard') {
            const ruleData: any = { environment: rule.environment };
            if (rule.percentageOfUsers && rule.percentageOfUsers < 100) {
              ruleData.percentageOfUsers = rule.percentageOfUsers / 100;
            }
            if (rule.userRoles && rule.userRoles.length > 0) {
              ruleData.userRoles = rule.userRoles;
            }
            return ruleData;
          } else {
            return {
              type: rule.ruleType,
              environment: rule.environment,
              ...(rule.variants && { variants: rule.variants }),
              ...(rule.controlGroup && { controlGroup: rule.controlGroup }),
              ...(rule.userRoles && rule.userRoles.length > 0 && { userRoles: rule.userRoles }),
            };
          }
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
                  {advancedRules.map((rule) => (
                    <div key={rule.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-700">Enabled:</span>
                          <Toggle
                            checked={rule.enabled}
                            onChange={() => updateRule(rule.id, { enabled: !rule.enabled })}
                          />
                        </div>
                        {advancedRules.length > 1 && (
                          <button
                            onClick={() => removeRule(rule.id)}
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
                          onChange={(e) => updateRule(rule.id, { environment: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {ENVIRONMENTS.map(env => (
                            <option key={env} value={env}>{env}</option>
                          ))}
                        </select>
                      </div>

                      {/* Rule Type Selector */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Rule Type</label>
                        <select
                          value={rule.ruleType}
                          onChange={(e) => {
                            const newType = e.target.value as RuleType;
                            const updates: Partial<AdvancedRule> = { ruleType: newType };
                            
                            // Initialize variants based on type
                            if (newType === 'ab-test') {
                              updates.variants = [
                                { name: 'control', weight: 50 },
                                { name: 'variant', weight: 50 }
                              ];
                            } else if (newType === 'multivariate') {
                              updates.variants = [
                                { name: 'variant-a', weight: 25 },
                                { name: 'variant-b', weight: 25 },
                                { name: 'variant-c', weight: 25 },
                                { name: 'variant-d', weight: 25 }
                              ];
                            } else if (newType === 'experiment') {
                              updates.controlGroup = 15;
                              updates.variants = [
                                { name: 'variant-a', weight: 50 },
                                { name: 'variant-b', weight: 50 }
                              ];
                            } else {
                              // Standard rule - clear variants
                              updates.variants = undefined;
                              updates.controlGroup = undefined;
                            }
                            
                            updateRule(rule.id, updates);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="standard">Standard (Percentage + Roles)</option>
                          <option value="ab-test">A/B Test (2 variants)</option>
                          <option value="multivariate">Multivariate Test (3+ variants)</option>
                          <option value="experiment">Experiment (Control Group)</option>
                        </select>
                      </div>

                      {/* Standard Rule: Percentage Rollout */}
                      {rule.ruleType === 'standard' && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Percentage Rollout (0-100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rule.percentageOfUsers || 100}
                            onChange={(e) => updateRule(rule.id, { 
                              percentageOfUsers: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}

                      {/* A/B Test Variants */}
                      {rule.ruleType === 'ab-test' && rule.variants && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">A/B Test Variants</label>
                          <div className="space-y-2">
                            {rule.variants.slice(0, 2).map((variant, index) => (
                              <div key={index} className="bg-white rounded p-3 flex items-center gap-3">
                                <input
                                  type="text"
                                  value={variant.name}
                                  onChange={(e) => updateVariant(rule.id, index, { name: e.target.value })}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="Variant name"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={variant.weight}
                                    onChange={(e) => {
                                      const newWeight = Number(e.target.value);
                                      const otherIndex = index === 0 ? 1 : 0;
                                      updateVariant(rule.id, index, { weight: newWeight });
                                      updateVariant(rule.id, otherIndex, { weight: 100 - newWeight });
                                    }}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <span className="text-sm text-gray-700">%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Multivariate Test Variants */}
                      {rule.ruleType === 'multivariate' && rule.variants && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm text-gray-600">Multivariate Variants</label>
                            <button
                              onClick={() => addVariant(rule.id)}
                              className="text-xs text-purple-600 hover:text-purple-700"
                            >
                              <Plus className="size-3 inline" /> Add Variant
                            </button>
                          </div>
                          <div className="space-y-2">
                            {rule.variants.map((variant, index) => (
                              <div key={index} className="bg-white rounded p-3 flex items-center gap-3">
                                <input
                                  type="text"
                                  value={variant.name}
                                  onChange={(e) => updateVariant(rule.id, index, { name: e.target.value })}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="Variant name"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={variant.weight}
                                    onChange={(e) => updateVariant(rule.id, index, { weight: Number(e.target.value) })}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                  <span className="text-sm text-gray-700">%</span>
                                </div>
                                {rule.variants && rule.variants.length > 2 && (
                                  <button
                                    onClick={() => removeVariant(rule.id, index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Total: {rule.variants.reduce((sum, v) => sum + v.weight, 0).toFixed(1)}%
                          </p>
                        </div>
                      )}

                      {/* Experiment with Control Group */}
                      {rule.ruleType === 'experiment' && (
                        <>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Control Group (Baseline %)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={rule.controlGroup || 15}
                              onChange={(e) => updateRule(rule.id, { controlGroup: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {rule.controlGroup || 15}% will see original (no experiment)
                            </p>
                          </div>
                          
                          {rule.variants && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm text-gray-600">
                                  Experiment Variants ({100 - (rule.controlGroup || 15)}% of users)
                                </label>
                                <button
                                  onClick={() => addVariant(rule.id)}
                                  className="text-xs text-purple-600 hover:text-purple-700"
                                >
                                  <Plus className="size-3 inline" /> Add Variant
                                </button>
                              </div>
                              <div className="space-y-2">
                                {rule.variants.map((variant, index) => (
                                  <div key={index} className="bg-white rounded p-3 flex items-center gap-3">
                                    <input
                                      type="text"
                                      value={variant.name}
                                      onChange={(e) => updateVariant(rule.id, index, { name: e.target.value })}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder="Variant name"
                                    />
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={variant.weight}
                                        onChange={(e) => updateVariant(rule.id, index, { weight: Number(e.target.value) })}
                                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      />
                                      <span className="text-sm text-gray-700">%</span>
                                    </div>
                                    {rule.variants && rule.variants.length > 2 && (
                                      <button
                                        onClick={() => removeVariant(rule.id, index)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="size-3" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Variants total: {rule.variants.reduce((sum, v) => sum + v.weight, 0).toFixed(1)}%
                              </p>
                            </div>
                          )}
                        </>
                      )}

                      {/* User Roles (for all rule types) */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">User Roles</label>
                        <div className="flex gap-2 flex-wrap">
                          {USER_ROLES.map(role => {
                            const isSelected = rule.userRoles?.includes(role) ?? false;
                            return (
                              <button
                                key={role}
                                onClick={() => toggleRole(rule.id, role)}
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
                ? 'Simple mode creates basic on/off flags per environment. Switch to Advanced Mode for percentage rollouts, role-based targeting, and A/B testing.'
                : 'Advanced mode lets you add targeted rules such as A/B Tests, Multivariate Tests, and Percentage Rollouts to control exactly how features get released to users.'
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