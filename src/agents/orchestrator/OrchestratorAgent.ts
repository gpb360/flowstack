/**
 * Orchestrator Agent
 * Central coordinator that delegates tasks to specialized agents
 */

import type {
  AgentDefinition,
  AgentInput,
  AgentConfig,
  AgentContext,
  AgentExecutionResult,
  OrchestratorWorkflow,
  OrchestratorResult,
} from '../types';
import type { RalphLoopConfig } from './types';
import { BaseAgent, agentFactory } from '../agents/BaseAgent';
import { SequentialExecutor } from './execution/SequentialExecutor';
import { ParallelExecutor } from './execution/ParallelExecutor';

// ============================================================================
// Orchestrator Agent Definition
// ============================================================================

const ORCHESTRATOR_DEFINITION: AgentDefinition = {
  id: 'orchestrator',
  name: 'Orchestrator',
  description: 'Coordinates multiple agents to complete complex tasks',
  category: 'orchestrator',
  type: 'orchestrator',
  capabilities: ['coordination', 'automation'],
  dependencies: [],
  requiresModules: ['workflows'],
  maxConcurrency: 10,
  timeout: 300000,
  isCore: true,
  icon: 'workflow',
  color: 'bg-rose-500',
};

// ============================================================================
// Orchestrator Agent Class
// ============================================================================

export class OrchestratorAgent extends BaseAgent {
  // Default Ralph loop configuration
  private readonly defaultRalphConfig: RalphLoopConfig = {
    enabled: true,
    maxRetries: 5,
    validationAgent: 'code_reviewer',
    retryDelay: 1000,
    onValidationFailure: 'retry',
  };

  constructor(config: AgentConfig) {
    super(ORCHESTRATOR_DEFINITION, config);
  }

  /**
   * Execute orchestrator-specific actions
   */
  protected async executeAction(
    action: string,
    params: Record<string, unknown>,
    context: AgentContext
  ): Promise<unknown> {
    switch (action) {
      case 'orchestrate':
        return this.orchestrate(params.workflow as OrchestratorWorkflow, context);

      case 'orchestrate_with_ralph_loop':
        return this.orchestrateWithRalphLoop(
          params.workflow as OrchestratorWorkflow,
          context,
          params.ralphConfig as Partial<RalphLoopConfig>
        );

      case 'execute_sequential':
        return this.executeSequential(
          params.tasks as unknown[],
          params.stopOnError as boolean ?? true,
          context
        );

      case 'execute_parallel':
        return this.executeParallel(
          params.tasks as unknown[],
          params.maxConcurrency as number ?? 5,
          context
        );

      case 'route_by_intent':
        return this.routeByIntent(
          params.intent as string,
          params.input as Record<string, unknown>,
          context
        );

      default:
        throw new Error(`Unknown orchestrator action: ${action}`);
    }
  }

  /**
   * Orchestrate a complete workflow
   */
  private async orchestrate(
    workflow: OrchestratorWorkflow,
    context: AgentContext
  ): Promise<OrchestratorResult> {
    const startTime = Date.now();

    this.log(`Starting orchestration of workflow: ${workflow.name}`);

    // Create execution context
    const executionContext: AgentContext = {
      ...context,
      workflowExecutionId: workflow.id,
    };

    // Determine Ralph loop configuration
    const ralphConfig = workflow.ralphLoopConfig || (workflow.enableRalphLoop ? this.defaultRalphConfig : undefined);

    // Execute based on strategy
    let result: Map<string, AgentExecutionResult>;
    let errors: Array<{ taskId: string; error: string }>;
    let success = true;

    switch (workflow.strategy) {
      case 'sequential':
        ({ results: result, errors, success } = await this.executeSequentialInternal(
          workflow.tasks,
          workflow.onError !== 'continue',
          executionContext,
          ralphConfig
        ));
        break;

      case 'parallel':
        ({ results: result, errors, success } = await this.executeParallelInternal(
          workflow.tasks,
          this.definition.maxConcurrency ?? 10,
          workflow.onError !== 'continue',
          executionContext,
          ralphConfig
        ));
        break;

      case 'conditional':
        // For conditional, we execute based on conditions in each task
        ({ results: result, errors, success } = await this.executeSequentialInternal(
          workflow.tasks,
          workflow.onError !== 'continue',
          executionContext,
          ralphConfig
        ));
        break;

      default:
        throw new Error(`Unknown execution strategy: ${workflow.strategy}`);
    }

    const endTime = Date.now();

    return {
      workflowId: workflow.id,
      status: success ? 'completed' : 'failed',
      results: result,
      errors,
      startTime,
      endTime,
      duration: endTime - startTime,
    };
  }

  /**
   * Orchestrate a workflow with Ralph loop enabled
   */
  private async orchestrateWithRalphLoop(
    workflow: OrchestratorWorkflow,
    context: AgentContext,
    ralphConfig?: Partial<RalphLoopConfig>
  ): Promise<OrchestratorResult> {
    this.log('Orchestrating with Ralph loop enabled');

    // Merge Ralph loop configuration
    const mergedRalphConfig: RalphLoopConfig = {
      ...this.defaultRalphConfig,
      ...ralphConfig,
      enabled: true,
    };

    // Create workflow with Ralph loop enabled
    const workflowWithRalph: OrchestratorWorkflow = {
      ...workflow,
      ralphLoopConfig: mergedRalphConfig,
    };

    return this.orchestrate(workflowWithRalph, context);
  }

  /**
   * Execute tasks sequentially
   */
  private async executeSequential(
    tasks: unknown[],
    stopOnError: boolean,
    context: AgentContext
  ): Promise<OrchestratorResult> {
    const workflow: OrchestratorWorkflow = {
      id: `adhoc-${Date.now()}`,
      name: 'Ad-hoc Sequential Workflow',
      strategy: 'sequential',
      tasks: tasks as any,
      onError: stopOnError ? 'stop' : 'continue',
    };

    return this.orchestrate(workflow, context);
  }

  /**
   * Internal sequential execution
   */
  private async executeSequentialInternal(
    tasks: any[],
    stopOnError: boolean,
    context: AgentContext,
    ralphConfig?: RalphLoopConfig
  ): Promise<{
    results: Map<string, AgentExecutionResult>;
    errors: Array<{ taskId: string; error: string }>;
    success: boolean;
  }> {
    const executor = new SequentialExecutor({
      tasks,
      stopOnError,
      maxRetries: this.config.retryMax ?? 3,
      context,
      ralphLoopConfig: ralphConfig,
    });

    return executor.execute();
  }

  /**
   * Execute tasks in parallel
   */
  private async executeParallel(
    tasks: unknown[],
    maxConcurrency: number,
    context: AgentContext
  ): Promise<OrchestratorResult> {
    const workflow: OrchestratorWorkflow = {
      id: `adhoc-${Date.now()}`,
      name: 'Ad-hoc Parallel Workflow',
      strategy: 'parallel',
      tasks: tasks as any,
      onError: 'continue',
    };

    const executor = new ParallelExecutor({
      tasks: tasks as any,
      maxConcurrency,
      stopOnError: false,
      maxRetries: this.config.retryMax ?? 3,
      context,
    });

    const startTime = Date.now();
    const { results, errors, success } = await executor.execute();
    const endTime = Date.now();

    return {
      workflowId: workflow.id,
      status: success ? 'completed' : 'failed',
      results,
      errors,
      startTime,
      endTime,
      duration: endTime - startTime,
    };
  }

  /**
   * Internal parallel execution
   */
  private async executeParallelInternal(
    tasks: any[],
    maxConcurrency: number,
    stopOnError: boolean,
    context: AgentContext,
    ralphConfig?: RalphLoopConfig
  ): Promise<{
    results: Map<string, AgentExecutionResult>;
    errors: Array<{ taskId: string; error: string }>;
    success: boolean;
  }> {
    const executor = new ParallelExecutor({
      tasks,
      maxConcurrency,
      stopOnError,
      maxRetries: this.config.retryMax ?? 3,
      context,
      ralphLoopConfig: ralphConfig,
    });

    return executor.execute();
  }

  /**
   * Route a task to the appropriate agent based on intent
   */
  private async routeByIntent(
    intent: string,
    input: Record<string, unknown>,
    context: AgentContext
  ): Promise<unknown> {
    this.log(`Routing by intent: ${intent}`);

    // Determine which agent should handle this intent
    const agentType = this.determineAgentFromIntent(intent);

    if (!agentType) {
      throw new Error(`No agent found for intent: ${intent}`);
    }

    // Create and execute the appropriate agent
    const agentConfig = {
      organizationId: context.organizationId,
      userId: context.userId,
      timeout: this.config.timeout,
      retryMax: this.config.retryMax,
    };

    const agent = agentFactory.create(agentType, agentConfig);
    if (!agent) {
      throw new Error(`Failed to create agent of type: ${agentType}`);
    }

    const agentInput: AgentInput = {
      action: intent,
      params: input,
      context,
    };

    const result = await agent.execute(agentInput);
    return result.output?.data;
  }

  /**
   * Determine which agent should handle an intent
   */
  private determineAgentFromIntent(intent: string): string | null {
    // Intent to agent mapping
    const intentMap: Record<string, string> = {
      // CRM intents
      'find_contact': 'crm',
      'create_contact': 'crm',
      'update_contact': 'crm',
      'enrich_contact': 'crm',
      'score_lead': 'crm',
      'detect_duplicates': 'crm',
      'suggest_next_action': 'crm',

      // Marketing intents
      'generate_campaign': 'marketing',
      'segment_audience': 'marketing',
      'optimize_send_time': 'marketing',
      'analyze_performance': 'marketing',
      'generate_template': 'marketing',
      'personalize_content': 'marketing',

      // Analytics intents
      'generate_report': 'analytics',
      'detect_trends': 'analytics',
      'forecast_metrics': 'analytics',
      'anomaly_detection': 'analytics',
      'create_dashboard': 'analytics',

      // Builder intents
      'suggest_layout': 'builder',
      'generate_copy': 'builder',
      'optimize_conversion': 'builder',
      'create_variant': 'builder',
      'builder_analyze_performance': 'builder',

      // Workflow intents
      'suggest_automation': 'workflow',
      'optimize_workflow': 'workflow',
      'detect_bottlenecks': 'workflow',
      'generate_workflow': 'workflow',
    };

    return intentMap[intent] ?? null;
  }

  /**
   * Validate input parameters
   */
  protected validateInput(action: string, params: Record<string, unknown>): void {
    super.validateInput(action, params);

    switch (action) {
      case 'orchestrate':
      case 'orchestrate_with_ralph_loop':
        if (!params.workflow || typeof params.workflow !== 'object') {
          throw new Error('workflow parameter is required for orchestrate action');
        }
        break;

      case 'execute_sequential':
      case 'execute_parallel':
        if (!params.tasks || !Array.isArray(params.tasks)) {
          throw new Error('tasks parameter is required for execute actions');
        }
        break;

      case 'route_by_intent':
        if (!params.intent || typeof params.intent !== 'string') {
          throw new Error('intent parameter is required for route_by_intent action');
        }
        break;
    }
  }
}

// ============================================================================
// Register the orchestrator agent with the factory
// ============================================================================

agentFactory.register('orchestrator', ORCHESTRATOR_DEFINITION, (config) => {
  return new OrchestratorAgent(config);
});
