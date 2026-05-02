/**
 * Agent Monitoring Service
 * Health monitoring and metrics for agent execution
 */

import type { DbAgentExecution } from '../types';
import { getAgentDefinition } from '../registry';

// ============================================================================
// Types
// ============================================================================

export interface AgentHealthStatus {
  agentId: string;
  isHealthy: boolean;
  lastExecution?: DbAgentExecution;
  successRate: number;
  avgDuration: number;
  errorCount: number;
  totalExecutions: number;
}

export interface SystemHealthStatus {
  isHealthy: boolean;
  agentStatuses: Record<string, AgentHealthStatus>;
  totalExecutions: number;
  totalErrors: number;
  overallSuccessRate: number;
}

export interface AgentMetrics {
  agentId: string;
  timeRange: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  errors: Array<{ error: string; count: number }>;
}

// ============================================================================
// Agent Monitoring Service
// ============================================================================

class AgentMonitoringServiceClass {
  private healthCache = new Map<string, AgentHealthStatus>();
  private cacheTimeout = 60000; // 1 minute
  private lastCacheUpdate = 0;

  /**
   * Get health status for all agents
   */
  async getSystemHealth(organizationId: string): Promise<SystemHealthStatus> {
    const now = Date.now();

    // Use cache if fresh
    if (now - this.lastCacheUpdate < this.cacheTimeout && this.healthCache.size > 0) {
      return this.buildSystemHealth(organizationId);
    }

    // Fetch fresh data
    await this.refreshHealthCache(organizationId);

    return this.buildSystemHealth(organizationId);
  }

  /**
   * Get health status for a specific agent
   */
  async getAgentHealth(organizationId: string, agentId: string): Promise<AgentHealthStatus> {
    const definition = getAgentDefinition(agentId);
    if (!definition) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const { supabase } = await import('@/lib/supabase');

    // Get recent executions for this agent
    const { data: executions, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('agent_id', agentId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching agent health:', error);
      return this.getDefaultHealthStatus(agentId);
    }

    return this.calculateHealthStatus(agentId, executions || []);
  }

  /**
   * Get metrics for an agent
   */
  async getAgentMetrics(
    organizationId: string,
    agentId: string,
    timeRange: string = '24h'
  ): Promise<AgentMetrics> {
    const definition = getAgentDefinition(agentId);
    if (!definition) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const { supabase } = await import('@/lib/supabase');

    // Calculate time range
    const startTime = this.getStartTimeForRange(timeRange);

    // Get executions in time range
    const { data: executions, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('agent_id', agentId)
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agent metrics:', error);
      return this.getDefaultMetrics(agentId, timeRange);
    }

    return this.calculateMetrics(agentId, timeRange, executions || []);
  }

  /**
   * Get execution history for an agent
   */
  async getExecutionHistory(
    organizationId: string,
    agentId: string | null,
    limit: number = 50,
    offset: number = 0
  ): Promise<DbAgentExecution[]> {
    const { supabase } = await import('@/lib/supabase');

    let query = supabase
      .from('agent_executions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching execution history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get execution statistics across all agents
   */
  async getExecutionStats(
    organizationId: string,
    days: number = 30
  ): Promise<Array<{
    agentId: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    avgDuration: number;
    successRate: number;
  }>> {
    const { supabase } = await import('@/lib/supabase');

    // Call the database function for stats
    const { data, error } = await (supabase.rpc as any)('get_agent_execution_stats', {
      p_organization_id: organizationId,
      p_days: days,
    });

    if (error) {
      console.error('Error fetching execution stats:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Refresh health cache
   */
  private async refreshHealthCache(organizationId: string): Promise<void> {
    const { supabase } = await import('@/lib/supabase');

    // Get recent executions for all agents
    const { data: executions, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error refreshing health cache:', error);
      return;
    }

    // Group by agent
    const executionsByAgent = new Map<string, DbAgentExecution[]>();
    for (const execution of (executions || []) as DbAgentExecution[]) {
      if (!executionsByAgent.has(execution.agent_id)) {
        executionsByAgent.set(execution.agent_id, []);
      }
      executionsByAgent.get(execution.agent_id)!.push(execution);
    }

    // Calculate health for each agent
    this.healthCache.clear();
    for (const [agentId, agentExecutions] of executionsByAgent) {
      this.healthCache.set(agentId, this.calculateHealthStatus(agentId, agentExecutions));
    }

    this.lastCacheUpdate = Date.now();
  }

  /**
   * Build system health from cache
   */
  private buildSystemHealth(_organizationId: string): SystemHealthStatus {
    const agentStatuses: Record<string, AgentHealthStatus> = {};

    for (const [agentId, status] of this.healthCache) {
      agentStatuses[agentId] = status;
    }

    const totalExecutions = Object.values(agentStatuses).reduce(
      (sum, s) => sum + s.totalExecutions,
      0
    );
    const totalErrors = Object.values(agentStatuses).reduce(
      (sum, s) => sum + s.errorCount,
      0
    );
    const overallSuccessRate = totalExecutions > 0
      ? ((totalExecutions - totalErrors) / totalExecutions) * 100
      : 100;

    return {
      isHealthy: overallSuccessRate >= 80,
      agentStatuses,
      totalExecutions,
      totalErrors,
      overallSuccessRate,
    };
  }

  /**
   * Calculate health status from executions
   */
  private calculateHealthStatus(
    agentId: string,
    executions: DbAgentExecution[]
  ): AgentHealthStatus {
    const totalExecutions = executions.length;
    const errorCount = executions.filter(e => e.status === 'failed').length;
    const successRate = totalExecutions > 0
      ? ((totalExecutions - errorCount) / totalExecutions) * 100
      : 100;

    const durations = executions
      .filter(e => e.duration_ms !== null)
      .map(e => e.duration_ms!);
    const avgDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const isHealthy = successRate >= 80 && avgDuration < 60000; // 80% success, < 1min avg

    return {
      agentId,
      isHealthy,
      lastExecution: executions[0],
      successRate,
      avgDuration,
      errorCount,
      totalExecutions,
    };
  }

  /**
   * Calculate metrics from executions
   */
  private calculateMetrics(
    agentId: string,
    timeRange: string,
    executions: DbAgentExecution[]
  ): AgentMetrics {
    const executionCount = executions.length;
    const successCount = executions.filter(e => e.status === 'completed').length;
    const errorCount = executions.filter(e => e.status === 'failed').length;

    const durations = executions
      .filter(e => e.duration_ms !== null)
      .map(e => e.duration_ms!);

    const avgDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    const successRate = executionCount > 0
      ? (successCount / executionCount) * 100
      : 100;

    // Count errors by message
    const errorCounts = new Map<string, number>();
    for (const execution of executions) {
      if (execution.error) {
        const count = errorCounts.get(execution.error) || 0;
        errorCounts.set(execution.error, count + 1);
      }
    }

    const errors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      agentId,
      timeRange,
      executionCount,
      successCount,
      errorCount,
      avgDuration,
      minDuration,
      maxDuration,
      successRate,
      errors,
    };
  }

  /**
   * Get start time for time range
   */
  private getStartTimeForRange(timeRange: string): Date {
    const now = Date.now();
    const match = timeRange.match(/^(\d+)([hdwmy])$/);

    if (!match) {
      return new Date(now - 24 * 60 * 60 * 1000); // Default to 24h
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'h':
        return new Date(now - value * 60 * 60 * 1000);
      case 'd':
        return new Date(now - value * 24 * 60 * 60 * 1000);
      case 'w':
        return new Date(now - value * 7 * 24 * 60 * 60 * 1000);
      case 'm':
        return new Date(now - value * 30 * 24 * 60 * 60 * 1000);
      case 'y':
        return new Date(now - value * 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now - 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get default health status
   */
  private getDefaultHealthStatus(agentId: string): AgentHealthStatus {
    return {
      agentId,
      isHealthy: true,
      successRate: 100,
      avgDuration: 0,
      errorCount: 0,
      totalExecutions: 0,
    };
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(agentId: string, timeRange: string): AgentMetrics {
    return {
      agentId,
      timeRange,
      executionCount: 0,
      successCount: 0,
      errorCount: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      successRate: 100,
      errors: [],
    };
  }

  /**
   * Clear the health cache
   */
  clearCache(): void {
    this.healthCache.clear();
    this.lastCacheUpdate = 0;
  }
}

// Export singleton instance
export const AgentMonitoringService = new AgentMonitoringServiceClass();
