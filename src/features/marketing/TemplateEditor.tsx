import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const TemplateEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [name, setName] = useState(isNew ? '' : 'New Template');
  const [type, setType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    console.log('Saving template:', { name, type, subject, content });
    navigate('/marketing/templates');
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/marketing/templates')}
            className="p-2 hover:bg-surface-hover rounded text-text-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{isNew ? 'Create Template' : 'Edit Template'}</h2>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          <Save size={18} />
          Save Template
        </button>
      </div>

      {/* Form */}
      <div className="bg-surface border border-border rounded p-6 max-w-4xl w-full mx-auto flex flex-col gap-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Template Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded focus:border-primary focus:outline-none"
              placeholder="e.g. Welcome Series #1"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Type</label>
            <div className="flex bg-background border border-border rounded p-1 w-fit">
              <button 
                onClick={() => setType('email')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  type === 'email' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Email
              </button>
              <button 
                onClick={() => setType('sms')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  type === 'sms' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                SMS
              </button>
            </div>
          </div>
        </div>

        {/* Email Subject */}
        {type === 'email' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Subject Line</label>
            <input 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded focus:border-primary focus:outline-none"
              placeholder="Enter email subject"
            />
          </div>
        )}

        {/* Content Editor */}
        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-sm font-medium text-text-secondary">
            {type === 'email' ? 'Email Body (HTML)' : 'SMS Message'}
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 min-h-[300px] p-4 bg-background border border-border rounded focus:border-primary focus:outline-none font-mono text-sm"
            placeholder={type === 'email' ? '<html>...</html>' : 'Type your SMS message here...'}
          />
          <p className="text-xs text-text-muted">
            {type === 'sms' && `${content.length} characters`}
          </p>
        </div>

      </div>
    </div>
  );
};
