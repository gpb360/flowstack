/**
 * Agent Context Provider
 * Provides agent state and management across the app (mirrors AuthContext.tsx pattern)
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type {
  AgentDefinition,
  AgentType,
  AgentExecutionResult,
  OrchestratorResult,
  AgentStatus,
} from '@/agents/types';
import {
  getAllAgentDefinitions,
} from '@/agents/registry';
import { useAuth } from './AuthContext';
import { useFeature, type ModuleId } from './FeatureContext';

// ============================================================================
// Types
// ============================================================================

interface AgentState {
  [key: string]: {
    status: AgentStatus;
    lastResult?: AgentExecutionResult;
    isExecuting: boolean;
  };
}

interface OrchestratorState {
  isRunning: boolean;
  currentResult?: OrchestratorResult;
}

interface AgentContextType {
  // Available agents
  agents: AgentDefinition[];
  agentsByType: Record<AgentType, AgentDefinition>;
  coreAgents: AgentDefinition[];
  availableAgents: AgentDefinition[];

  // Agent execution state
  agentStates: AgentState;
  isAnyAgentExecuting: boolean;

  // Orchestrator state
  orchestratorState: OrchestratorState;

  // Actions
  getAgent: (agentId: string) => AgentDefinition | undefined;
  getAgentsByCapability: (capability: string) => AgentDefinition[];
  isAgentAvailable: (agentId: string) => boolean;
  refreshAgents: () => void;

  // State updates (called by hooks/services)
  setAgentState: (agentId: string, state: Partial<AgentState[string]>) => void;
  setOrchestratorState: (state: Partial<OrchestratorState>) => void;
}

// ============================================================================
// Context
// ============================================================================

const AgentContext = createContext<AgentContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AgentProviderProps {
  children: ReactNode;
}

export function AgentProvider({ children }: AgentProviderProps) {
  const { currentOrganization } = useAuth();
  const { isModuleEnabled } = useFeature();

  // Available agents (filtered by enabled modules)
  const [availableAgents, setAvailableAgents] = useState<AgentDefinition[]>([]);

  // Agent execution states
  const [agentStates, setAgentStates] = useState<AgentState>({});
  const [orchestratorState, setOrchestratorState] = useState<OrchestratorState>({
    isRunning: false,
  });

  // Refresh available agents based on enabled modules
  const refreshAgents = useCallback(() => {
    const allAgents = getAllAgentDefinitions();
    const available = allAgents.filter(agent => {
      if (agent.isCore) return true;
      if (!agent.requiresModules) return true;
      return agent.requiresModules.every(modId => isModuleEnabled(modId as ModuleId));
    });
    setAvailableAgents(available);
  }, [isModuleEnabled]);

  // Refresh agents when modules or organization changes
  useEffect(() => {
    refreshAgents();
  }, [refreshAgents, currentOrganization]);

  // Get all agent definitions
  const agents = getAllAgentDefinitions();

  // Group agents by type
  const agentsByType = agents.reduce((acc, agent) => {
    acc[agent.type] = agent;
    return acc;
  }, {} as Record<AgentType, AgentDefinition>);

  // Core agents (cannot be disabled)
  const coreAgents = agents.filter(agent => agent.isCore);

  // Check if any agent is executing
  const isAnyAgentExecuting = Object.values(agentStates).some(state => state.isExecuting);

  // Get a specific agent by ID
  const getAgent = useCallback((agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  }, [agents]);

  // Get agents by capability
  const getAgentsByCapability = useCallback((capability: string) => {
    return agents.filter(agent => agent.capabilities.includes(capability as any));
  }, [agents]);

  // Check if an agent is available
  const isAgentAvailable = useCallback((agentId: string) => {
    return availableAgents.some(agent => agent.id === agentId);
  }, [availableAgents]);

  // Update agent state
  const setAgentState = useCallback((agentId: string, state: Partial<AgentState[string]>) => {
    setAgentStates(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        ...state,
      },
    }));
  }, []);

  // Update orchestrator state
  const setOrchestratorStateCallback = useCallback((state: Partial<OrchestratorState>) => {
    setOrchestratorState(prev => ({ ...prev, ...state }));
  }, []);

  const value: AgentContextType = {
    // Available agents
    agents,
    agentsByType,
    coreAgents,
    availableAgents,

    // Agent execution state
    agentStates,
    isAnyAgentExecuting,

    // Orchestrator state
    orchestratorState,

    // Actions
    getAgent,
    getAgentsByCapability,
    isAgentAvailable,
    refreshAgents,

    // State updates
    setAgentState,
    setOrchestratorState: setOrchestratorStateCallback,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access agent context
 * Throws an error if used outside of AgentProvider
 */
export function useAgents(): AgentContextType {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Hook to get a specific agent by ID
 */
export function useAgent(agentId: string) {
  const { getAgent, isAgentAvailable, agentStates } = useAgents();
  const agent = getAgent(agentId);
  const state = agentStates[agentId];

  return {
    agent,
    isAvailable: agent ? isAgentAvailable(agent.id) : false,
    state,
  };
}

/**
 * Hook to get agents by type
 */
export function useAgentsByType(types: AgentType[]) {
  const { availableAgents } = useAgents();
  return availableAgents.filter(agent => types.includes(agent.type));
}

/**
 * Hook to get agents by capability
 */
export function useAgentsByCapability(capability: string) {
  const { getAgentsByCapability, isAgentAvailable } = useAgents();
  const agents = getAgentsByCapability(capability);
  return agents.filter(agent => isAgentAvailable(agent.id));
}

/**
 * Hook to check if any agent is executing
 */
export function useAgentExecution() {
  const { isAnyAgentExecuting, agentStates } = useAgents();
  return {
    isExecuting: isAnyAgentExecuting,
    agentStates,
  };
}

/**
 * Hook to access orchestrator state
 */
export function useOrchestrator() {
  const { orchestratorState, setOrchestratorState } = useAgents();
  return {
    ...orchestratorState,
    setState: setOrchestratorState,
  };
}
