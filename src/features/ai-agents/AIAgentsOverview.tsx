/**
 * AI Agents Overview Page
 * Dashboard showing all AI agents with CRUD capabilities
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Plus, MoreVertical, Trash2, Edit, Sparkles, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { useAgents, useDeleteAgent, AGENT_CAPABILITIES } from './hooks/useAgents';
import { AgentEditor } from './components/AgentEditor';
import { useToast } from '@/components/ui/toast';
import type { Agent } from './hooks/useAgents';

const TYPE_ICONS: Record<string, string> = {
  orchestrator: '🧠',
  crm: '👥',
  marketing: '📧',
  analytics: '📊',
  builder: '🏗️',
  workflow: '⚡',
  custom: '🤖',
};

export function AIAgentsOverview() {
  const navigate = useNavigate();
  const { data: agents, isLoading } = useAgents();
  const deleteAgent = useDeleteAgent();
  const { addToast } = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeAgents = agents?.filter((a) => a.is_active).length || 0;
  const totalCapabilities = agents?.reduce((sum, a) => sum + (a.capabilities?.length || 0), 0) || 0;

  const handleCreate = () => {
    setEditingAgent(undefined);
    setEditorOpen(true);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAgent.mutateAsync(deleteId);
      addToast({ title: 'Agent deleted', variant: 'success' });
    } catch (err: any) {
      addToast({
        title: 'Failed to delete agent',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Total Agents</span>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{agents?.length || 0}</div>
          <div className="text-xs text-text-muted mt-1">{activeAgents} active</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Capabilities Configured</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{totalCapabilities}</div>
          <div className="text-xs text-text-muted mt-1">Across all agents</div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">Agent Types</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">
            {new Set(agents?.map((a) => a.agent_type)).size || 0}
          </div>
          <div className="text-xs text-text-muted mt-1">Unique types</div>
        </div>
      </div>

      {/* Agents Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Agents</h2>
        <ButtonUntitled variant="primary" onClick={handleCreate}>
          <Plus size={16} className="mr-2" />
          Create Agent
        </ButtonUntitled>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-500">Loading agents...</div>
        </div>
      ) : !agents?.length ? (
        <EmptyStateUntitled
          title="No agents yet"
          description="Create your first AI agent to get started with automation"
          action={
            <ButtonUntitled variant="primary" onClick={handleCreate}>
              <Plus size={16} className="mr-2" />
              Create Agent
            </ButtonUntitled>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const capabilityLabels = (agent.capabilities || [])
              .map((cap) => AGENT_CAPABILITIES[cap]?.label || cap);

            return (
              <div
                key={agent.id}
                className={`bg-surface border rounded-lg p-5 hover:border-primary/50 transition-colors ${
                  agent.is_active ? 'border-border' : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      {TYPE_ICONS[agent.agent_type] || '🤖'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{agent.name}</h3>
                      <BadgeUntitled variant="neutral" size="sm">
                        {agent.agent_type}
                      </BadgeUntitled>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 hover:bg-gray-100 rounded-md">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(agent)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(agent.id)} className="text-red-600">
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {agent.description && (
                  <p className="text-sm text-text-muted mb-4 line-clamp-2">{agent.description}</p>
                )}

                {capabilityLabels.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-text-muted uppercase font-medium mb-2">Capabilities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {capabilityLabels.slice(0, 5).map((label) => (
                        <BadgeUntitled key={label} variant="neutral" size="sm">
                          {label}
                        </BadgeUntitled>
                      ))}
                      {capabilityLabels.length > 5 && (
                        <BadgeUntitled variant="neutral" size="sm">
                          +{capabilityLabels.length - 5} more
                        </BadgeUntitled>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      {agent.is_active ? (
                        <>
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-green-600 font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-gray-500">Inactive</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/dashboard/ai-agents/${agent.id}/chat`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-xs font-medium transition-colors"
                    >
                      <MessageSquare size={12} />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Getting Started with AI Agents</h3>
            <p className="text-text-muted mb-4">
              Create AI agents with specific capabilities, then use them in workflows to automate tasks
              like managing contacts, sending emails, and analyzing data.
            </p>
            <div className="flex gap-3">
              <ButtonUntitled variant="primary" onClick={handleCreate}>
                Create Your First Agent
              </ButtonUntitled>
              <ButtonUntitled variant="secondary" onClick={() => navigate('/dashboard/ai-agents/chat')}>
                Open Chat
              </ButtonUntitled>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Editor Slide-over */}
      {editorOpen && (
        <AgentEditor
          agent={editingAgent}
          onClose={() => setEditorOpen(false)}
          onSuccess={() => {}}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any workflows using this agent will need to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
