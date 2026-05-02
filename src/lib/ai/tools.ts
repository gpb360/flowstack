/**
 * Tool capability mapping and filtering
 * Maps agent capability strings to Tool objects from the registry
 */

import { TOOL_REGISTRY } from './commands';
import type { Tool } from './types';

/**
 * Maps each agent capability key to the tool names it grants access to.
 * Tool names must exist in TOOL_REGISTRY.
 */
export const CAPABILITY_TOOL_MAP: Record<string, string[]> = {
  'crm:read_contacts':       ['find_contacts', 'get_current_user', 'search'],
  'crm:read_companies':      ['find_contacts', 'search'],
  'crm:create_contact':      ['create_contact'],
  'crm:update_contact':      ['update_contact'],
  'workflow:trigger':        ['trigger_workflow', 'create_workflow'],
  'workflow:read_status':    ['get_workflow_status'],
  'email:send':              ['send_email'],   // tool registered in S03
  'email:read':              [],
  'marketing:read_campaigns':['generate_report', 'search'],
  'marketing:create_campaign':['create_campaign', 'save_template'],
  'analytics:read':          ['get_metrics', 'generate_report'],
  'analytics:report':        ['generate_report'],
  'builder:read_pages':      [],               // tool deferred
  'builder:edit_pages':      [],               // tool deferred
  'github:read_repos':       [],               // tool deferred (M008)
  'chat:respond':            ['search', 'get_current_user', 'get_metrics'],
};

/**
 * Returns the deduplicated set of Tool objects an agent is allowed to use,
 * based on its configured capabilities[].
 *
 * If capabilities is empty (e.g. a freshly created custom agent), falls back
 * to returning all tools so the agent is still usable before capabilities
 * are configured.
 *
 * Unknown capability keys are silently skipped (forward-compatible).
 * Tool names that don't exist in TOOL_REGISTRY are silently skipped.
 */
export function getToolsForCapabilities(capabilities: string[]): Tool[] {
  if (capabilities.length === 0) {
    return Object.values(TOOL_REGISTRY);
  }

  const toolNames = new Set<string>();
  for (const cap of capabilities) {
    const names = CAPABILITY_TOOL_MAP[cap];
    if (names) {
      for (const name of names) {
        toolNames.add(name);
      }
    }
  }

  const tools: Tool[] = [];
  for (const name of toolNames) {
    const tool = TOOL_REGISTRY[name];
    if (tool) {
      tools.push(tool);
    }
  }

  return tools;
}

/**
 * Returns a human-readable summary of what an agent can do, for injecting
 * into the system prompt so Claude knows its own capabilities.
 */
export function formatCapabilitySummary(capabilities: string[], tools: Tool[]): string {
  if (tools.length === 0) {
    return 'You have no tools available in this conversation.';
  }

  const lines = tools.map(t => `- ${t.name}: ${t.description}`);
  return `You have access to the following tools:\n${lines.join('\n')}`;
}
