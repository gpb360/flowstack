import React from 'react';
import type { WidgetWrapperProps } from '../types';

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ 
  title, 
  children, 
  className = '', 
  action 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full ${className}`}>
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
};
