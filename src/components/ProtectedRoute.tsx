import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo = '/auth'
}: ProtectedRouteProps) => {
  const { session, isLoading, hasCompletedOnboarding } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !session) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && session) {
    return <Navigate to="/" replace />;
  }

  // Redirect to onboarding if user has no organization
  if (requireAuth && session && !hasCompletedOnboarding) {
    const isOnboarding = window.location.pathname === '/onboarding';
    if (!isOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
};
