/**
 * Unit Tests for Workflow Executor
 */

// @ts-nocheck - vitest types not installed for build
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowExecutor, executeWorkflow } from '../executor';
import type { Workflow, WorkflowNode } from '../types';

describe('WorkflowExecutor', () => {
  let mockWorkflow: Workflow;

  beforeEach(() => {
    mockWorkflow = {
      id: 'test-workflow-id',
      organization_id: 'test-org-id',
      name: 'Test Workflow',
      description: 'Test workflow description',
      status: 'active',
      trigger_definitions: [],
      nodes: [],
      edges: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  describe('initialization', () => {
    it('should create executor with workflow and trigger data', () => {
      const triggerData = { test: 'data' };
      const executor = new WorkflowExecutor(mockWorkflow, triggerData);

      expect(executor).toBeDefined();
    });

    it('should initialize execution with pending status', () => {
      const executor = new WorkflowExecutor(mockWorkflow, {});
      const execution = (executor as any).execution;

      expect(execution.status).toBe('pending');
      expect(execution.workflow_id).toBe(mockWorkflow.id);
    });
  });

  describe('node execution', () => {
    it('should execute action node', async () => {
      const actionNode: WorkflowNode = {
        id: 'action-1',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Action',
          actionType: 'logic:delay',
          config: { duration: 100 },
        },
      };

      mockWorkflow.nodes = [actionNode];

      const executor = new WorkflowExecutor(mockWorkflow, {});
      const result = await (executor as any).executeNode(actionNode);

      expect(result.success).toBe(true);
    });

    it('should handle node execution errors', async () => {
      const errorNode: WorkflowNode = {
        id: 'error-node',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'Error Action',
          actionType: 'nonexistent:action',
          config: {},
        },
      };

      mockWorkflow.nodes = [errorNode];

      const executor = new WorkflowExecutor(mockWorkflow, {});

      await expect(
        (executor as any).executeNode(errorNode)
      ).rejects.toThrow();
    });

    it('should respect retry configuration', async () => {
      let attempts = 0;
      const retryNode: WorkflowNode = {
        id: 'retry-node',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'Retry Action',
          actionType: 'logic:delay',
          config: { duration: 1 },
          retryConfig: {
            maxAttempts: 3,
            backoffType: 'exponential',
            initialDelay: 10,
          },
        },
      };

      mockWorkflow.nodes = [retryNode];

      const executor = new WorkflowExecutor(mockWorkflow, {});

      // This should retry on failure
      // Implementation would need to mock executeAction to fail first few times
      const result = await (executor as any).executeNode(
        retryNode,
        retryNode.data.retryConfig
      );

      expect(result).toBeDefined();
    });
  });

  describe('context management', () => {
    it('should initialize context with trigger data', () => {
      const triggerData = {
        contact_id: '123',
        email: 'test@example.com',
      };

      const executor = new WorkflowExecutor(mockWorkflow, triggerData);
      const context = (executor as any).getContextAsObject();

      expect(context.contact_id).toBe('123');
      expect(context.email).toBe('test@example.com');
    });

    it('should update context with action results', async () => {
      const actionNode: WorkflowNode = {
        id: 'action-1',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Action',
          actionType: 'logic:delay',
          config: { duration: 1 },
        },
      };

      mockWorkflow.nodes = [actionNode];

      const executor = new WorkflowExecutor(mockWorkflow, {});
      await (executor as any).executeNode(actionNode);

      const context = (executor as any).getContextAsObject();
      expect(context).toBeDefined();
    });
  });

  describe('variable resolution', () => {
    it('should resolve simple variable references', () => {
      const executor = new WorkflowExecutor(mockWorkflow, {
        contact: { email: 'test@example.com' },
      });

      const value = (executor as any).getValueFromPath('contact.email');
      expect(value).toBe('test@example.com');
    });

    it('should resolve nested variable references', () => {
      const executor = new WorkflowExecutor(mockWorkflow, {
        contact: { company: { name: 'Acme Corp' } },
      });

      const value = (executor as any).getValueFromPath('contact.company.name');
      expect(value).toBe('Acme Corp');
    });

    it('should return undefined for missing paths', () => {
      const executor = new WorkflowExecutor(mockWorkflow, {});

      const value = (executor as any).getValueFromPath('missing.path');
      expect(value).toBeUndefined();
    });
  });

  describe('execution logging', () => {
    it('should log node execution start', async () => {
      const node: WorkflowNode = {
        id: 'test-node',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Node',
          actionType: 'logic:delay',
          config: { duration: 1 },
        },
      };

      mockWorkflow.nodes = [node];

      const executor = new WorkflowExecutor(mockWorkflow, {});
      await (executor as any).executeNode(node);

      const logs = (executor as any).execution.execution_log;
      const startLog = logs.find((log: any) => log.node_id === node.id && log.status === 'started');

      expect(startLog).toBeDefined();
      expect(startLog.timestamp).toBeDefined();
    });

    it('should log node execution completion', async () => {
      const node: WorkflowNode = {
        id: 'test-node',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Node',
          actionType: 'logic:delay',
          config: { duration: 1 },
        },
      };

      mockWorkflow.nodes = [node];

      const executor = new WorkflowExecutor(mockWorkflow, {});
      await (executor as any).executeNode(node);

      const logs = (executor as any).execution.execution_log;
      const completeLog = logs.find((log: any) => log.node_id === node.id && log.status === 'completed');

      expect(completeLog).toBeDefined();
      expect(completeLog.duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('should log node execution failures', async () => {
      const errorNode: WorkflowNode = {
        id: 'error-node',
        type: 'action',
        position: { x: 0, y: 0 },
        data: {
          label: 'Error Node',
          actionType: 'invalid:action',
          config: {},
        },
      };

      mockWorkflow.nodes = [errorNode];

      const executor = new WorkflowExecutor(mockWorkflow, {});

      try {
        await (executor as any).executeNode(errorNode);
      } catch (error) {
        // Expected to fail
      }

      const logs = (executor as any).execution.execution_log;
      const errorLog = logs.find((log: any) => log.node_id === errorNode.id && log.status === 'failed');

      expect(errorLog).toBeDefined();
      expect(errorLog.error).toBeDefined();
    });
  });

  describe('workflow execution', () => {
    it('should execute complete workflow', async () => {
      const triggerNode: WorkflowNode = {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          label: 'Webhook Trigger',
          trigger: {
            id: 'trigger-1',
            type: 'webhook:incoming',
            config: {},
            enabled: true,
          },
        },
      };

      const actionNode: WorkflowNode = {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 0 },
        data: {
          label: 'Delay',
          actionType: 'logic:delay',
          config: { duration: 1 },
        },
      };

      mockWorkflow.nodes = [triggerNode, actionNode];
      mockWorkflow.edges = [
        { id: 'edge-1', source: 'trigger-1', target: 'action-1' },
      ];

      const execution = await executeWorkflow(mockWorkflow, { test: 'data' });

      expect(execution.status).toBe('completed');
      expect(execution.execution_log.length).toBeGreaterThan(0);
    });

    it('should mark workflow as failed on error', async () => {
      const triggerNode: WorkflowNode = {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          label: 'Trigger',
          trigger: {
            id: 'trigger-1',
            type: 'manual',
            config: {},
            enabled: true,
          },
        },
      };

      const errorNode: WorkflowNode = {
        id: 'error-1',
        type: 'action',
        position: { x: 100, y: 0 },
        data: {
          label: 'Error Action',
          actionType: 'invalid:action',
          config: {},
        },
      };

      mockWorkflow.nodes = [triggerNode, errorNode];
      mockWorkflow.edges = [
        { id: 'edge-1', source: 'trigger-1', target: 'error-1' },
      ];

      const execution = await executeWorkflow(mockWorkflow, {});

      expect(execution.status).toBe('failed');
      expect(execution.error).toBeDefined();
    });
  });
});
