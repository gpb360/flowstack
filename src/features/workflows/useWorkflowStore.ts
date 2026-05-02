/**
 * Workflow Store
 * Zustand store for managing workflow state
 */

import { create } from 'zustand';
import { type Node, type Edge } from '@xyflow/react';
import type { Workflow } from './types';

interface WorkflowState {
  // Current workflow being edited
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  workflowStatus: 'active' | 'paused' | 'draft';

  // Canvas state
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // UI state
  isDirty: boolean;
  isValid: boolean;
  validationErrors: string[];

  // Actions
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;
  setWorkflowStatus: (status: 'active' | 'paused' | 'draft') => void;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Omit<Node, 'id'>) => void;
  updateNode: (nodeId: string, data: Partial<Node['data']>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;

  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;

  validateWorkflow: () => boolean;
  resetWorkflow: () => void;
  loadWorkflow: (workflow: Workflow) => void;
  exportWorkflow: (organizationId?: string) => Workflow;
  markDirty: () => void;
  markClean: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  workflowId: null,
  workflowName: 'Untitled Workflow',
  workflowDescription: '',
  workflowStatus: 'draft',

  nodes: [],
  edges: [],
  selectedNodeId: null,

  isDirty: false,
  isValid: true,
  validationErrors: [],

  // Actions
  setWorkflowId: (id) => set({ workflowId: id }),

  setWorkflowName: (name) => set({ workflowName: name, isDirty: true }),

  setWorkflowDescription: (description) => set({ workflowDescription: description, isDirty: true }),

  setWorkflowStatus: (status) => set({ workflowStatus: status }),

  setNodes: (nodes) => set({ nodes, isDirty: true }),

  setEdges: (edges) => set({ edges, isDirty: true }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, { ...node, id: crypto.randomUUID() }],
      isDirty: true,
    })),

  updateNode: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
      isDirty: true,
    })),

  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      isDirty: true,
    })),

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, { ...edge, id: crypto.randomUUID() }],
      isDirty: true,
    })),

  deleteEdge: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      isDirty: true,
    })),

  validateWorkflow: () => {
    const state = get();
    const errors: string[] = [];

    // Check if workflow has a trigger
    const hasTrigger = state.nodes.some((node) => node.type === 'trigger');
    if (!hasTrigger) {
      errors.push('Workflow must have at least one trigger node');
    }

    // Check if all nodes are connected
    const connectedNodeIds = new Set([
      ...state.edges.map((e) => e.source),
      ...state.edges.map((e) => e.target),
    ]);

    const unconnectedNodes = state.nodes.filter(
      (node) => !connectedNodeIds.has(node.id) && node.type !== 'trigger'
    );

    if (unconnectedNodes.length > 0) {
      errors.push(
        `${unconnectedNodes.length} node(s) are not connected to the workflow`
      );
    }

    // Check for orphaned nodes (no incoming or outgoing connections)
    const orphanedNodes = state.nodes.filter((node) => {
      if (node.type === 'trigger') return false; // Triggers don't need incoming connections

      const hasIncoming = state.edges.some((e) => e.target === node.id);
      const hasOutgoing = state.edges.some((e) => e.source === node.id);

      return !hasIncoming || !hasOutgoing;
    });

    if (orphanedNodes.length > 0) {
      errors.push(
        `${orphanedNodes.length} node(s) have missing connections`
      );
    }

    const isValid = errors.length === 0;
    set({ isValid, validationErrors: errors });
    return isValid;
  },

  resetWorkflow: () =>
    set({
      workflowId: null,
      workflowName: 'Untitled Workflow',
      workflowDescription: '',
      workflowStatus: 'draft',
      nodes: [],
      edges: [],
      selectedNodeId: null,
      isDirty: false,
      isValid: true,
      validationErrors: [],
    }),

  loadWorkflow: (workflow) =>
    set({
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowDescription: workflow.description || '',
      workflowStatus: workflow.status,
      nodes: workflow.nodes,
      edges: workflow.edges,
      isDirty: false,
    }),

  exportWorkflow: (organizationId?: string): Workflow => {
    const state = get();
    // Extract trigger definitions from trigger nodes on the canvas
    const triggerDefinitions = state.nodes
      .filter((node) => node.type === 'trigger' && node.data?.trigger)
      .map((node) => {
        const trigger = node.data.trigger as {
          id?: string;
          type?: string;
          config?: Record<string, unknown>;
          enabled?: boolean;
        };
        return {
          id: trigger.id || node.id,
          type: trigger.type || 'manual',
          config: trigger.config || {},
          enabled: trigger.enabled !== false,
        };
      });

    return {
      id: state.workflowId || crypto.randomUUID(),
      organization_id: organizationId || '',
      name: state.workflowName,
      description: state.workflowDescription,
      status: state.workflowStatus,
      trigger_definitions: triggerDefinitions,
      nodes: state.nodes,
      edges: state.edges,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Workflow;
  },

  markDirty: () => set({ isDirty: true }),

  markClean: () => set({ isDirty: false }),
}));
