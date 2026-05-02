import { Badge } from '@/components/ui/badge-untitled';
import { Button } from '@/components/ui/button-untitled';
import { CheckboxUntitled as Checkbox } from '@/components/ui/checkbox-untitled';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SocialAccount } from '../hooks/useSocialAccounts';
import { getPlatformConfig } from '../lib/platforms';

interface AccountSelectorProps {
  accounts: SocialAccount[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
}

export function AccountSelector({ accounts, selected, onChange, isLoading }: AccountSelectorProps) {
  const handleToggleAccount = (accountId: string) => {
    if (selected.includes(accountId)) {
      onChange(selected.filter(id => id !== accountId));
    } else {
      onChange([...selected, accountId]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === accounts.length) {
      onChange([]);
    } else {
      onChange(accounts.map(acc => acc.id));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary mb-4">No connected accounts</p>
        <Button onClick={() => window.location.href = '/social/accounts'}>
          Connect Account
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Select Accounts</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
        >
          {selected.length === accounts.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => {
          const config = getPlatformConfig(account.platform);
          const isSelected = selected.includes(account.id);

          return (
            <div
              key={account.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors',
                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              )}
              onClick={() => handleToggleAccount(account.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-2xl"
                  style={{ color: config.color }}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="font-medium">{account.account_name}</div>
                  <div className="text-sm text-text-secondary">
                    {config.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {account.status === 'active' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <Checkbox checked={isSelected} />
              </div>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((accountId) => {
            const account = accounts.find(a => a.id === accountId);
            if (!account) return null;

            const config = getPlatformConfig(account.platform);

            return (
              <Badge key={accountId} variant="secondary">
                {config.icon} {account.account_name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
