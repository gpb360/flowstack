import React, { type ReactNode } from 'react';
import { useFeature } from '../context/FeatureContext';
import { type ModuleId } from '../lib/registry';
import { Navigate } from 'react-router-dom';

interface FeatureGuardProps {
  moduleId: ModuleId;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ 
  moduleId, 
  children, 
  fallback = null,
  redirectTo
}) => {
  const { isModuleEnabled } = useFeature();

  if (!isModuleEnabled(moduleId)) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
