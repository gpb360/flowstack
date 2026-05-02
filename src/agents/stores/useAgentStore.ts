/**
 * Agent Store
 * Zustand store for agent editor state with undo/redo (mirrors useBuilderStore.ts pattern)
 */

import { create } from 'zustand';
import type {
  AgentDefinition,
  OrchestratorWorkflow,
  OrchestratorTask,
  OrchestratorResult,
  ExecutionStrategy,
} from '../types';

// ============================================================================
// Types
// ============================================================================

export interface AgentStoreState {
  // Current orchestrator workflow being edited
  workflow: OrchestratorWorkflow | null;

  // List of saved workflows
  savedWorkflows: OrchestratorWorkflow[];

  // Selected task ID
  selectedTaskId: string | null;

  // Execution state
  isExecuting: boolean;
  executionResult: OrchestratorResult | null;

  // Editor state
  isDirty: boolean;
  lastSaved: Date | null;

  // Undo/Redo history
  history: OrchestratorWorkflow[];
  historyIndex: number;

  // Available agents
  availableAgents: AgentDefinition[];

  // Error state
  error: string | null;
}

export interface AgentStoreActions {
  // Workflow actions
  setWorkflow: (workflow: OrchestratorWorkflow) => void;
  createWorkflow: (name: string, strategy: ExecutionStrategy) => void;
  updateWorkflow: (updates: Partial<OrchestratorWorkflow>) => void;
  deleteWorkflow: (workflowId: string) => void;
  saveWorkflow: () => void;
  loadWorkflow: (workflowId: string) => void;
  clearWorkflow: () => void;

  // Task actions
  addTask: (task: OrchestratorTask) => void;
  updateTask: (taskId: string, updates: Partial<OrchestratorTask>) => void;
  removeTask: (taskId: string) => void;
  moveTask: (taskId: string, newIndex: number) => void;
  duplicateTask: (taskId: string) => void;

  // Selection actions
  selectTask: (taskId: string | null) => void;

  // Execution actions
  setExecuting: (isExecuting: boolean) => void;
  setExecutionResult: (result: OrchestratorResult | null) => void;

  // Agent actions
  setAvailableAgents: (agents: AgentDefinition[]) => void;

  // Error actions
  setError: (error: string | null) => void;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  resetHistory: () => void;

  // Utility actions
  markDirty: () => void;
  markClean: () => void;
}

export type AgentStore = AgentStoreState & AgentStoreActions;

// ============================================================================
// Store
// ============================================================================

/**
 * Helper to find and update a task in the workflow
 */
function findAndUpdate<T>(
  items: T[],
  predicate: (item: T, index: number) => boolean,
  updater: (item: T) => T
): T[] {
  const index = items.findIndex(predicate);
  if (index === -1) return items;
  const newItems = [...items];
  newItems[index] = updater(newItems[index]);
  return newItems;
}

/**
 * Helper to find and remove a task from the workflow
 */
function findAndRemove<T>(
  items: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  const index = items.findIndex(predicate);
  if (index === -1) return items;
  const newItems = [...items];
  newItems.splice(index, 1);
  return newItems;
}

/**
 * Helper to insert an element at a specific index
 */
function insertElement<T>(items: T[], element: T, index: number): T[] {
  const newItems = [...items];
  newItems.splice(index, 0, element);
  return newItems;
}

/**
 * Generate a unique ID for a task
 */
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique ID for a workflow
 */
function generateWorkflowId(): string {
  return `workflow_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state
  workflow: null,
  savedWorkflows: [],
  selectedTaskId: null,
  isExecuting: false,
  executionResult: null,
  isDirty: false,
  lastSaved: null,
  history: [],
  historyIndex: 0,
  availableAgents: [],
  error: null,

  // ============================================================================
  // Workflow Actions
  // ============================================================================

  setWorkflow: (workflow) => {
    const { history, historyIndex } = get();
    const newHistory = [...history.slice(0, historyIndex + 1), workflow];
    set({
      workflow,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isDirty: true,
    });
  },

  createWorkflow: (name, strategy) => {
    const newWorkflow: OrchestratorWorkflow = {
      id: generateWorkflowId(),
      name,
      description: '',
      strategy,
      tasks: [],
      onError: 'stop',
      maxRetries: 3,
    };
    get().setWorkflow(newWorkflow);
    set({ selectedTaskId: null });
  },

  updateWorkflow: (updates) => {
    const { workflow } = get();
    if (!workflow) return;
    get().setWorkflow({ ...workflow, ...updates });
  },

  deleteWorkflow: (workflowId) => {
    const { savedWorkflows } = get();
    const filtered = savedWorkflows.filter(w => w.id !== workflowId);
    set({ savedWorkflows: filtered });
  },

  saveWorkflow: () => {
    const { workflow, savedWorkflows } = get();
    if (!workflow) return;

    const existingIndex = savedWorkflows.findIndex(w => w.id === workflow.id);
    let newSavedWorkflows;

    if (existingIndex >= 0) {
      newSavedWorkflows = [...savedWorkflows];
      newSavedWorkflows[existingIndex] = workflow;
    } else {
      newSavedWorkflows = [...savedWorkflows, workflow];
    }

    set({
      savedWorkflows: newSavedWorkflows,
      isDirty: false,
      lastSaved: new Date(),
    });
  },

  loadWorkflow: (workflowId) => {
    const { savedWorkflows } = get();
    const workflow = savedWorkflows.find(w => w.id === workflowId);
    if (workflow) {
      get().setWorkflow(workflow);
    }
  },

  clearWorkflow: () => {
    set({
      workflow: null,
      selectedTaskId: null,
      isDirty: false,
      executionResult: null,
    });
  },

  // ============================================================================
  // Task Actions
  // ============================================================================

  addTask: (task) => {
    const { workflow } = get();
    if (!workflow) return;

    const newTask = { ...task, id: task.id || generateTaskId() };
    get().setWorkflow({
      ...workflow,
      tasks: [...workflow.tasks, newTask],
    });
    set({ selectedTaskId: newTask.id, isDirty: true });
  },

  updateTask: (taskId, updates) => {
    const { workflow } = get();
    if (!workflow) return;

    const updatedTasks = findAndUpdate(
      workflow.tasks,
      (task) => task.id === taskId,
      (task) => ({ ...task, ...updates })
    );

    get().setWorkflow({
      ...workflow,
      tasks: updatedTasks,
    });
    set({ isDirty: true });
  },

  removeTask: (taskId) => {
    const { workflow, selectedTaskId } = get();
    if (!workflow) return;

    const updatedTasks = findAndRemove(
      workflow.tasks,
      (task) => task.id === taskId
    );

    get().setWorkflow({
      ...workflow,
      tasks: updatedTasks,
    });

    if (selectedTaskId === taskId) {
      set({ selectedTaskId: null });
    }
    set({ isDirty: true });
  },

  moveTask: (taskId, newIndex) => {
    const { workflow } = get();
    if (!workflow) return;

    const taskIndex = workflow.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1 || taskIndex === newIndex) return;

    const tasks = [...workflow.tasks];
    const [task] = tasks.splice(taskIndex, 1);
    tasks.splice(newIndex, 0, task);

    get().setWorkflow({
      ...workflow,
      tasks,
    });
    set({ isDirty: true });
  },

  duplicateTask: (taskId) => {
    const { workflow } = get();
    if (!workflow) return;

    const task = workflow.tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskIndex = workflow.tasks.findIndex(t => t.id === taskId);
    const newTask: OrchestratorTask = {
      ...task,
      id: generateTaskId(),
    };

    const updatedTasks = insertElement(workflow.tasks, newTask, taskIndex + 1);
    get().setWorkflow({
      ...workflow,
      tasks: updatedTasks,
    });
    set({ selectedTaskId: newTask.id, isDirty: true });
  },

  // ============================================================================
  // Selection Actions
  // ============================================================================

  selectTask: (taskId) => {
    set({ selectedTaskId: taskId });
  },

  // ============================================================================
  // Execution Actions
  // ============================================================================

  setExecuting: (isExecuting) => {
    set({ isExecuting });
  },

  setExecutionResult: (result) => {
    set({ executionResult: result });
  },

  // ============================================================================
  // Agent Actions
  // ============================================================================

  setAvailableAgents: (agents) => {
    set({ availableAgents: agents });
  },

  // ============================================================================
  // Error Actions
  // ============================================================================

  setError: (error) => {
    set({ error });
  },

  // ============================================================================
  // Undo/Redo Actions
  // ============================================================================

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        workflow: history[newIndex],
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        workflow: history[newIndex],
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  canUndo: () => {
    return get().historyIndex > 0;
  },

  canRedo: () => {
    const { historyIndex, history } = get();
    return historyIndex < history.length - 1;
  },

  resetHistory: () => {
    const { workflow } = get();
    set({
      history: workflow ? [workflow] : [],
      historyIndex: workflow ? 0 : -1,
    });
  },

  // ============================================================================
  // Utility Actions
  // ============================================================================

  markDirty: () => {
    set({ isDirty: true });
  },

  markClean: () => {
    set({ isDirty: false });
  },
}));
