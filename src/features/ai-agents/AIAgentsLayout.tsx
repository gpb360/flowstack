/**
 * AI Agents Feature Module
 * Multi-agent system with specialized agents for different business functions
 */

import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bot, MessageSquare, Zap, BarChart3, Settings, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', path: '/ai-agents', icon: Bot },
  { id: 'chat', label: 'AI Chat', path: '/ai-agents/chat', icon: MessageSquare },
  { id: 'automations', label: 'Agent Automations', path: '/ai-agents/automations', icon: Zap },
  { id: 'analytics', label: 'Agent Analytics', path: '/ai-agents/analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', path: '/ai-agents/settings', icon: Settings },
];

export function AIAgentsLayout() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const currentTab = tabs.find(t => location.pathname === t.path);
    setActiveTab(currentTab?.id || 'overview');
  }, [location.pathname]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Agents</h1>
                <p className="text-sm text-text-muted">Intelligent automation and assistance</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <nav className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || location.pathname.startsWith(tab.path + '/');

              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                    isActive
                      ? 'bg-background text-primary border-b-2 border-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
