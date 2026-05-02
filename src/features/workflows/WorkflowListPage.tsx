import { Plus, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';

// Updates would fetch from React Query
const MOCK_WORKFLOWS = [
  { id: '1', name: 'New Lead Welcome Sequence', status: 'active', runs: 124 },
  { id: '2', name: 'Webinar Follow-up', status: 'paused', runs: 45 },
  { id: '3', name: 'Stalled Deal Alert', status: 'draft', runs: 0 },
];

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'paused':
      return 'warning';
    case 'draft':
      return 'default';
    default:
      return 'default';
  }
};

export const WorkflowListPage = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeaderUntitled
        title="Workflows"
        description="Automate your business logic with visual flows"
        icon={Workflow}
        actions={
          <Link to="new">
            <ButtonUntitled
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Workflow
            </ButtonUntitled>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_WORKFLOWS.map((wf) => (
          <Link
            key={wf.id}
            to={wf.id}
          >
            <CardUntitled
              variant="elevated"
              size="md"
              interactive
              className="relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-50 text-text-muted group-hover:text-primary/20 transition-colors">
                <Workflow size={64} />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <BadgeUntitled variant={getBadgeVariant(wf.status) as any}>
                    {wf.status}
                  </BadgeUntitled>
                </div>

                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors mb-2">
                  {wf.name}
                </h3>

                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Workflow size={14} />
                  <span>{wf.runs} Executions</span>
                </div>
              </div>
            </CardUntitled>
          </Link>
        ))}

        {/* Empty State / Create New Card */}
        <Link to="new">
          <CardUntitled
            variant="outline"
            size="md"
            interactive
            className="border-2 border-dashed min-h-[200px] flex flex-col items-center justify-center"
          >
            <Plus size={32} className="mb-2 text-text-muted" />
            <span className="font-semibold text-text-secondary">Create from scratch</span>
          </CardUntitled>
        </Link>
      </div>
    </div>
  );
};
