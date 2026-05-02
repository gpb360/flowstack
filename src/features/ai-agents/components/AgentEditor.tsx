import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Bot, Sparkles } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { useCreateAgent, useUpdateAgent, AGENT_CAPABILITIES, DEFAULT_CAPABILITIES, type AgentCreateInput } from '../hooks/useAgents';
import { useToast } from '@/components/ui/toast';

const AGENT_TYPE_OPTIONS = [
  { value: 'orchestrator', label: 'Orchestrator', color: '#8b5cf6' },
  { value: 'crm', label: 'CRM', color: '#3b82f6' },
  { value: 'marketing', label: 'Marketing', color: '#ec4899' },
  { value: 'analytics', label: 'Analytics', color: '#f59e0b' },
  { value: 'builder', label: 'Builder', color: '#10b981' },
  { value: 'workflow', label: 'Workflow', color: '#6366f1' },
  { value: 'custom', label: 'Custom', color: '#6b7280' },
] as const;

interface AgentEditorProps {
  agent?: {
    id: string;
    name: string;
    description: string | null;
    agent_type: string;
    capabilities: string[];
    system_prompt: string | null;
    icon: string;
    color: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const AgentEditor: React.FC<AgentEditorProps> = ({ agent, onClose, onSuccess }) => {
  const isEditing = !!agent;
  const { addToast } = useToast();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const [name, setName] = useState(agent?.name || '');
  const [description, setDescription] = useState(agent?.description || '');
  const [agentType, setAgentType] = useState<string>(agent?.agent_type || 'custom');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(agent?.capabilities || []);
  const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt || '');
  const [saving, setSaving] = useState(false);

  // Update default capabilities when type changes (only for new agents)
  useEffect(() => {
    if (!isEditing && DEFAULT_CAPABILITIES[agentType]) {
      setSelectedCapabilities(DEFAULT_CAPABILITIES[agentType]);
    }
  }, [agentType, isEditing]);

  const toggleCapability = (cap: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      addToast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const typeColor = AGENT_TYPE_OPTIONS.find((t) => t.value === agentType)?.color || '#6366f1';

      if (isEditing) {
        await updateAgent.mutateAsync({
          id: agent.id,
          name: name.trim(),
          description: description.trim() || undefined,
          agent_type: agentType as any,
          capabilities: selectedCapabilities,
          system_prompt: systemPrompt.trim() || undefined,
          color: typeColor,
        });
        addToast({ title: 'Agent updated', variant: 'success' });
      } else {
        const input: AgentCreateInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          agent_type: agentType as any,
          capabilities: selectedCapabilities,
          system_prompt: systemPrompt.trim() || undefined,
          color: typeColor,
        };
        await createAgent.mutateAsync(input);
        addToast({ title: 'Agent created', variant: 'success' });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({
        title: `Failed to ${isEditing ? 'update' : 'create'} agent`,
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const availableCapabilities = Object.entries(AGENT_CAPABILITIES).filter(
    ([, val]) => !val.agentTypes.length || val.agentTypes.includes(agentType)
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Agent' : 'Create Agent'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name *</label>
            <InputUntitled
              placeholder="e.g., Sales Assistant"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={2}
              placeholder="What does this agent do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Agent Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agent Type</label>
            <div className="grid grid-cols-4 gap-2">
              {AGENT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAgentType(opt.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    agentType === opt.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capabilities
              <span className="text-gray-400 font-normal ml-1">
                ({selectedCapabilities.length} selected)
              </span>
            </label>
            <div className="space-y-1">
              {availableCapabilities.map(([key, cap]) => (
                <button
                  key={key}
                  onClick={() => toggleCapability(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all flex items-center justify-between ${
                    selectedCapabilities.includes(key)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div>
                    <span className="font-medium text-gray-900">{cap.label}</span>
                    <span className="text-gray-500 ml-2">{cap.description}</span>
                  </div>
                  {selectedCapabilities.includes(key) && (
                    <span className="text-indigo-600 text-xs font-medium">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono"
              rows={6}
              placeholder="You are a helpful assistant that specializes in..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <ButtonUntitled variant="secondary" onClick={onClose}>
            Cancel
          </ButtonUntitled>
          <ButtonUntitled
            variant="primary"
            onClick={handleSave}
            disabled={!name.trim() || saving}
            leftIcon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Agent' : 'Create Agent'}
          </ButtonUntitled>
        </div>
      </div>
    </div>
  );
};
