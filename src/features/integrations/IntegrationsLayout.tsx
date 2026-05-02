import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Plug, Link2, Puzzle, Settings, Plus } from 'lucide-react';

export const IntegrationsLayout: React.FC = () => {
  const location = useLocation();
  const [showNewConnection, setShowNewConnection] = useState(false);

  const navItems = [
    { to: '/integrations', icon: Link2, label: 'Connections' },
    { to: '/integrations/registry', icon: Puzzle, label: 'Browse Integrations' },
    { to: '/integrations/webhooks', icon: Settings, label: 'Webhooks' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Integration Hub
          </h2>
          <p className="text-text-secondary">
            Connect third-party services and automate your workflows
          </p>
        </div>

        <button
          onClick={() => setShowNewConnection(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Connection</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border mb-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 bg-surface rounded-lg border border-border overflow-hidden">
        <Outlet />
      </div>

      {/* New Connection Modal (placeholder) */}
      {showNewConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Connect an Integration</h3>
            <p className="text-text-secondary mb-4">
              Browse available integrations to connect to your workspace.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewConnection(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <NavLink
                to="/integrations/registry"
                onClick={() => setShowNewConnection(false)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-center"
              >
                Browse Integrations
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
