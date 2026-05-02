import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLogNote, useLogCall, useLogMeeting, useLogEmail, useLogTask } from '../hooks/useActivities';
import { ACTIVITY_TYPES, type ActivityType } from './ActivityTypes';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';

interface ActivityFormProps {
  onClose: () => void;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  onClose,
  contactId,
  companyId,
  dealId,
}) => {
  const [activityType, setActivityType] = useState<ActivityType>('note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>();
  const [dueDate, setDueDate] = useState<string>('');

  const logNote = useLogNote();
  const logCall = useLogCall();
  const logMeeting = useLogMeeting();
  const logEmail = useLogEmail();
  const logTask = useLogTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const baseData = {
      contactId,
      companyId,
      dealId,
      title,
      description,
    };

    try {
      switch (activityType) {
        case 'note':
          await logNote.mutateAsync(baseData);
          break;
        case 'call':
          await logCall.mutateAsync({
            ...baseData,
            durationMinutes,
          });
          break;
        case 'meeting':
          await logMeeting.mutateAsync({
            ...baseData,
            durationMinutes,
            dueDate: dueDate || undefined,
          });
          break;
        case 'email_sent':
        case 'email_received':
          await logEmail.mutateAsync({
            ...baseData,
            direction: activityType === 'email_sent' ? 'sent' : 'received',
          });
          break;
        case 'task':
          await logTask.mutateAsync({
            ...baseData,
            dueDate: dueDate || undefined,
          });
          break;
      }

      onClose();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const config = ACTIVITY_TYPES[activityType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg w-full max-w-lg shadow-2xl">
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Log Activity</h2>
          <ButtonUntitled variant="tertiary" size="sm" onClick={onClose} isIconOnly>
            <X size={18} />
          </ButtonUntitled>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Activity Type Selector */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Activity Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(ACTIVITY_TYPES).map((type) => (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => setActivityType(type.type)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                    activityType === type.type
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <InputUntitled
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={config.description}
            required
          />

          {/* Description */}
          <TextareaUntitled
            id="description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={4}
          />

          {/* Duration (for calls/meetings) */}
          {config.hasDuration && (
            <InputUntitled
              id="duration"
              label="Duration (minutes)"
              type="number"
              min="0"
              value={durationMinutes || ''}
              onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="30"
            />
          )}

          {/* Due Date (for meetings/tasks) */}
          {config.hasDueDate && (
            <InputUntitled
              id="dueDate"
              label={activityType === 'meeting' ? 'Date & Time' : 'Due Date'}
              type={activityType === 'meeting' ? 'datetime-local' : 'date'}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <ButtonUntitled variant="secondary" onClick={onClose}>
              Cancel
            </ButtonUntitled>
            <ButtonUntitled
              variant="primary"
              type="submit"
              isLoading={
                logNote.isPending ||
                logCall.isPending ||
                logMeeting.isPending ||
                logEmail.isPending ||
                logTask.isPending
              }
            >
              {logNote.isPending ||
              logCall.isPending ||
              logMeeting.isPending ||
              logEmail.isPending ||
              logTask.isPending
                ? 'Saving...'
                : 'Log Activity'}
            </ButtonUntitled>
          </div>
        </form>
      </div>
    </div>
  );
};
