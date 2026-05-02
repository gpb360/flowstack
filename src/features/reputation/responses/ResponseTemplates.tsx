/**
 * Response Templates Component
 * Manage response templates for reviews
 */

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useResponseTemplates, useDeleteResponseTemplate } from '../hooks/useReputationAlerts';
import { cn } from '@/lib/utils';

export function ResponseTemplates() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { data: templates, isLoading } = useResponseTemplates();
  const deleteTemplate = useDeleteResponseTemplate();

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate.mutateAsync(templateId);
    }
  };

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeaderUntitled
        title="Response Templates"
        description="Pre-written responses for common review types"
        actions={
          <ButtonUntitled onClick={() => setShowEditor(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </ButtonUntitled>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {templates?.map((template: any) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateCard({ template, onEdit, onDelete }: {
  template: any;
  onEdit: (template: any) => void;
  onDelete: (id: string) => void;
}) {
  const metadata = template.metadata || {};

  const getBadgeVariant = (isActive: boolean): 'success' | 'error' | 'warning' | 'neutral' | 'info' => {
    return isActive ? 'success' : 'neutral';
  };

  return (
    <CardUntitled
      title={template.name}
      description={template.subject || template.description}
    >
      <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
        {template.content}
      </p>
      {metadata.rating_range && (
        <div className="mb-3 text-sm text-muted-foreground">
          Applies to ratings: {metadata.rating_range[0]} - {metadata.rating_range[1]} stars
        </div>
      )}
      {metadata.variables && metadata.variables.length > 0 && (
        <div className="mb-3">
          <span className="text-xs text-muted-foreground">Variables: </span>
          {metadata.variables.map((v: string) => (
            <BadgeUntitled key={v} variant="neutral" size="sm" className="mr-1">
              {'{' + v + '}'}
            </BadgeUntitled>
          ))}
        </div>
      )}
      <div className="mb-3 flex gap-1">
        {metadata.sentiment && (
          <BadgeUntitled variant="neutral" size="sm">{metadata.sentiment}</BadgeUntitled>
        )}
        <BadgeUntitled variant={getBadgeVariant(template.is_active)} size="sm">
          {template.is_active ? 'Active' : 'Inactive'}
        </BadgeUntitled>
      </div>
      <div className="flex gap-2">
        <ButtonUntitled size="sm" variant="outline" onClick={() => onEdit(template)}>
          <Edit className="mr-2 h-3 w-3" />
          Edit
        </ButtonUntitled>
        <ButtonUntitled
          size="sm"
          variant="outline"
          onClick={() => onDelete(template.id)}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Delete
        </ButtonUntitled>
      </div>
    </CardUntitled>
  );
}

function TemplateEditor({ template, onClose }: { template: any; onClose: () => void }) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.subject || template?.description || '');
  const [content, setContent] = useState(template?.content || '');
  const [sentiment, setSentiment] = useState(template?.metadata?.sentiment || '');
  const [minRating, setMinRating] = useState(template?.metadata?.rating_range?.[0] || 1);
  const [maxRating, setMaxRating] = useState(template?.metadata?.rating_range?.[1] || 5);

  const handleSave = () => {
    // In a real implementation, you'd save the template
    console.log('Saving template:', { name, description, content, sentiment, minRating, maxRating });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6">
        <h2 className="text-xl font-bold">{template ? 'Edit Template' : 'New Template'}</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <textarea
              className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Response content... Use {variable_name} for dynamic values"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Sentiment</label>
              <select
                className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value)}
              >
                <option value="">All</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Rating Range</label>
              <div className="flex gap-2">
                <select
                  className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  value={minRating}
                  onChange={(e) => setMinRating(parseInt(e.target.value))}
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
                <span className="self-center">to</span>
                <select
                  className="w-full rounded border border-gray-300 p-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
                  value={maxRating}
                  onChange={(e) => setMaxRating(parseInt(e.target.value))}
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <ButtonUntitled variant="secondary" onClick={onClose}>
            Cancel
          </ButtonUntitled>
          <ButtonUntitled onClick={handleSave} disabled={!name.trim() || !content.trim()}>
            Save Template
          </ButtonUntitled>
        </div>
      </div>
    </div>
  );
}
