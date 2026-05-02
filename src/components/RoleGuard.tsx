import React from 'react';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('owner' | 'admin' | 'member')[];
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, fallback }) => {
  const { currentRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-4">Loading permissions...</div>;
  }

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return (
      fallback || (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200 m-4">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            You do not have permission to view this page. <br/>
            <span className="text-xs text-gray-400 mt-1 block">Required role: {allowedRoles.join(' or ')}</span>
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
