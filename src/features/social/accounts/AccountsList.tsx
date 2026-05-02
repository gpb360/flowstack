import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Settings, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useSocialAccounts } from '../hooks/useSocialAccounts';
import { getPlatformConfig } from '../lib/platforms';
import { format } from 'date-fns';

export function AccountsList() {
  const { accounts, isLoading } = useSocialAccounts();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <XCircle className="h-5 w-5 text-text-secondary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      error: 'destructive',
      expired: 'secondary',
      disconnected: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Connected Accounts"
        description="Manage your social media connections"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={Settings}
            title="No connected accounts"
            description="Connect your social media accounts to start scheduling posts"
            action={{
              label: 'Connect Account',
              onClick: () => {},
            }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const config = getPlatformConfig(account.platform);

              return (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="text-3xl"
                          style={{ color: config.color }}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.account_name}</CardTitle>
                          <p className="text-sm text-text-secondary">{config.name}</p>
                        </div>
                      </div>
                      {getStatusIcon(account.status)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {account.username && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Username</span>
                          <span className="font-medium">@{account.username}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-text-secondary">Status</span>
                        {getStatusBadge(account.status)}
                      </div>

                      <div className="flex justify-between">
                        <span className="text-text-secondary">Can Post</span>
                        <span>{account.can_post ? 'Yes' : 'No'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-text-secondary">Can Schedule</span>
                        <span>{account.can_schedule ? 'Yes' : 'No'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-text-secondary">Auto Post</span>
                        <span>{account.auto_post ? 'Enabled' : 'Disabled'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-text-secondary">Connected</span>
                        <span>{format(new Date(account.connected_at), 'MMM d, yyyy')}</span>
                      </div>

                      {account.error_message && (
                        <div className="pt-2">
                          <p className="text-red-500 text-xs">{account.error_message}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
