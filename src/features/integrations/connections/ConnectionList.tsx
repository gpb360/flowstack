import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnections } from '../lib/queries';
import { useAvailableIntegrations } from '../lib/queries';
import { useAuth } from '@/context/AuthContext';
import { Link2, Plug, CheckCircle, XCircle, AlertCircle, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { IntegrationConnection } from '../lib/types';

export const ConnectionList: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const { data: connections, isLoading, error } = useConnections(currentOrganization?.id);
  const { data: integrations } = useAvailableIntegrations();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const getConnectionStatus = (connection: IntegrationConnection) => {
    switch (connection.status) {
      case 'active':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Active' };
      case 'error':
        return { icon: XCircle, color: 'text-red-500', label: 'Error' };
      case 'disabled':
        return { icon: AlertCircle, color: 'text-gray-500', label: 'Disabled' };
      case 'expired':
        return { icon: AlertCircle, color: 'text-orange-500', label: 'Expired' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', label: 'Unknown' };
    }
  };

  const getIntegrationDetails = (integrationId: string) => {
    return integrations?.find((i) => i.id === integrationId);
  };

  const handleSync = async (connectionId: string) => {
    // Trigger sync - would call sync mutation
    console.log('Syncing connection:', connectionId);
  };

  const handleDisconnect = async (connectionId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      // Call delete mutation
      console.log('Disconnecting:', connectionId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-secondary">Failed to load connections</p>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="No connections yet"
        description="Connect third-party services to enable data sync and workflow automation"
        action={{
          label: 'Browse Integrations',
          onClick: () => navigate('/integrations/registry'),
        }}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="grid gap-4">
        {connections.map((connection) => {
          const integration = getIntegrationDetails(connection.integration_id);
          const status = getConnectionStatus(connection);
          const StatusIcon = status.icon;
          const IntegrationIcon = integration?.icon as any || Plug;

          return (
            <CardUntitled key={connection.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: integration?.color || '#6B7280' + '20' }}>
                    <IntegrationIcon className="w-6 h-6" style={{ color: integration?.color || '#6B7280' }} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {connection.name || integration?.name}
                      <BadgeUntitled variant="outline" className={`${status.color} border-current`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </BadgeUntitled>
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {integration?.description}
                    </p>
                    {connection.last_synced_at && (
                      <p className="text-xs text-text-secondary mt-1">
                        Last synced: {new Date(connection.last_synced_at).toLocaleString()}
                      </p>
                    )}
                    {connection.last_error && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {connection.last_error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ButtonUntitled
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(connection.id)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </ButtonUntitled>
                  <ButtonUntitled
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/integrations/${connection.id}`)}
                  >
                    Settings
                  </ButtonUntitled>

                  {/* Dropdown Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === connection.id ? null : connection.id)}
                      className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpen === connection.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate(`/integrations/${connection.id}`);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-surface-hover transition-colors"
                          >
                            Configure
                          </button>
                          <button
                            onClick={() => {
                              handleSync(connection.id);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-surface-hover transition-colors"
                          >
                            Sync Now
                          </button>
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => {
                              handleDisconnect(connection.id);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardUntitled>
          );
        })}
      </div>
    </div>
  );
};
