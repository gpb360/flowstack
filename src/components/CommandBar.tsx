/**
 * Command Bar Component
 * Global command palette with keyboard shortcut (Cmd+K / Ctrl+K)
 * Features fuzzy search, AI-powered suggestions, and quick actions
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command as IconCommand, FileText, Users, Mail, Workflow, BarChart3, Zap, Sparkles, Home } from 'lucide-react';
import { useAIContext } from '../lib/ai/context';
import type { Command, CommandCategory } from '../lib/ai/types';
import { getAIClient } from '../lib/ai/client';
import { cn } from '../lib/utils';

// ============================================================================
// Command Registry
// ============================================================================

const COMMAND_ICONS = {
  navigation: Home,
  action: Zap,
  search: Search,
  ai: Sparkles,
};

/**
 * All available commands in the system
 */
const COMMANDS: Command[] = [
  // Navigation Commands
  {
    id: 'nav-dashboard',
    label: 'Go to Dashboard',
    description: 'Navigate to the main dashboard',
    category: 'navigation',
    icon: 'LayoutDashboard',
    shortcut: 'g then d',
    keywords: ['dashboard', 'home', 'overview'],
    action: () => {},
  },
  {
    id: 'nav-crm',
    label: 'Go to CRM',
    description: 'Navigate to contacts and companies',
    category: 'navigation',
    icon: 'Users',
    shortcut: 'g then c',
    keywords: ['crm', 'contacts', 'customers'],
    module: 'crm',
    action: () => {},
  },
  {
    id: 'nav-workflows',
    label: 'Go to Workflows',
    description: 'Navigate to workflow automations',
    category: 'navigation',
    icon: 'Workflow',
    shortcut: 'g then w',
    keywords: ['workflow', 'automation', 'automate'],
    module: 'workflows',
    action: () => {},
  },
  {
    id: 'nav-marketing',
    label: 'Go to Marketing',
    description: 'Navigate to campaigns and templates',
    category: 'navigation',
    icon: 'Mail',
    shortcut: 'g then m',
    keywords: ['marketing', 'campaigns', 'email'],
    action: () => {},
  },
  {
    id: 'nav-sites',
    label: 'Go to Site Builder',
    description: 'Navigate to page and funnel builder',
    category: 'navigation',
    icon: 'Globe',
    shortcut: 'g then s',
    keywords: ['sites', 'builder', 'pages', 'funnels'],
    module: 'site_builder',
    action: () => {},
  },

  // Action Commands
  {
    id: 'action-new-contact',
    label: 'Create New Contact',
    description: 'Add a new contact to CRM',
    category: 'action',
    icon: 'UserPlus',
    keywords: ['create', 'new', 'contact', 'add'],
    module: 'crm',
    requiresPermission: ['write'],
    action: () => {},
  },
  {
    id: 'action-new-company',
    label: 'Create New Company',
    description: 'Add a new company to CRM',
    category: 'action',
    icon: 'Building',
    keywords: ['create', 'new', 'company', 'business'],
    module: 'crm',
    requiresPermission: ['write'],
    action: () => {},
  },
  {
    id: 'action-new-workflow',
    label: 'Create New Workflow',
    description: 'Build a new workflow automation',
    category: 'action',
    icon: 'Workflow',
    keywords: ['create', 'new', 'workflow', 'automation'],
    module: 'workflows',
    requiresPermission: ['write'],
    action: () => {},
  },
  {
    id: 'action-new-campaign',
    label: 'Create New Campaign',
    description: 'Launch a new marketing campaign',
    category: 'action',
    icon: 'Mail',
    keywords: ['create', 'new', 'campaign', 'marketing'],
    requiresPermission: ['write'],
    action: () => {},
  },
  {
    id: 'action-new-template',
    label: 'Create Email Template',
    description: 'Design a new email template',
    category: 'action',
    icon: 'FileText',
    keywords: ['create', 'new', 'template', 'email'],
    requiresPermission: ['write'],
    action: () => {},
  },

  // Search Commands
  {
    id: 'search-contacts',
    label: 'Search Contacts',
    description: 'Find contacts by name or email',
    category: 'search',
    icon: 'Search',
    keywords: ['search', 'find', 'contacts', 'lookup'],
    module: 'crm',
    action: () => {},
  },
  {
    id: 'search-companies',
    label: 'Search Companies',
    description: 'Find companies by name',
    category: 'search',
    icon: 'Search',
    keywords: ['search', 'find', 'companies', 'business'],
    module: 'crm',
    action: () => {},
  },
  {
    id: 'search-workflows',
    label: 'Search Workflows',
    description: 'Find workflow automations',
    category: 'search',
    icon: 'Search',
    keywords: ['search', 'find', 'workflows'],
    module: 'workflows',
    action: () => {},
  },

  // AI Commands
  {
    id: 'ai-ask',
    label: 'Ask AI Assistant',
    description: 'Get help with any task',
    category: 'ai',
    icon: 'Sparkles',
    keywords: ['ai', 'ask', 'help', 'assistant', 'chat'],
    action: () => {},
  },
  {
    id: 'ai-generate',
    label: 'Generate Content',
    description: 'AI-powered content generation',
    category: 'ai',
    icon: 'Sparkles',
    keywords: ['ai', 'generate', 'create', 'write', 'content'],
    action: () => {},
  },
  {
    id: 'ai-suggest',
    label: 'Get Suggestions',
    description: 'AI suggestions for next actions',
    category: 'ai',
    icon: 'Lightbulb',
    keywords: ['ai', 'suggest', 'recommend', 'ideas'],
    action: () => {},
  },
  {
    id: 'ai-analyze',
    label: 'Analyze Data',
    description: 'AI-powered data analysis',
    category: 'ai',
    icon: 'BarChart3',
    keywords: ['ai', 'analyze', 'analytics', 'insights', 'data'],
    action: () => {},
  },
];

// ============================================================================
// Command Bar Component
// ============================================================================

interface CommandBarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandBar({ open: controlledOpen, onOpenChange }: CommandBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>(COMMANDS);
  const [aiSuggestions, setAiSuggestions] = useState<Command[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { context } = useAIContext();

  // Use controlled or uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = onOpenChange || setOpen;

  /**
   * Filter commands based on query
   */
  const filterCommands = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        return COMMANDS;
      }

      const queryLower = searchQuery.toLowerCase();
      const filtered = COMMANDS.filter(cmd => {
        const matchesLabel = cmd.label.toLowerCase().includes(queryLower);
        const matchesDescription = cmd.description.toLowerCase().includes(queryLower);
        const matchesKeywords = cmd.keywords?.some(kw => kw.toLowerCase().includes(queryLower));

        return matchesLabel || matchesDescription || matchesKeywords;
      });

      return filtered;
    },
    []
  );

  /**
   * Get AI-powered command suggestions
   */
  const getAISuggestions = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !context) {
        setAiSuggestions([]);
        return;
      }

      setIsAiThinking(true);

      try {
        const client = getAIClient();

        const systemPrompt = `You are a command suggestion engine for FlowStack.
Given a user query, suggest the most relevant commands from the available options.
Respond with a JSON array of command IDs, ranked by relevance.`;

        const commandsList = COMMANDS.map(c => `- ${c.id}: ${c.label} (${c.description})`).join('\n');

        const response = await client.complete({
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: `Available commands:\n${commandsList}\n\nUser query: "${searchQuery}"\n\nRespond with only the 3 most relevant command IDs as a JSON array.`,
            },
          ],
          maxTokens: 100,
        });

        // Parse AI response
        const suggestedIds = JSON.parse(response.content) as string[];

        const suggestions = suggestedIds
          .map(id => COMMANDS.find(c => c.id === id))
          .filter((c): c is Command => c !== undefined);

        setAiSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to get AI suggestions:', error);
        setAiSuggestions([]);
      } finally {
        setIsAiThinking(false);
      }
    },
    [context]
  );

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open command bar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  /**
   * Filter commands when query changes
   */
  useEffect(() => {
    const filtered = filterCommands(query);
    setFilteredCommands(filtered);
    setSelectedIndex(0);

    // Get AI suggestions for longer queries
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        getAISuggestions(query);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setAiSuggestions([]);
    }
  }, [query, filterCommands, getAISuggestions]);

  /**
   * Focus input when opened
   */
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  /**
   * Handle command execution
   */
  const executeCommand = useCallback(
    async (command: Command) => {
      setIsOpen(false);
      setQuery('');

      // Check permissions
      if (command.requiresPermission && context) {
        const hasPermission = command.requiresPermission.every(p => context.permissions.includes(p));
        if (!hasPermission) {
          console.warn('Insufficient permissions for command:', command.id);
          return;
        }
      }

      // Execute based on command type
      switch (command.category) {
        case 'navigation':
          if (command.id === 'nav-dashboard') navigate('/');
          else if (command.id === 'nav-crm') navigate('/crm/contacts');
          else if (command.id === 'nav-workflows') navigate('/workflows');
          else if (command.id === 'nav-marketing') navigate('/marketing/campaigns');
          else if (command.id === 'nav-sites') navigate('/sites');
          break;

        case 'action':
          if (command.id === 'action-new-contact') navigate('/crm/contacts?action=new');
          else if (command.id === 'action-new-company') navigate('/crm/companies?action=new');
          else if (command.id === 'action-new-workflow') navigate('/workflows/new');
          else if (command.id === 'action-new-campaign') navigate('/marketing/campaigns/new');
          else if (command.id === 'action-new-template') navigate('/marketing/templates/new');
          break;

        case 'search':
          // Open search with query
          const searchParams = new URLSearchParams({ q: query });
          if (command.id === 'search-contacts') navigate(`/crm/contacts?${searchParams}`);
          else if (command.id === 'search-companies') navigate(`/crm/companies?${searchParams}`);
          else if (command.id === 'search-workflows') navigate(`/workflows?${searchParams}`);
          break;

        case 'ai':
          // AI commands - emit event for AI handler
          window.dispatchEvent(
            new CustomEvent('ai-command', {
              detail: { command: command.id, query },
            })
          );
          break;
      }
    },
    [navigate, query, context, setIsOpen]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const commandsToUse = aiSuggestions.length > 0 ? aiSuggestions : filteredCommands;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % commandsToUse.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + commandsToUse.length) % commandsToUse.length);
    } else if (e.key === 'Enter' && commandsToUse.length > 0) {
      e.preventDefault();
      executeCommand(commandsToUse[selectedIndex]);
    }
  };

  /**
   * Render command icon
   */
  const renderIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      LayoutDashboard: Home,
      Users: Users,
      Workflow: Workflow,
      Mail: Mail,
      Globe: IconCommand,
      UserPlus: Users,
      Building: BarChart3,
      Search: Search,
      Sparkles: Sparkles,
      Lightbulb: Zap,
      FileText: FileText,
      BarChart3: BarChart3,
      Zap: Zap,
    };

    const Icon = iconMap[iconName] || Sparkles;
    return <Icon className="w-5 h-5" />;
  };

  const IconComponent = COMMAND_ICONS.navigation;

  if (!isOpen) return null;

  const commandsToShow = aiSuggestions.length > 0 ? aiSuggestions : filteredCommands;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Command Bar */}
      <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50">
        <div className="w-full max-w-xl bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted"
              autoComplete="off"
            />
            <kbd className="px-2 py-1 text-xs bg-surface-hover rounded border border-border text-text-muted">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {/* AI Suggestions Section */}
            {aiSuggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-text-muted">
                  <Sparkles className="w-3 h-3" />
                  AI Suggestions
                </div>
                {aiSuggestions.map((command, idx) => (
                  <button
                    key={command.id}
                    onClick={() => executeCommand(command)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors',
                      idx === selectedIndex
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-surface-hover text-text-primary'
                    )}
                  >
                    <div className="p-1 bg-primary/10 rounded">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{command.label}</div>
                      <div className="text-xs text-text-muted">{command.description}</div>
                    </div>
                    {command.shortcut && (
                      <kbd className="px-2 py-1 text-xs bg-surface-hover rounded border border-border text-text-muted">
                        {command.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* All Commands */}
            {Object.entries(
              commandsToShow.reduce((acc, cmd) => {
                if (!acc[cmd.category]) acc[cmd.category] = [];
                acc[cmd.category].push(cmd);
                return acc;
              }, {} as Record<CommandCategory, Command[]>)
            ).map(([category, commands]) => (
              <div key={category} className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-text-muted capitalize">
                  {category === 'ai' ? <Sparkles className="w-3 h-3" /> : <IconComponent className="w-3 h-3" />}
                  {category}
                </div>
                {commands.map((command, _idx) => {
                  const actualIndex = commandsToShow.indexOf(command);
                  return (
                    <button
                      key={command.id}
                      onClick={() => executeCommand(command)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors',
                        actualIndex === selectedIndex
                          ? 'bg-primary/20 text-primary'
                          : 'hover:bg-surface-hover text-text-primary'
                      )}
                    >
                      {command.icon && (
                        <div className="p-1 bg-surface-hover rounded text-text-secondary">
                          {renderIcon(command.icon)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{command.label}</div>
                        <div className="text-xs text-text-muted">{command.description}</div>
                      </div>
                      {command.shortcut && (
                        <kbd className="px-2 py-1 text-xs bg-surface-hover rounded border border-border text-text-muted">
                          {command.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* No results */}
            {commandsToShow.length === 0 && (
              <div className="p-8 text-center text-text-muted">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No commands found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-surface/50">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-hover rounded border border-border">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-hover rounded border border-border">Enter</kbd>
                  Select
                </span>
              </div>
              {isAiThinking && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  AI thinking...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Command Bar Trigger Button
 */
export function CommandBarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 bg-surface-hover rounded border border-border text-sm text-text-muted hover:text-text-primary flex items-center gap-sm transition-colors"
      >
        <IconCommand size={14} />
        <span>Search</span>
        <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-surface rounded">⌘K</kbd>
      </button>

      <CommandBar open={open} onOpenChange={setOpen} />
    </>
  );
}
