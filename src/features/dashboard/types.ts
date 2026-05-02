import type { ReactNode } from 'react';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface WidgetProps {
  className?: string;
}

export interface WidgetWrapperProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  size?: WidgetSize;
}
