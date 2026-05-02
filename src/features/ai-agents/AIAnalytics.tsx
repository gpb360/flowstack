/**
 * AI Agents Analytics Page
 * Shows agent execution history, performance metrics, and insights
 */

import { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle, XCircle, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AgentExecution {
  id: string;
  agent_type: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

export function AIAnalytics() {
  const { currentOrganization } = useAuth();
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<number>(7); // days

  useEffect(() => {
    loadExecutions();
  }, [currentOrganization, selectedAgent, timeRange]);

  const loadExecutions = async () => {
    if (!currentOrganization) return;

    setIsLoading(true);

    try {
      let query = supabase
        .from('agent_executions')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedAgent !== 'all') {
        query = query.eq('agent_type', selectedAgent);
      }

      const { data, error } = await query;

      if (error) throw error;

      setExecutions(data || []);
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = executions.reduce(
    (acc, exec) => {
      acc.total++;
      if (exec.status === 'completed') acc.completed++;
      if (exec.status === 'failed') acc.failed++;
      if (exec.duration_ms) acc.totalDuration += exec.duration_ms;
      return acc;
    },
    { total: 0, completed: 0, failed: 0, totalDuration: 0 }
  );

  const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const avgDuration = stats.completed > 0 ? Math.round(stats.totalDuration / stats.completed) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Analytics</h2>
          <p className="text-text-muted">Monitor AI agent performance and usage</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedAgent}
          onChange={e => setSelectedAgent(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-lg"
        >
          <option value="all">All Agents</option>
          <option value="orchestrator">Orchestrator</option>
          <option value="crm">CRM Agent</option>
          <option value="marketing">Marketing Agent</option>
          <option value="workflow">Workflow Agent</option>
          <option value="analytics">Analytics Agent</option>
          <option value="builder">Builder Agent</option>
        </select>

        <select
          value={timeRange}
          onChange={e => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 bg-surface border border-border rounded-lg"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Total Executions</span>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Success Rate</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{successRate}%</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Avg Duration</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{avgDuration}ms</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Failed</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">{stats.failed}</div>
        </div>
      </div>

      {/* Executions Table */}
      <div className="bg-surface border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold">Execution History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Agent Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Input
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Loading...
                  </td>
                </tr>
              ) : executions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    No executions found
                  </td>
                </tr>
              ) : (
                executions.map(execution => (
                  <tr key={execution.id} className="hover:bg-surface-hover">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="font-medium capitalize">{execution.agent_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          execution.status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : execution.status === 'failed'
                            ? 'bg-red-500/10 text-red-500'
                            : execution.status === 'running'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {execution.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {execution.duration_ms ? `${execution.duration_ms}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {new Date(execution.started_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">
                      {JSON.stringify(execution.input)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
