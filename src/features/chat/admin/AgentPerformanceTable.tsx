/**
 * Agent Performance Table Component
 * Table showing individual agent performance metrics
 */

import { TableUntitled } from '@/components/ui/table-untitled';
import { AvatarUntitled } from '@/components/ui/avatar-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';

interface AgentPerformanceTableProps {
  organizationId: string;
  dateFrom: string;
  dateTo: string;
}

interface AgentPerformance {
  agentId: string;
  agentName: string;
  avatar?: string;
  totalConversations: number;
  avgResponseTime: number;
  satisfactionScore: number;
  onlineTime: number;
}

// Mock data - in real implementation, this would come from an API
const mockAgentPerformance: AgentPerformance[] = [
  {
    agentId: '1',
    agentName: 'John Smith',
    totalConversations: 145,
    avgResponseTime: 180,
    satisfactionScore: 92,
    onlineTime: 35,
  },
  {
    agentId: '2',
    agentName: 'Sarah Johnson',
    totalConversations: 132,
    avgResponseTime: 150,
    satisfactionScore: 95,
    onlineTime: 38,
  },
  {
    agentId: '3',
    agentName: 'Mike Wilson',
    totalConversations: 98,
    avgResponseTime: 210,
    satisfactionScore: 88,
    onlineTime: 28,
  },
];

export function AgentPerformanceTable({ organizationId, dateFrom, dateTo }: AgentPerformanceTableProps) {
  return (
    <div className="rounded-md border">
      <TableUntitled>
        <TableUntitled.Header>
          <TableUntitled.Row>
            <TableUntitled.Head>Agent</TableUntitled.Head>
            <TableUntitled.Head className="text-right">Conversations</TableUntitled.Head>
            <TableUntitled.Head className="text-right">Avg Response Time</TableUntitled.Head>
            <TableUntitled.Head className="text-right">Satisfaction</TableUntitled.Head>
            <TableUntitled.Head className="text-right">Online Time</TableUntitled.Head>
            <TableUntitled.Head className="text-right">Status</TableUntitled.Head>
          </TableUntitled.Row>
        </TableUntitled.Header>
        <TableUntitled.Body>
          {mockAgentPerformance.map((agent) => (
            <TableUntitled.Row key={agent.agentId}>
              <TableUntitled.Cell>
                <div className="flex items-center gap-3">
                  <AvatarUntitled className="h-8 w-8">
                    <AvatarUntitled.Image src={agent.avatar} />
                    <AvatarUntitled.Fallback>
                      {agent.agentName.split(' ').map((n) => n[0]).join('')}
                    </AvatarUntitled.Fallback>
                  </AvatarUntitled>
                  <span className="font-medium">{agent.agentName}</span>
                </div>
              </TableUntitled.Cell>
              <TableUntitled.Cell className="text-right">{agent.totalConversations}</TableUntitled.Cell>
              <TableUntitled.Cell className="text-right">
                {Math.floor(agent.avgResponseTime / 60)}m {agent.avgResponseTime % 60}s
              </TableUntitled.Cell>
              <TableUntitled.Cell className="text-right">
                <BadgeUntitled
                  variant="outline"
                  className={
                    agent.satisfactionScore >= 90
                      ? 'border-green-500 text-green-700'
                      : agent.satisfactionScore >= 75
                      ? 'border-yellow-500 text-yellow-700'
                      : 'border-red-500 text-red-700'
                  }
                >
                  {agent.satisfactionScore}/100
                </BadgeUntitled>
              </TableUntitled.Cell>
              <TableUntitled.Cell className="text-right">{agent.onlineTime}h</TableUntitled.Cell>
              <TableUntitled.Cell className="text-right">
                <BadgeUntitled className="bg-green-100 text-green-800">Online</BadgeUntitled>
              </TableUntitled.Cell>
            </TableUntitled.Row>
          ))}
        </TableUntitled.Body>
      </TableUntitled>
    </div>
  );
}
