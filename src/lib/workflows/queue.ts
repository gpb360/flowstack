/**
 * Queue Management for Workflow Executions
 * Handles persistent queuing, retry logic, and worker pool management
 */

import type { QueuePriority } from './types';
import { executeWorkflow } from './executor';
import { supabase } from '../supabase';

/**
 * Workflow Queue Manager
 */
export class WorkflowQueue {
  private workers: Map<string, Worker> = new Map();
  private maxWorkers: number = 5;
  private processing: Set<string> = new Set();

  constructor(maxWorkers: number = 5) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * Add a workflow execution to the queue
   */
  async enqueue(
    workflowId: string,
    organizationId: string,
    triggerData: Record<string, any>,
    priority: QueuePriority = 'normal',
    scheduledAt?: Date
  ): Promise<string> {
    const priorityValue = this.getPriorityValue(priority);

    const { data, error } = await (supabase
      .from('workflow_queue') as any)
      .insert({
        workflow_id: workflowId,
        organization_id: organizationId,
        priority: priorityValue,
        scheduled_at: scheduledAt?.toISOString() || new Date().toISOString(),
        status: 'queued',
        attempt_count: 0,
        max_attempts: 3,
      })
      .select()
      .single();

    if (error) throw error;

    // Store trigger data
    await (supabase.from('workflow_queue_data') as any).insert({
      queue_item_id: data.id,
      trigger_data: triggerData,
    });

    return data.id;
  }

  /**
   * Start the queue processor
   */
  async start(): Promise<void> {
    console.log('[WorkflowQueue] Starting queue processor');

    // Poll for new items
    setInterval(() => {
      this.processQueue();
    }, 5000); // Poll every 5 seconds

    // Initial check
    this.processQueue();
  }

  /**
   * Stop the queue processor
   */
  async stop(): Promise<void> {
    console.log('[WorkflowQueue] Stopping queue processor');

    // Stop all workers
    for (const [id, worker] of this.workers) {
      worker.terminate();
      this.workers.delete(id);
    }

    this.processing.clear();
  }

  /**
   * Process items from the queue
   */
  private async processQueue(): Promise<void> {
    // Check if we have capacity
    if (this.processing.size >= this.maxWorkers) {
      return;
    }

    // Fetch next batch of items
    const { data: items } = await (supabase
      .from('workflow_queue') as any)
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('scheduled_at', { ascending: true })
      .limit(this.maxWorkers - this.processing.size);

    if (!items || items.length === 0) {
      return;
    }

    // Process each item
    for (const item of items) {
      if (this.processing.has(item.id)) continue;

      this.processing.add(item.id);
      this.processQueueItem(item).finally(() => {
        this.processing.delete(item.id);
      });
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: any): Promise<void> {
    try {
      // Mark as processing
      await (supabase
        .from('workflow_queue') as any)
        .update({ status: 'processing' })
        .eq('id', item.id);

      // Fetch trigger data
      const { data: queueData } = await (supabase
        .from('workflow_queue_data') as any)
        .select('trigger_data')
        .eq('queue_item_id', item.id)
        .single();

      if (!queueData) {
        throw new Error('Trigger data not found');
      }

      // Fetch workflow
      const { data: workflow } = await (supabase
        .from('workflows') as any)
        .select('*')
        .eq('id', item.workflow_id)
        .single();

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Execute workflow
      const execution = await executeWorkflow(workflow, queueData.trigger_data);

      // Update queue item
      if (execution.status === 'completed') {
        await this.markCompleted(item.id);
      } else if (execution.status === 'failed') {
        await this.handleFailure(item.id, item.attempt_count, item.max_attempts, execution.error);
      }

    } catch (error) {
      await this.handleFailure(
        item.id,
        item.attempt_count,
        item.max_attempts,
        {
          message: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  /**
   * Mark a queue item as completed
   */
  private async markCompleted(itemId: string): Promise<void> {
    await (supabase
      .from('workflow_queue') as any)
      .update({ status: 'completed' })
      .eq('id', itemId);
  }

  /**
   * Handle a failed queue item
   */
  private async handleFailure(
    itemId: string,
    attemptCount: number,
    maxAttempts: number,
    error: any
  ): Promise<void> {
    if (attemptCount >= maxAttempts) {
      // Max attempts reached, mark as failed
      await (supabase
        .from('workflow_queue') as any)
        .update({
          status: 'failed',
          error,
        })
        .eq('id', itemId);
    } else {
      // Retry with exponential backoff
      const delay = Math.pow(2, attemptCount) * 1000; // 2s, 4s, 8s, etc.
      const retryAt = new Date(Date.now() + delay);

      await (supabase
        .from('workflow_queue') as any)
        .update({
          status: 'queued',
          attempt_count: attemptCount + 1,
          scheduled_at: retryAt.toISOString(),
        })
        .eq('id', itemId);
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const { data } = await (supabase
      .from('workflow_queue') as any)
      .select('status');

    const stats = {
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const item of data || []) {
      stats[item.status as keyof typeof stats]++;
    }

    return stats;
  }

  /**
   * Retry failed queue items
   */
  async retryFailed(itemId?: string): Promise<void> {
    if (itemId) {
      await (supabase
        .from('workflow_queue') as any)
        .update({
          status: 'queued',
          attempt_count: 0,
          scheduled_at: new Date().toISOString(),
        })
        .eq('id', itemId);
    } else {
      await (supabase
        .from('workflow_queue') as any)
        .update({
          status: 'queued',
          attempt_count: 0,
          scheduled_at: new Date().toISOString(),
        })
        .eq('status', 'failed');
    }
  }

  /**
   * Cancel a queue item
   */
  async cancel(itemId: string): Promise<void> {
    await (supabase
      .from('workflow_queue') as any)
      .update({ status: 'cancelled' })
      .eq('id', itemId);
  }

  /**
   * Clear completed items older than specified days
   */
  async clearCompleted(daysOld: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await (supabase
      .from('workflow_queue') as any)
      .delete()
      .eq('status', 'completed')
      .lt('created_at', cutoffDate.toISOString());
  }

  /**
   * Get priority value for sorting
   */
  private getPriorityValue(priority: QueuePriority): number {
    const priorities: Record<QueuePriority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
    };
    return priorities[priority];
  }
}

/**
 * Singleton queue instance
 */
let queueInstance: WorkflowQueue | null = null;

/**
 * Get or create the queue instance
 */
export function getQueue(): WorkflowQueue {
  if (!queueInstance) {
    queueInstance = new WorkflowQueue(5);
  }
  return queueInstance;
}

/**
 * Initialize and start the queue
 */
export async function initializeQueue(): Promise<void> {
  const queue = getQueue();
  await queue.start();
}

/**
 * Add a workflow to the execution queue
 */
export async function queueWorkflow(
  workflowId: string,
  organizationId: string,
  triggerData: Record<string, any>,
  options?: {
    priority?: QueuePriority;
    scheduledAt?: Date;
  }
): Promise<string> {
  const queue = getQueue();
  return queue.enqueue(
    workflowId,
    organizationId,
    triggerData,
    options?.priority || 'normal',
    options?.scheduledAt
  );
}

// ============================================================================
// DEAD LETTER QUEUE
// ============================================================================

/**
 * Move failed items to dead letter queue
 */
export async function moveToDeadLetterQueue(itemId: string): Promise<void> {
  const { data: item } = await (supabase
    .from('workflow_queue') as any)
    .select('*')
    .eq('id', itemId)
    .single();

  if (!item) return;

  await (supabase.from('workflow_dead_letter_queue') as any).insert({
    original_queue_id: item.id,
    workflow_id: item.workflow_id,
    organization_id: item.organization_id,
    priority: item.priority,
    attempt_count: item.attempt_count,
    error: item.error,
    created_at: item.created_at,
  });

  await (supabase.from('workflow_queue') as any).delete().eq('id', itemId);
}

/**
 * Get items from dead letter queue
 */
export async function getDeadLetterItems(organizationId?: string): Promise<any[]> {
  let query = (supabase.from('workflow_dead_letter_queue') as any).select('*');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data } = await query;
  return data || [];
}

/**
 * Restore item from dead letter queue
 */
export async function restoreFromDeadLetterQueue(deadLetterId: string): Promise<void> {
  const { data: item } = await (supabase
    .from('workflow_dead_letter_queue') as any)
    .select('*')
    .eq('id', deadLetterId)
    .single();

  if (!item) return;

  await (supabase.from('workflow_queue') as any).insert({
    workflow_id: item.workflow_id,
    organization_id: item.organization_id,
    priority: item.priority,
    scheduled_at: new Date().toISOString(),
    status: 'queued',
    attempt_count: 0,
    max_attempts: 3,
  });

  await (supabase.from('workflow_dead_letter_queue') as any).delete().eq('id', deadLetterId);
}
