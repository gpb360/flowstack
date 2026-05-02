// @ts-nocheck
/**
 * FormLayout Component
 * Main layout for forms module with sidebar navigation
 */

import { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { SidebarUntitled } from '@/components/ui/sidebar-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Plus, FileText, BarChart3, Code } from 'lucide-react';

export function FormLayout() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const [activeTab, setActiveTab] = useState('forms');

  const sidebarItems = [
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'forms') {
      navigate('/forms');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <SidebarUntitled
        title="Form Builder"
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={handleNavigation}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Forms</h1>
              <p className="text-sm text-text-secondary">
                Create and manage forms with conditional logic
              </p>
            </div>
            <ButtonUntitled onClick={() => navigate('/forms/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Form
            </ButtonUntitled>
          </div>

          {/* Form-specific tabs when form is selected */}
          {formId && (
            <div className="flex gap-2 mt-4">
              <ButtonUntitled
                variant={activeTab === 'forms' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('forms')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Edit
              </ButtonUntitled>
              <ButtonUntitled
                variant={activeTab === 'submissions' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => navigate(`/forms/${formId}/submissions`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Submissions
              </ButtonUntitled>
              <ButtonUntitled
                variant={activeTab === 'analytics' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => navigate(`/forms/${formId}/analytics`)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </ButtonUntitled>
              <ButtonUntitled
                variant={activeTab === 'embed' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => navigate(`/forms/${formId}/embed`)}
              >
                <Code className="h-4 w-4 mr-2" />
                Embed
              </ButtonUntitled>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
