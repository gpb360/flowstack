/**
 * Alerts List Component
 * Displays reputation alerts and notifications
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useReputationAlerts, useMarkAlertRead, useDismissAlert, useMarkAllAlertsRead } from '../hooks/useReputationAlerts';
import { cn } from '@/lib/utils';

export function AlertsList() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const { data: alerts, isLoading } = useReputationAlerts(
    filter === 'critical' ? { severity: 'critical', dismissed: false } : { dismissed: false }
  );
  const markRead = useMarkAlertRead();
  const dismiss = useDismissAlert();
  const markAllRead = useMarkAllAlertsRead();

  const filteredAlerts = alerts?.filter((a) => {
    if (filter === 'unread') return !a.read;
    return true;
  });

  const handleAlertClick = (alert: any) => {
    if (!alert.read) {
      markRead.mutate(alert.id);
    }
    if (alert.action_url) {
      window.location.href = alert.action_url;
    }
  };

  const handleDismiss = (e: React.MouseEvent, alertId: string) => {
    e.stopPropagation();
    dismiss.mutate(alertId);
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeaderUntitled
        title="Reputation Alerts"
        description="Stay informed about important review activity"
        actions={
          <div className="flex gap-2">
            <ButtonUntitled variant="secondary" onClick={handleMarkAllRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
            </ButtonUntitled>
          </div>
        }
      />

      <div className="flex gap-2">
        <ButtonUntitled
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Alerts
        </ButtonUntitled>
        <ButtonUntitled
          variant={filter === 'unread' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread
        </ButtonUntitled>
        <ButtonUntitled
          variant={filter === 'critical' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('critical')}
        >
          Critical
        </ButtonUntitled>
      </div>

      <div className="space-y-4">
        {filteredAlerts && filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => handleAlertClick(alert)}
              onDismiss={(e) => handleDismiss(e, alert.id)}
            />
          ))
        ) : (
          <CardUntitled className="p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 font-medium">No alerts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {filter === 'unread' ? 'No unread alerts' : 'No alerts at this time'}
            </p>
          </CardUntitled>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, onClick, onDismiss }: {
  alert: any;
  onClick: () => void;
  onDismiss: (e: React.MouseEvent) => void;
}) {
  const getAlertIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityVariant = (severity: string): 'success' | 'error' | 'warning' | 'neutral' | 'info' => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  return (
    <CardUntitled
      className={cn(
        'cursor-pointer border-l-4 transition-colors hover:bg-gray-50',
        !alert.read && 'bg-[#D4AF37]/10',
        alert.severity === 'critical' && 'border-l-red-500',
        alert.severity === 'warning' && 'border-l-yellow-500',
        alert.severity === 'info' && 'border-l-blue-500'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">{getAlertIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-lg font-semibold">{alert.title}</div>
              {!alert.read && (
                <BadgeUntitled variant="info" size="sm">New</BadgeUntitled>
              )}
              <BadgeUntitled variant={getSeverityVariant(alert.severity)} size="sm">
                {alert.severity}
              </BadgeUntitled>
            </div>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
            {alert.details && (
              <p className="mt-2 text-sm text-muted-foreground">{alert.details}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
              </span>
              {alert.action_url && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        <ButtonUntitled
          variant="ghost"
          size="sm"
          isIconOnly
          onClick={onDismiss}
        >
          <XCircle className="h-4 w-4" />
        </ButtonUntitled>
      </div>
    </CardUntitled>
  );
}
