/**
 * Workflow Execution Component (Untitled UI)
 *
 * Visual display of workflow execution status with step tracking.
 * Based on Untitled UI design patterns.
 *
 * Features:
 * - Step-by-step execution tracking
 * - Real-time status updates
 * - Error display
 * - Execution metrics
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import { Check, X, Loader2, Clock, AlertCircle, MoreVertical } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface ExecutionStep {
  id: string;
  name: string;
  description?: string;
  status: StepStatus;
  icon?: LucideIcon;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  output?: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowExecutionUntitledProps {
  /**
   * Execution steps
   */
  steps: ExecutionStep[];

  /**
   * Overall workflow status
   */
  status: ExecutionStatus;

  /**
   * Workflow name
   */
  workflowName?: string;

  /**
   * Start time
   */
  startTime?: Date;

  /**
   * End time
   */
  endTime?: Date;

  /**
   * Current executing step ID
   */
  currentStepId?: string;

  /**
   * Show detailed logs
   */
  showLogs?: boolean;

  /**
   * On step click
   */
  onStepClick?: (step: ExecutionStep) => void;

  /**
   * Compact mode
   */
  compact?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Step Status Icon
// ============================================================================

interface StepStatusIconProps {
  status: StepStatus;
  className?: string;
}

const StepStatusIcon: React.FC<StepStatusIconProps> = ({ status, className }) => {
  const iconMap = {
    pending: <Clock className={cn('w-4 h-4 text-text-muted', className)} />,
    running: <Loader2 className={cn('w-4 h-4 text-primary animate-spin', className)} />,
    completed: <Check className={cn('w-4 h-4 text-green-500', className)} />,
    failed: <X className={cn('w-4 h-4 text-red-500', className)} />,
    skipped: <div className={cn('w-4 h-4 flex items-center justify-center', className)}>-</div>,
  };

  return iconMap[status] || iconMap.pending;
};

// ============================================================================
// Execution Step Component
// ============================================================================

interface ExecutionStepUntitledProps {
  step: ExecutionStep;
  isCurrent?: boolean;
  showLogs?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const ExecutionStepUntitled = React.forwardRef<HTMLDivElement, ExecutionStepUntitledProps>(
  function ExecutionStepUntitledImpl({ step, isCurrent = false, showLogs = false, onClick, compact = false }, ref) {
    const StepIcon = step.icon;

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg border transition-all',
          'bg-surface hover:bg-surface-hover border-border',
          isCurrent && 'border-primary bg-primary/5',
          step.status === 'failed' && 'border-red-500/50 bg-red-500/5',
          step.status === 'completed' && 'border-green-500/50 bg-green-500/5',
          onClick && 'cursor-pointer',
          compact && 'p-2'
        )}
      >
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <StepStatusIcon status={step.status} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {/* Step Name */}
            <h4 className={cn(
              'font-medium text-text-primary',
              compact ? 'text-sm' : 'text-base'
            )}>
              {step.name}
            </h4>

            {/* Duration */}
            {step.duration && (
              <span className="text-xs text-text-muted flex-shrink-0">
                {step.duration}ms
              </span>
            )}
          </div>

          {/* Description */}
          {step.description && !compact && (
            <p className="text-sm text-text-secondary mt-0.5">{step.description}</p>
          )}

          {/* Error Message */}
          {step.status === 'failed' && step.error && (
            <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{step.error}</span>
            </div>
          )}

          {/* Output (logs) */}
          {showLogs && step.output && (
            <details className="mt-2">
              <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">
                Output
              </summary>
              <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </details>
          )}

          {/* Timestamp */}
          {step.startTime && !compact && (
            <div className="mt-1 text-xs text-text-muted">
              {step.startTime.toLocaleTimeString()}
              {step.endTime && ` - ${step.endTime.toLocaleTimeString()}`}
            </div>
          )}
        </div>

        {/* Custom Step Icon */}
        {StepIcon && !compact && (
          <div className="flex-shrink-0 p-2 bg-surface-hover rounded-lg">
            <StepIcon className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </div>
    );
  }
);

ExecutionStepUntitled.displayName = 'ExecutionStepUntitled';

// ============================================================================
// Main Workflow Execution Component
// ============================================================================

export const WorkflowExecutionUntitled = React.forwardRef<HTMLDivElement, WorkflowExecutionUntitledProps>(
  function WorkflowExecutionUntitledImpl({
    steps,
    status,
    workflowName,
    startTime,
    endTime,
    currentStepId,
    showLogs = false,
    onStepClick,
    compact = false,
    className,
  }, ref) {
    // Calculate progress
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    // Calculate duration
    const duration = startTime && endTime
      ? endTime.getTime() - startTime.getTime()
      : startTime
        ? Date.now() - startTime.getTime()
        : 0;

    const formatDuration = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    };

    // Status styles
    const statusStyles = {
      pending: 'bg-text-muted text-white',
      running: 'bg-primary text-white',
      completed: 'bg-green-500 text-white',
      failed: 'bg-red-500 text-white',
      skipped: 'bg-text-muted text-white',
    };

    return (
      <div ref={ref} className={cn('bg-background rounded-lg border border-border', className)}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              {workflowName && (
                <h3 className="font-semibold text-text-primary">{workflowName}</h3>
              )}
              <div className="flex items-center gap-3 mt-2">
                {/* Status Badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                    statusStyles[status]
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>

                {/* Duration */}
                {duration > 0 && (
                  <span className="text-xs text-text-muted">
                    {formatDuration(duration)}
                  </span>
                )}

                {/* Progress */}
                {totalSteps > 0 && (
                  <span className="text-xs text-text-muted">
                    {completedSteps}/{totalSteps} steps
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalSteps > 0 && (
          <div className="px-4 py-2 border-b border-border">
            <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 ease-out',
                  status === 'completed' && 'bg-green-500',
                  status === 'failed' && 'bg-red-500',
                  status === 'running' && 'bg-primary',
                  status !== 'completed' && status !== 'failed' && 'bg-primary'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Steps List */}
        <div className={cn('p-4 space-y-2', compact ? 'p-2' : '')}>
          {steps.map((step, _index) => {
            const isCurrent = step.id === currentStepId;
            const showStepLogs = showLogs || step.status === 'failed';

            return (
              <ExecutionStepUntitled
                key={step.id}
                step={step}
                isCurrent={isCurrent}
                showLogs={showStepLogs}
                onClick={onStepClick ? () => onStepClick(step) : undefined}
                compact={compact}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {steps.length === 0 && (
          <div className="p-8 text-center text-text-muted">
            No execution steps yet
          </div>
        )}
      </div>
    );
  }
);

WorkflowExecutionUntitled.displayName = 'WorkflowExecutionUntitled';

// ============================================================================
// Agent Status Component
// ============================================================================

export interface AgentStatusUntitledProps {
  /**
   * Agent status
   */
  status: 'idle' | 'running' | 'completed' | 'failed' | 'offline';

  /**
   * Agent name
   */
  name?: string;

  /**
   * Agent type/role
   */
  type?: string;

  /**
   * Avatar URL or component
   */
  avatar?: string | LucideIcon;

  /**
   * Last activity timestamp
   */
  lastActivity?: Date;

  /**
   * Current task/message
   */
  currentTask?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Show pulse animation for running status
   */
  showPulse?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const AgentStatusUntitled = React.forwardRef<HTMLDivElement, AgentStatusUntitledProps>(
  function AgentStatusUntitledImpl({
    status,
    name,
    type,
    avatar,
    lastActivity: _lastActivity,
    currentTask,
    size = 'md',
    showPulse = true,
    className,
  }, ref) {
    const sizeStyles = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
    };

    const textSizeStyles = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    const statusConfig = {
      idle: {
        color: 'bg-text-muted',
        label: 'Idle',
        icon: null,
      },
      running: {
        color: 'bg-green-500',
        label: 'Running',
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
      },
      completed: {
        color: 'bg-blue-500',
        label: 'Completed',
        icon: <Check className="w-3 h-3" />,
      },
      failed: {
        color: 'bg-red-500',
        label: 'Failed',
        icon: <X className="w-3 h-3" />,
      },
      offline: {
        color: 'bg-text-muted/50',
        label: 'Offline',
        icon: null,
      },
    };

    const config = statusConfig[status];

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
      >
        {/* Status Indicator */}
        <div className="relative">
          <div className={cn('rounded-full', sizeStyles[size], config.color)} />
          {status === 'running' && showPulse && (
            <div className={cn(
              'absolute inset-0 rounded-full bg-green-500 animate-ping',
              sizeStyles[size]
            )} />
          )}
        </div>

        {/* Avatar */}
        {avatar && (
          <div className="flex-shrink-0">
            {typeof avatar === 'string' ? (
              <img src={avatar} alt={name} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                {React.createElement(avatar, { className: 'w-4 h-4 text-primary' })}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={cn('flex items-center gap-2', textSizeStyles[size])}>
            {name && (
              <span className="font-medium text-text-primary truncate">{name}</span>
            )}
            {type && (
              <span className="text-text-muted">·</span>
            )}
            {config.icon && (
              <span className="flex items-center gap-1 text-text-muted">
                {config.icon}
                <span className={cn(textSizeStyles[size], 'text-text-muted')}>
                  {config.label}
                </span>
              </span>
            )}
            {!config.icon && (
              <span className={cn(textSizeStyles[size], 'text-text-muted')}>
                {config.label}
              </span>
            )}
          </div>
          {currentTask && (
            <p className="text-xs text-text-muted truncate">{currentTask}</p>
          )}
        </div>

        {/* Action Buttons (for expanded UI) */}
        {size !== 'sm' && (
          <button className="flex-shrink-0 p-1 hover:bg-surface-hover rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>
    );
  }
);

AgentStatusUntitled.displayName = 'AgentStatusUntitled';

// ============================================================================
// Quick Agent Status (Inline Version)
// ============================================================================

export interface AgentStatusQuickProps {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'offline';
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const AgentStatusQuick: React.FC<AgentStatusQuickProps> = ({
  status,
  name,
  size = 'sm',
  showLabel = false,
  className,
}) => {
  const sizeStyles = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const statusConfig = {
    idle: { color: 'bg-text-muted', label: 'Idle' },
    running: { color: 'bg-green-500', label: 'Running' },
    completed: { color: 'bg-blue-500', label: 'Completed' },
    failed: { color: 'bg-red-500', label: 'Failed' },
    offline: { color: 'bg-gray-300', label: 'Offline' },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn('rounded-full', sizeStyles[size], config.color)} />
      {name && showLabel && (
        <span className="text-xs text-text-muted">{name}</span>
      )}
      {!name && showLabel && (
        <span className="text-xs text-text-muted">{config.label}</span>
      )}
    </div>
  );
};
