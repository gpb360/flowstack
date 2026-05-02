import React from 'react';
import { Plus, Search, FileText, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const TEMPLATES = [
  { id: '1', name: 'Welcome Email', type: 'email', lastUpdated: '2 hours ago' },
  { id: '2', name: 'Password Reset', type: 'email', lastUpdated: '1 day ago' },
  { id: '3', name: 'SMS Discount', type: 'sms', lastUpdated: '3 days ago' },
];

export const TemplateList: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search templates..." 
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded focus:border-primary focus:outline-none placeholder:text-text-muted"
          />
        </div>
        
        <Link 
          to="/marketing/templates/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={18} />
          New Template
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <div key={template.id} className="p-4 bg-surface border border-border rounded hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded ${template.type === 'email' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                {template.type === 'email' ? <FileText size={20} /> : <Smartphone size={20} />}
              </div>
              <button className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Edit
              </button>
            </div>
            <h3 className="font-medium text-text-primary mb-1">{template.name}</h3>
            <p className="text-xs text-text-secondary">Updated {template.lastUpdated}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
