/**
 * Workflows Feature Module
 * Exports all public components and utilities
 */

export { WorkflowLayout } from './WorkflowLayout';
export { WorkflowBuilderPage } from './WorkflowBuilderPage';
export { WorkflowBuilder } from './WorkflowBuilder'; // Legacy export
export { WorkflowCanvas } from './canvas';
export { NodePalette } from './components/NodePalette';
export { WorkflowsList } from './list';
export { WorkflowTemplates } from './list';
export { ExecutionLogs } from './logs/ExecutionLogs';
export { useWorkflowStore } from './useWorkflowStore';

// Types
export type { Workflow, TriggerType, ActionType } from './types';
export type { ActionNodeData, AgentNodeData } from './types';
export type { TriggerNodeData } from '../../lib/workflows/types';
