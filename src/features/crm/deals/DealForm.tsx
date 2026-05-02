import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateDeal, useUpdateDeal, usePipelines } from '../hooks/useDeals';
import { useContacts } from '../hooks/useContacts';
import type { Database } from '@/types/database.types';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';

type Deal = Database['public']['Tables']['deals']['Row'] & Record<string, any>;

interface DealFormProps {
  deal?: Deal;
  onClose: () => void;
  defaultStageId?: string;
  defaultPipelineId?: string;
}

export const DealForm: React.FC<DealFormProps> = ({
  deal,
  onClose,
  defaultStageId,
  defaultPipelineId
}) => {
  const isEditing = !!deal;

  const [formData, setFormData] = useState({
    title: deal?.title || '',
    value: deal?.value || 0,
    currency: deal?.currency || 'USD',
    contact_id: deal?.contact_id || '',
    company_id: deal?.company_id || '',
    pipeline_id: deal?.pipeline_id || defaultPipelineId || '',
    stage_id: deal?.stage_id || defaultStageId || '',
    status: deal?.status || 'open',
    expected_close_date: deal?.expected_close_date || '',
  });

  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: pipelines } = usePipelines();
  const { data: contactsData } = useContacts({ pageSize: 100 });

  const selectedPipeline = pipelines?.find((p) => p.id === formData.pipeline_id);
  const stages = selectedPipeline?.stages || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        value: formData.value ? Number(formData.value) : null,
        expected_close_date: formData.expected_close_date || null,
      };

      if (isEditing) {
        await updateDeal.mutateAsync({
          dealId: deal.id,
          updates: submitData,
        });
      } else {
        await createDeal.mutateAsync(submitData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving deal:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Deal' : 'New Deal'}</h2>
          <ButtonUntitled variant="tertiary" size="sm" onClick={onClose} isIconOnly>
            <X size={18} />
          </ButtonUntitled>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <InputUntitled
            id="title"
            label="Deal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enterprise Software Deal"
            required
          />

          {/* Pipeline */}
          <div>
            <label htmlFor="pipeline_id" className="block text-sm font-medium text-text-secondary mb-1.5">
              Pipeline
            </label>
            <select
              id="pipeline_id"
              value={formData.pipeline_id}
              onChange={(e) => {
                const newPipelineId = e.target.value;
                const pipeline = pipelines?.find((p) => p.id === newPipelineId);
                setFormData({
                  ...formData,
                  pipeline_id: newPipelineId,
                  stage_id: pipeline?.stages[0]?.id || '',
                });
              }}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">Select a pipeline...</option>
              {pipelines?.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label htmlFor="stage_id" className="block text-sm font-medium text-text-secondary mb-1.5">
              Stage
            </label>
            <select
              id="stage_id"
              value={formData.stage_id}
              onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
              disabled={stages.length === 0}
            >
              <option value="">Select a stage...</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div className="grid grid-cols-2 gap-4">
            <InputUntitled
              id="value"
              label="Value"
              type="number"
              min="0"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
              placeholder="10000"
            />
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-text-secondary mb-1.5">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="contact_id" className="block text-sm font-medium text-text-secondary mb-1.5">
              Contact
            </label>
            <select
              id="contact_id"
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">No contact</option>
              {contactsData?.contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name} {contact.email && `(${contact.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Expected Close Date */}
          <InputUntitled
            id="expected_close_date"
            label="Expected Close Date"
            type="date"
            value={formData.expected_close_date}
            onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <ButtonUntitled variant="secondary" onClick={onClose}>
              Cancel
            </ButtonUntitled>
            <ButtonUntitled
              variant="primary"
              type="submit"
              isLoading={createDeal.isPending || updateDeal.isPending}
            >
              {createDeal.isPending || updateDeal.isPending
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Deal'}
            </ButtonUntitled>
          </div>
        </form>
      </div>
    </div>
  );
};
