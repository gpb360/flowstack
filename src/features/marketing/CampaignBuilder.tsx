import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { ProgressSteps, ProgressStep } from '@/components/ui/progress-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { AlertUntitled } from '@/components/ui/alert-untitled';
import { BreadcrumbUntitled, BreadcrumbItem } from '@/components/ui/breadcrumb-untitled';

const STEPS: ProgressStep[] = [
  { id: 'details', label: 'Details' },
  { id: 'audience', label: 'Audience' },
  { id: 'review', label: 'Review' },
];

export const CampaignBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'email' | 'sms'>('email');
  const [templateId, setTemplateId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Update step status based on current step
  const stepsWithStatus: ProgressStep[] = STEPS.map((step, index) => {
    let status: 'complete' | 'current' | 'pending' = 'pending';
    if (index < currentStep) status = 'complete';
    else if (index === currentStep) status = 'current';
    return { ...step, status };
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/marketing/campaigns');
    }
  };

  const handleLaunch = () => {
    console.log('Launching campaign:', { name, type, templateId, scheduledAt });
    navigate('/marketing/campaigns');
  };

  const breadcrumbs = [
    { id: 'marketing', label: 'Marketing', href: '/marketing' },
    { id: 'campaigns', label: 'Campaigns', href: '/marketing/campaigns' },
    { id: 'new', label: 'New Campaign', current: true },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <ButtonUntitled
            variant="tertiary"
            size="sm"
            leftIcon={<ArrowLeft size={18} />}
            onClick={handleBack}
          >
            Back
          </ButtonUntitled>
          <div>
            <h2 className="text-xl font-bold text-text-primary">New Campaign</h2>
            <BreadcrumbUntitled items={breadcrumbs} size="sm" showHome={false} className="mt-1" />
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="hidden md:flex">
          <ProgressSteps steps={stepsWithStatus} size="md" showNumbers />
        </div>
      </div>

      {/* Content */}
      <CardUntitled variant="default" size="lg" className="flex-1 max-w-3xl w-full mx-auto shadow-sm">
        <div className="p-8">
          {/* Step 1: Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Campaign Details</h3>

              <InputUntitled
                label="Campaign Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Sale Announcement"
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Campaign Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setType('email')}
                    className={`p-4 border rounded cursor-pointer transition-all flex flex-col items-center gap-2 ${
                      type === 'email' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="p-2 bg-primary/10 text-primary rounded-full">
                      <Send size={24} />
                    </div>
                    <span className="font-medium">Email</span>
                  </div>

                  <div
                    onClick={() => setType('sms')}
                    className={`p-4 border rounded cursor-pointer transition-all flex flex-col items-center gap-2 ${
                      type === 'sms' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="p-2 bg-success/10 text-success rounded-full">
                      <div className="rotate-90"><Send size={24} /></div>
                    </div>
                    <span className="font-medium">SMS</span>
                  </div>
                </div>
              </div>

              <InputUntitled
                label="Template"
                type="select"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="Select a template..."
              >
                <option value="">Select a template...</option>
                <option value="1">Welcome Email</option>
                <option value="2">Newsletter</option>
              </InputUntitled>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Define Audience</h3>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded flex items-center gap-4">
                <Users className="text-primary" size={24} />
                <div>
                  <p className="font-medium text-text-primary">All Contacts</p>
                  <p className="text-sm text-text-secondary">
                    This campaign will be sent to all {type === 'email' ? 'subscribed' : 'opted-in'} contacts.
                  </p>
                </div>
              </div>

              <InputUntitled
                label="Filter by Tag (Coming Soon)"
                type="text"
                disabled
                placeholder="Any tags..."
                className="opacity-50"
              />
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Review & Launch</h3>

              <div className="grid grid-cols-2 gap-6 bg-background p-6 rounded border border-border">
                <div>
                  <span className="text-sm text-text-secondary">Name</span>
                  <p className="font-medium">{name || 'Untitled'}</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Type</span>
                  <p className="font-medium capitalize">{type}</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Recipients</span>
                  <p className="font-medium">All Contacts (~1,240)</p>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">Schedule</span>
                  <p className="font-medium text-success">Send Immediately</p>
                </div>
              </div>

              <AlertUntitled variant="warning" size="sm">
                Note: This is a demo. No actual messages will be sent.
              </AlertUntitled>
            </div>
          )}
        </div>
      </CardUntitled>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <ButtonUntitled
          variant="secondary"
          size="md"
          onClick={handleBack}
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </ButtonUntitled>

        {currentStep < STEPS.length - 1 ? (
          <ButtonUntitled
            variant="primary"
            size="md"
            onClick={handleNext}
          >
            Next Step
          </ButtonUntitled>
        ) : (
          <ButtonUntitled
            variant="primary"
            size="md"
            leftIcon={<Send size={18} />}
            onClick={handleLaunch}
          >
            Launch Campaign
          </ButtonUntitled>
        )}
      </div>
    </div>
  );
};
