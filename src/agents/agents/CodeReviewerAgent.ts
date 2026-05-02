/**
 * Code Reviewer Agent
 * Validates code for errors, bugs, and best practices
 */

import type {
  AgentDefinition,
  AgentConfig,
  AgentContext,
  AgentExecutionResult,
} from '../types';
import { BaseAgent, agentFactory } from './BaseAgent';

// ============================================================================
// Code Review Types
// ============================================================================

interface CodeReviewResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface ReviewCompletionParams {
  taskType: string;
  taskResult: AgentExecutionResult;
  files?: string[];
  context?: AgentContext;
}

// ============================================================================
// Code Reviewer Agent Definition
// ============================================================================

const CODE_REVIEWER_DEFINITION: AgentDefinition = {
  id: 'code_reviewer',
  name: 'Code Reviewer',
  description: 'Validates code for errors and best practices',
  category: 'orchestrator',
  type: 'code_reviewer',
  capabilities: ['analysis'],
  dependencies: [],
  requiresModules: [],
  maxConcurrency: 5,
  timeout: 60000,
  isCore: true,
  icon: 'check-circle',
  color: 'bg-emerald-500',
};

// ============================================================================
// Code Reviewer Agent Class
// ============================================================================

export class CodeReviewerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(CODE_REVIEWER_DEFINITION, config);
  }

  /**
   * Execute code reviewer actions
   */
  protected async executeAction(
    action: string,
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<unknown> {
    switch (action) {
      case 'review_completion':
        return this.reviewCompletion(params as unknown as ReviewCompletionParams);

      case 'validate_syntax':
        return this.validateSyntax(params);

      case 'check_best_practices':
        return this.checkBestPractices(params);

      default:
        throw new Error(`Unknown code reviewer action: ${action}`);
    }
  }

  /**
   * Review a task completion for errors
   */
  private async reviewCompletion(params: ReviewCompletionParams): Promise<CodeReviewResult> {
    this.log('Reviewing task completion', { taskType: params.taskType });

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if task execution was successful
    if (params.taskResult.status === 'failed') {
      errors.push(`Task execution failed: ${params.taskResult.error || 'Unknown error'}`);
    }

    // Check for timeout
    if (params.taskResult.status === 'timeout') {
      errors.push(`Task execution timed out after ${params.taskResult.duration}ms`);
    }

    // Validate output structure
    if (!params.taskResult.output) {
      errors.push('Task output is missing');
    } else {
      // Check output success flag
      if (!params.taskResult.output.success) {
        errors.push(`Task output indicates failure: ${params.taskResult.output.error || 'No error message'}`);
      }

      // Check if data exists when expected
      if (params.taskResult.status === 'completed' && !params.taskResult.output.data) {
        warnings.push('Task completed but returned no data');
      }
    }

    // Task-specific validation based on agent type
    const taskTypeErrors = this.validateTaskType(params.taskType, params.taskResult);
    errors.push(...taskTypeErrors.errors);
    warnings.push(...taskTypeErrors.warnings);
    suggestions.push(...taskTypeErrors.suggestions);

    const valid = errors.length === 0;
    const result: CodeReviewResult = { valid, errors, warnings, suggestions };

    this.log('Review complete', result);
    return result;
  }

  /**
   * Validate syntax of code/content
   */
  private async validateSyntax(params: Record<string, unknown>): Promise<CodeReviewResult> {
    this.log('Validating syntax', params);

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const { code, language } = params;

    if (!code) {
      errors.push('No code provided for syntax validation');
      return { valid: false, errors, warnings, suggestions };
    }

    const codeString = String(code);

    // Basic syntax validation based on language
    switch (language) {
      case 'typescript':
      case 'javascript':
        // Check for common syntax errors
        if (codeString.includes('=>') && !codeString.match(/=>\s*{/)) {
          // Arrow function without braces might be intentional, but check for balanced braces
        }
        // Check for unbalanced brackets
        if (!this.areBracketsBalanced(codeString)) {
          errors.push('Unbalanced brackets detected');
        }
        break;

      case 'json':
        try {
          JSON.parse(codeString);
        } catch {
          errors.push('Invalid JSON syntax');
        }
        break;
    }

    const valid = errors.length === 0;
    return { valid, errors, warnings, suggestions };
  }

  /**
   * Check code against best practices
   */
  private async checkBestPractices(params: Record<string, unknown>): Promise<CodeReviewResult> {
    this.log('Checking best practices', params);

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const { code, language } = params;

    if (!code) {
      errors.push('No code provided for best practices check');
      return { valid: false, errors, warnings, suggestions };
    }

    const codeString = String(code);

    // TypeScript/JavaScript best practices
    if (language === 'typescript' || language === 'javascript') {
      // Check for console.log statements
      if (codeString.includes('console.log')) {
        warnings.push('Console.log statements should be removed in production code');
      }

      // Check for any type usage
      if (language === 'typescript' && codeString.includes(': any')) {
        warnings.push('Usage of "any" type should be avoided');
      }

      // Check for TODO comments
      if (codeString.includes('TODO') || codeString.includes('FIXME')) {
        suggestions.push('Consider addressing TODO/FIXME comments before completion');
      }
    }

    const valid = errors.length === 0;
    return { valid, errors, warnings, suggestions };
  }

  /**
   * Validate task-specific requirements
   */
  private validateTaskType(
    taskType: string,
    result: AgentExecutionResult
  ): CodeReviewResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    switch (taskType) {
      case 'crm':
        // CRM tasks should return contact/company data
        if (result.status === 'completed' && result.output?.data) {
          const data = result.output.data as Record<string, unknown>;
          if (!data.id && !Array.isArray(data)) {
            warnings.push('CRM operation completed but returned data may be missing ID field');
          }
        }
        break;

      case 'marketing':
        // Marketing tasks should return campaign/template data
        if (result.status === 'completed' && !result.output?.data) {
          warnings.push('Marketing operation completed but returned no data');
        }
        break;

      case 'analytics':
        // Analytics tasks should return metrics/insights
        if (result.status === 'completed' && result.output?.data) {
          const data = result.output.data as Record<string, unknown>;
          if (!data.metrics && !data.insights && !data.report) {
            suggestions.push('Analytics operation should return metrics, insights, or report');
          }
        }
        break;

      case 'builder':
        // Builder tasks should return layout/copy/variant data
        if (result.status === 'completed' && !result.output?.data) {
          warnings.push('Builder operation completed but returned no data');
        }
        break;

      case 'workflow':
        // Workflow tasks should return automation suggestions
        if (result.status === 'completed' && result.output?.data) {
          const data = result.output.data as Record<string, unknown>;
          if (!data.automation && !data.optimization && !data.workflow) {
            suggestions.push('Workflow operation should return automation, optimization, or workflow data');
          }
        }
        break;
    }

    return { valid: errors.length === 0, errors, warnings, suggestions };
  }

  /**
   * Check if brackets are balanced in code
   */
  private areBracketsBalanced(code: string): boolean {
    const stack: string[] = [];
    const pairs: Record<string, string> = {
      '}': '{',
      ']': '[',
      ')': '(',
    };

    for (const char of code) {
      if (char === '{' || char === '[' || char === '(') {
        stack.push(char);
      } else if (char === '}' || char === ']' || char === ')') {
        if (stack.length === 0 || stack.pop() !== pairs[char]) {
          return false;
        }
      }
    }

    return stack.length === 0;
  }

  /**
   * Validate input parameters
   */
  protected validateInput(action: string, params: Record<string, unknown>): void {
    super.validateInput(action, params);

    switch (action) {
      case 'review_completion':
        if (!params.taskType) {
          throw new Error('taskType is required for review_completion');
        }
        if (!params.taskResult) {
          throw new Error('taskResult is required for review_completion');
        }
        break;

      case 'validate_syntax':
      case 'check_best_practices':
        if (!params.code) {
          throw new Error('code is required for validation');
        }
        break;
    }
  }
}

// ============================================================================
// Register the Code Reviewer agent with the factory
// ============================================================================

agentFactory.register('code_reviewer', CODE_REVIEWER_DEFINITION, (config) => {
  return new CodeReviewerAgent(config);
});
