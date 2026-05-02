import React from 'react';
import { TabsWithContent, type Tab } from '@/components/ui/tabs-untitled';
import { StylePanel } from '../panels/StylePanel';
import { SettingsPanel } from '../panels/SettingsPanel';

// ============================================================================
// PROPERTIES PANEL - Right panel combining styles and settings
// ============================================================================

export const PropertiesPanel = () => {
  const [activeTab, setActiveTab] = React.useState('styles');

  const tabs: Array<Tab & { content: React.ReactNode }> = [
    { id: 'styles', label: 'Styles', content: <StylePanel /> },
    { id: 'settings', label: 'Settings', content: <SettingsPanel /> },
  ];

  return (
    <div className="w-80 bg-surface border-l border-border">
      <TabsWithContent
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underline"
        size="md"
      />
    </div>
  );
};
