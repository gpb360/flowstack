// @ts-nocheck
/**
 * Chat Settings Component
 * Main settings interface for customizing the chat widget
 */

import { useState } from 'react';
import { TabsWithContent } from '@/components/ui/tabs-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { useChatSettings } from '../hooks/useChatMessages';
import { AppearanceSettings } from './AppearanceSettings';
import { BehaviorSettings } from './BehaviorSettings';
import { AvailabilityEditor } from './AvailabilityEditor';
import { CannedResponses } from './CannedResponses';
import { EmbedCodeGenerator } from './EmbedCodeGenerator';

interface ChatSettingsProps {
  organizationId: string;
}

export function ChatSettings({ organizationId }: ChatSettingsProps) {
  const { settings, updateSettings, isUpdating } = useChatSettings(organizationId);
  const [activeTab, setActiveTab] = useState('appearance');

  if (!settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Settings</h1>
          <p className="text-sm text-gray-600">
            Customize your chat widget appearance and behavior
          </p>
        </div>
        <ButtonUntitled
          onClick={() => updateSettings(settings)}
          disabled={isUpdating}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </ButtonUntitled>
      </div>

      <TabsWithContent
        activeTab={activeTab}
        onTabChange={setActiveTab}
        fullWidth
        tabs={[
          {
            id: 'appearance',
            label: 'Appearance',
            content: (
              <AppearanceSettings
                settings={settings}
                onChange={updateSettings}
              />
            ),
          },
          {
            id: 'behavior',
            label: 'Behavior',
            content: (
              <BehaviorSettings
                settings={settings}
                onChange={updateSettings}
              />
            ),
          },
          {
            id: 'availability',
            label: 'Availability',
            content: (
              <AvailabilityEditor
                settings={settings}
                onChange={updateSettings}
              />
            ),
          },
          {
            id: 'responses',
            label: 'Responses',
            content: <CannedResponses organizationId={organizationId} />,
          },
          {
            id: 'embed',
            label: 'Embed',
            content: (
              <EmbedCodeGenerator
                organizationId={organizationId}
                settings={settings}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
