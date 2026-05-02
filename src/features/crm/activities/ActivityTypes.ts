export type ActivityType =
  | 'note'
  | 'email_sent'
  | 'email_received'
  | 'call'
  | 'meeting'
  | 'task'
  | 'deal_stage_change'
  | 'other';

export interface ActivityTypeConfig {
  type: ActivityType;
  label: string;
  icon: string;
  color: string;
  description: string;
  hasDuration?: boolean;
  hasDueDate?: boolean;
}

export const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeConfig> = {
  note: {
    type: 'note',
    label: 'Note',
    icon: '📝',
    color: '#3b82f6',
    description: 'A general note or comment',
  },
  email_sent: {
    type: 'email_sent',
    label: 'Email Sent',
    icon: '📤',
    color: '#8b5cf6',
    description: 'An email sent to the contact',
  },
  email_received: {
    type: 'email_received',
    label: 'Email Received',
    icon: '📥',
    color: '#a78bfa',
    description: 'An email received from the contact',
  },
  call: {
    type: 'call',
    label: 'Call',
    icon: '📞',
    color: '#f59e0b',
    description: 'A phone call with the contact',
    hasDuration: true,
  },
  meeting: {
    type: 'meeting',
    label: 'Meeting',
    icon: '📅',
    color: '#10b981',
    description: 'A scheduled or completed meeting',
    hasDuration: true,
    hasDueDate: true,
  },
  task: {
    type: 'task',
    label: 'Task',
    icon: '✅',
    color: '#ec4899',
    description: 'A task to be completed',
    hasDueDate: true,
  },
  deal_stage_change: {
    type: 'deal_stage_change',
    label: 'Stage Change',
    icon: '💼',
    color: '#6366f1',
    description: 'Deal moved to a different stage',
  },
  other: {
    type: 'other',
    label: 'Other',
    icon: '📌',
    color: '#6b7280',
    description: 'Any other type of activity',
  },
};

export const ACTIVITY_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
export type ActivityStatus = typeof ACTIVITY_STATUSES[number];

export const getStatusColor = (status: ActivityStatus): string => {
  switch (status) {
    case 'pending':
      return '#f59e0b'; // amber
    case 'in_progress':
      return '#3b82f6'; // blue
    case 'completed':
      return '#10b981'; // green
    case 'cancelled':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

export const getActivityTypeConfig = (type: ActivityType): ActivityTypeConfig => {
  return ACTIVITY_TYPES[type] || ACTIVITY_TYPES.other;
};
