/**
 * MemberGuard Component
 * Protect content based on membership status
 */

import type { ReactNode } from 'react';
import { Lock, Star, Crown } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Badge } from '@/components/ui/badge';
import { useContentAccess } from '@/features/memberships/hooks/useMemberAccess';
import { useAuth } from '@/context/AuthContext';

interface MemberGuardProps {
  children: ReactNode;
  contentId: string;
  organizationId: string;
  requiredPlan?: string;
  fallback?: ReactNode;
}

export function MemberGuard({
  children,
  contentId,
  organizationId,
  requiredPlan,
  fallback,
}: MemberGuardProps) {
  const { session: _session } = useAuth();
  const { data: access, isLoading } = useContentAccess(contentId, organizationId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!access?.hasAccess) {
    return fallback || <UpgradePrompt access={access} requiredPlan={requiredPlan} />;
  }

  return <>{children}</>;
}

interface UpgradePromptProps {
  access: any;
  requiredPlan?: string;
}

function UpgradePrompt({ access, requiredPlan }: UpgradePromptProps) {
  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-12 w-12 text-yellow-500" />;
      case 'basic':
        return <Star className="h-12 w-12 text-blue-500" />;
      default:
        return <Lock className="h-12 w-12 text-gray-400" />;
    }
  };

  const getTierMessage = (tier?: string) => {
    switch (tier) {
      case 'premium':
        return 'This is premium content';
      case 'basic':
        return 'This is a basic membership perk';
      default:
        return 'This content requires a membership';
    }
  };

  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <div className="mx-auto mb-4">{getTierIcon(requiredPlan)}</div>
        <CardTitle>Premium Content</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          {getTierMessage(requiredPlan)}
        </p>
        {access?.reason && (
          <p className="mb-4 text-sm text-muted-foreground">
            {access.reason}
          </p>
        )}
        {access?.availableAt && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <div className="font-medium">Available in:</div>
            <div className="text-muted-foreground">
              {new Date(access.availableAt).toLocaleDateString()}
            </div>
          </div>
        )}
        {requiredPlan && (
          <Badge variant="outline" className="mt-4">
            Requires {requiredPlan} plan
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        <ButtonUntitled variant="primary" fullWidth>
          Upgrade to Access
        </ButtonUntitled>
      </CardFooter>
    </Card>
  );
}

/**
 * HOC version for easier use
 */
export function withMembershipGuard<P extends object>(
  Component: React.ComponentType<P>,
  contentId: string,
  organizationId: string
) {
  return function GuardedComponent(props: P) {
    return (
      <MemberGuard contentId={contentId} organizationId={organizationId}>
        <Component {...props} />
      </MemberGuard>
    );
  };
}
