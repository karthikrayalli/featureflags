"use client"

import { useState } from 'react';
import { CreateFeatureModal } from '@/components/CreateFeatureModal';
import { FeatureFlagList } from '@/components/FeatureFlagList';
// import { DemoSection } from '@/components/DemoSection';
import { EnvironmentSelector } from '@/components/EnvironmentSelector';
import { UserSelector } from '@/components/UserSelector';
import { FeatureFlagsProvider } from '@/lib/providers/FeatureFlagsProvider';
import { Plus } from 'lucide-react';
import { FlagDemos } from '@/components/FlagDemos';
// import { UsageExample } from '@/components/UsageExample';

function AppContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<string | null>(null);

  const handleEdit = (flagKey: string) => {
    setEditingFlag(flagKey);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFlag(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Feature Flags</h1>
            <p className="text-gray-600">
              Manage and control feature rollouts across environments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <UserSelector />
            <EnvironmentSelector />
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="size-5" />
              Create Feature Flag
            </button>
          </div>
        </div>

        {/* Feature Flags List */}
        <FeatureFlagList onEdit={handleEdit} />

        {/* Live Usage Examples */}
        <div className="mt-8">
          <FlagDemos />
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <CreateFeatureModal 
            onClose={handleCloseModal}
            editingFlagKey={editingFlag}
          />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <FeatureFlagsProvider>
      <AppContent />
    </FeatureFlagsProvider>
  );
}