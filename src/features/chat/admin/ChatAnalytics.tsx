// @ts-nocheck
/**
 * Chat Analytics Component
 * Dashboard for chat performance metrics and analytics
 */

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { CardUntitled } from '@/components/ui/card-untitled';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SelectUntitled } from '@/components/ui/select-untitled';
import { MetricCardUntitled } from './MetricCardUntitled';
import { ConversationsChart } from './ConversationsChart';
import { AgentPerformanceTable } from './AgentPerformanceTable';
import { useChatAnalytics } from '../hooks/useChatMessages';

interface ChatAnalyticsProps {
  organizationId: string;
}

export function ChatAnalytics({ organizationId }: ChatAnalyticsProps) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const today = new Date();
  const dateFrom = format(subDays(today, dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90), 'yyyy-MM-dd');
  const dateTo = format(today, 'yyyy-MM-dd');

  const { analytics, metrics, isLoading } = useChatAnalytics(organizationId, dateFrom, dateTo);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat Analytics</h1>
          <p className="text-sm text-gray-600">
            Monitor your chat performance and team metrics
          </p>
        </div>

        <SelectUntitled value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectUntitled.Trigger className="w-[180px]">
            <SelectUntitled.Value />
          </SelectUntitled.Trigger>
          <SelectUntitled.Content>
            <SelectUntitled.Item value="7d">Last 7 days</SelectUntitled.Item>
            <SelectUntitled.Item value="30d">Last 30 days</SelectUntitled.Item>
            <SelectUntitled.Item value="90d">Last 90 days</SelectUntitled.Item>
          </SelectUntitled.Content>
        </SelectUntitled>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCardUntitled
          title="Total Conversations"
          value={metrics?.totalConversations || 0}
          change={metrics?.conversationsChange}
          format="number"
        />
        <MetricCardUntitled
          title="Active Conversations"
          value={metrics?.activeConversations || 0}
          format="number"
        />
        <MetricCardUntitled
          title="Messages Sent"
          value={metrics?.totalMessages || 0}
          change={metrics?.messagesChange}
          format="number"
        />
        <MetricCardUntitled
          title="Avg Response Time"
          value={metrics?.avgResponseTime || 0}
          format="duration"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Conversations Over Time */}
            <CardUntitled>
              <CardUntitled.Header>
                <CardUntitled.Title>Conversations Over Time</CardUntitled.Title>
                <CardUntitled.Description>Daily conversation volume</CardUntitled.Description>
              </CardUntitled.Header>
              <CardUntitled.Content>
                <ConversationsChart
                  data={analytics.map((a) => ({
                    date: a.date,
                    conversations: a.conversations_started,
                    messages: a.messages_sent,
                  }))}
                />
              </CardUntitled.Content>
            </CardUntitled>

            {/* Response Time Trend */}
            <CardUntitled>
              <CardUntitled.Header>
                <CardUntitled.Title>Response Time Trend</CardUntitled.Title>
                <CardUntitled.Description>Average response time over period</CardUntitled.Description>
              </CardUntitled.Header>
              <CardUntitled.Content>
                <ConversationsChart
                  data={analytics.map((a) => ({
                    date: a.date,
                    responseTime: a.avg_response_time
                      ? parseInt(a.avg_response_time) / 60
                      : 0,
                  }))}
                  type="line"
                  color="#10B981"
                />
              </CardUntitled.Content>
            </CardUntitled>
          </div>

          {/* Source Distribution */}
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Conversation Sources</CardUntitled.Title>
              <CardUntitled.Description>Where visitors are starting chats from</CardUntitled.Description>
            </CardUntitled.Header>
            <CardUntitled.Content>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(
                  analytics.reduce((acc, a) => {
                    const sources = a.conversations_by_source || {};
                    Object.entries(sources).forEach(([source, count]) => {
                      acc[source] = (acc[source] || 0) + (count as number);
                    });
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <p className="font-medium capitalize">{source || 'Direct'}</p>
                      <p className="text-sm text-gray-600">{count} conversations</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {Math.round((count / (metrics?.totalConversations || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardUntitled.Content>
          </CardUntitled>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <MetricCardUntitled
              title="Avg Conversation Duration"
              value={analytics.reduce((sum, a) => {
                const duration = a.avg_conversation_duration
                  ? parseInt(a.avg_conversation_duration)
                  : 0;
                return sum + duration;
              }, 0) / analytics.length / 60}
              format="duration"
            />
            <MetricCardUntitled
              title="Peak Concurrent Chats"
              value={Math.max(...analytics.map((a) => a.concurrent_conversations_peak))}
              format="number"
            />
            <MetricCardUntitled
              title="Avg Messages per Conversation"
              value={analytics.reduce((sum, a) => sum + (a.avg_messages_per_conversation || 0), 0) / analytics.length}
              format="number"
            />
          </div>

          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Conversation Status Distribution</CardUntitled.Title>
            </CardUntitled.Header>
            <CardUntitled.Content>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.reduce((sum, a) => sum + a.conversations_started - a.conversations_closed, 0)}
                  </p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {analytics.reduce((sum, a) => sum + a.conversations_closed, 0)}
                  </p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-gray-600">Closure Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (analytics.reduce((sum, a) => sum + a.conversations_closed, 0) /
                        (analytics.reduce((sum, a) => sum + a.conversations_started, 0) || 1)) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>
            </CardUntitled.Content>
          </CardUntitled>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Agent Performance</CardUntitled.Title>
              <CardUntitled.Description>How your team is performing</CardUntitled.Description>
            </CardUntitled.Header>
            <CardUntitled.Content>
              <AgentPerformanceTable organizationId={organizationId} dateFrom={dateFrom} dateTo={dateTo} />
            </CardUntitled.Content>
          </CardUntitled>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <CardUntitled>
              <CardUntitled.Header>
                <CardUntitled.Title>Customer Satisfaction</CardUntitled.Title>
                <CardUntitled.Description>Average rating from conversations</CardUntitled.Description>
              </CardUntitled.Header>
              <CardUntitled.Content>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-blue-600">
                      {metrics?.satisfactionScore || 0}
                      <span className="text-2xl text-gray-600">/100</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {analytics.reduce((sum, a) => sum + (a.total_ratings || 0), 0)} ratings
                    </p>
                  </div>
                </div>
              </CardUntitled.Content>
            </CardUntitled>

            <CardUntitled>
              <CardUntitled.Header>
                <CardUntitled.Title>Satisfaction Trend</CardUntitled.Title>
                <CardUntitled.Description>Rating changes over time</CardUntitled.Description>
              </CardUntitled.Header>
              <CardUntitled.Content>
                <ConversationsChart
                  data={analytics.map((a) => ({
                    date: a.date,
                    satisfaction: a.satisfaction_score || 0,
                  }))}
                  type="line"
                  color="#8B5CF6"
                />
              </CardUntitled.Content>
            </CardUntitled>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
