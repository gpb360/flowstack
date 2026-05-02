/**
 * Workflow Templates Component
 * Pre-built workflow templates for common use cases
 */

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Mail, FileText, Megaphone, MessageSquare, TrendingUp } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  nodes: any[];
  edges: any[];
}

const TEMPLATES: Template[] = [
  {
    id: 'lead-nurturing',
    name: 'Lead Nurturing Sequence',
    description: 'Automatically follow up with new leads through a series of emails and tasks',
    icon: Users,
    category: 'CRM',
    nodes: [],
    edges: [],
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email Series',
    description: 'Send a series of welcome emails when someone subscribes to your list',
    icon: Mail,
    category: 'Marketing',
    nodes: [],
    edges: [],
  },
  {
    id: 'deal-automation',
    name: 'Deal Stage Automation',
    description: 'Automatically update deal stages and notify team members',
    icon: TrendingUp,
    category: 'Sales',
    nodes: [],
    edges: [],
  },
  {
    id: 'form-followup',
    name: 'Form Follow-up',
    description: 'Instantly follow up with form submissions and add to your CRM',
    icon: FileText,
    category: 'Forms',
    nodes: [],
    edges: [],
  },
  {
    id: 're-engagement',
    name: 'Re-engagement Campaign',
    description: 'Re-engage inactive contacts with targeted messages',
    icon: Megaphone,
    category: 'Marketing',
    nodes: [],
    edges: [],
  },
  {
    id: 'sms-sequence',
    name: 'SMS Sequence',
    description: 'Send a series of SMS messages for time-sensitive communications',
    icon: MessageSquare,
    category: 'Communication',
    nodes: [],
    edges: [],
  },
];

export const WorkflowTemplates = () => {
  const navigate = useNavigate();

  const handleUseTemplate = (template: Template) => {
    // In a real implementation, this would create a new workflow from the template
    navigate(`/workflows/new?template=${template.id}`);
  };

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workflow Templates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Start with a pre-built template and customize it for your needs
        </p>
      </div>

      {/* Templates by Category */}
      {categories.map((category) => {
        const categoryTemplates = TEMPLATES.filter((t) => t.category === category);

        return (
          <div key={category}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTemplates.map((template) => {
                const Icon = template.icon;

                return (
                  <CardUntitled
                    key={template.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    interactive
                    title={template.name}
                    description={template.description}
                    header={
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon size={20} className="text-blue-600" />
                        </div>
                      </div>
                    }
                    footer={
                      <ButtonUntitled
                        variant="primary"
                        fullWidth
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                        <ArrowRight size={16} className="ml-2" />
                      </ButtonUntitled>
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
