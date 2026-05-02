/**
 * Conversations Chart Component
 * Line/bar chart for displaying conversation metrics over time
 */

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ConversationsChartProps {
  data: Array<{
    date: string;
    conversations?: number;
    messages?: number;
    responseTime?: number;
    satisfaction?: number;
  }>;
  type?: 'bar' | 'line';
  color?: string;
}

export function ConversationsChart({ data, type = 'bar', color = '#3B82F6' }: ConversationsChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const hasConversations = data.some((d) => d.conversations !== undefined);
  const hasMessages = data.some((d) => d.messages !== undefined);
  const hasResponseTime = data.some((d) => d.responseTime !== undefined);
  const hasSatisfaction = data.some((d) => d.satisfaction !== undefined);

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />

          {hasConversations && (
            <Line
              type="monotone"
              dataKey="conversations"
              stroke={color}
              strokeWidth={2}
              name="Conversations"
            />
          )}

          {hasMessages && (
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#10B981"
              strokeWidth={2}
              name="Messages"
            />
          )}

          {hasResponseTime && (
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Avg Response Time (min)"
            />
          )}

          {hasSatisfaction && (
            <Line
              type="monotone"
              dataKey="satisfaction"
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Satisfaction"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />

        {hasConversations && (
          <Bar dataKey="conversations" fill={color} name="Conversations" />
        )}

        {hasMessages && (
          <Bar dataKey="messages" fill="#10B981" name="Messages" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
