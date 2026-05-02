import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// react-beautiful-dnd is not compatible with React 19; using simple list for now
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowLeft, Plus, Save, Mail, MessageSquare, Clock, GitBranch, Trash2 } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';

export interface SequenceStep {
  id: string;
  type: 'email' | 'sms' | 'wait' | 'condition';
  order: number;
  config: Record<string, unknown>;
}

export interface Sequence {
  id: string;
  name: string;
  trigger: 'manual' | 'form_submit' | 'webhook' | 'contact_added';
  steps: SequenceStep[];
}

export const SequenceBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [sequenceName, setSequenceName] = useState('');
  const [trigger, setTrigger] = useState<Sequence['trigger']>('manual');
  const [steps, setSteps] = useState<SequenceStep[]>([]);

  const handleAddStep = (type: SequenceStep['type']) => {
    const newStep: SequenceStep = {
      id: Date.now().toString(),
      type,
      order: steps.length,
      config: {},
    };

    switch (type) {
      case 'email':
        newStep.config = { templateId: '', delayMinutes: 0 };
        break;
      case 'sms':
        newStep.config = { message: '', delayMinutes: 0 };
        break;
      case 'wait':
        newStep.config = { duration: 1, unit: 'days' };
        break;
      case 'condition':
        newStep.config = { field: '', operator: 'equals', value: '' };
        break;
    }

    setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (stepId: string, config: Record<string, unknown>) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, config } : s)));
  };

  const handleDeleteStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const reorderedSteps = items.map((step, index) => ({
      ...step,
      order: index,
    }));

    setSteps(reorderedSteps);
  };

  const handleSave = () => {
    const sequence: Sequence = {
      id: isNew ? Date.now().toString() : id!,
      name: sequenceName,
      trigger,
      steps,
    };

    console.log('Saving sequence:', sequence);
    navigate('/marketing/sequences');
  };

  const getStepIcon = (type: SequenceStep['type']) => {
    switch (type) {
      case 'email':
        return Mail;
      case 'sms':
        return MessageSquare;
      case 'wait':
        return Clock;
      case 'condition':
        return GitBranch;
    }
  };

  const getStepColor = (type: SequenceStep['type']) => {
    switch (type) {
      case 'email':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'sms':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'wait':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'condition':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonUntitled
            variant="ghost"
            size="icon"
            onClick={() => navigate('/marketing/sequences')}
          >
            <ArrowLeft className="h-4 w-4" />
          </ButtonUntitled>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'New Sequence' : 'Edit Sequence'}</h1>
            <p className="text-sm text-muted-foreground">
              Create automated email and SMS sequences
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonUntitled variant="outline" onClick={() => navigate('/marketing/sequences')}>
            Cancel
          </ButtonUntitled>
          <ButtonUntitled onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Sequence
          </ButtonUntitled>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sequence Settings */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Sequence Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name">Sequence Name</label>
                <InputUntitled
                  id="name"
                  value={sequenceName}
                  onChange={(e) => setSequenceName(e.target.value)}
                  placeholder="e.g., Welcome Series"
                />
              </div>

              <div className="space-y-2">
                <label>Trigger</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['manual', 'form_submit', 'webhook', 'contact_added'] as Sequence['trigger'][]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTrigger(t)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        trigger === t
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium capitalize">{t.replace('_', ' ')}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </CardUntitled>

          {/* Steps Builder */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Sequence Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <div className="space-y-3">
                      {steps.map((step, index) => {
                        const StepIcon = getStepIcon(step.type);
                        return (
                          <div key={step.id}>
                              <div
                                className={`p-4 border rounded-lg ${getStepColor(step.type)}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 rounded bg-background">
                                      <StepIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <BadgeUntitled variant="outline" className="capitalize">
                                          {step.type}
                                        </BadgeUntitled>
                                        <span className="text-sm text-muted-foreground">
                                          Step {index + 1}
                                        </span>
                                      </div>

                                      {/* Step Config */}
                                      {step.type === 'email' && (
                                        <div className="mt-3 space-y-2">
                                          <select
                                            className="w-full p-2 border rounded bg-background"
                                            value={step.config.templateId as string}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                templateId: e.target.value,
                                              })
                                            }
                                          >
                                            <option value="">Select template...</option>
                                            {/* Templates would be loaded here */}
                                          </select>
                                          <InputUntitled
                                            type="number"
                                            placeholder="Delay (minutes)"
                                            value={step.config.delayMinutes as number}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                delayMinutes: parseInt(e.target.value),
                                              })
                                            }
                                          />
                                        </div>
                                      )}

                                      {step.type === 'sms' && (
                                        <div className="mt-3 space-y-2">
                                          <textarea
                                            className="w-full p-2 border rounded bg-background"
                                            placeholder="SMS message..."
                                            rows={2}
                                            value={step.config.message as string}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                message: e.target.value,
                                              })
                                            }
                                          />
                                          <InputUntitled
                                            type="number"
                                            placeholder="Delay (minutes)"
                                            value={step.config.delayMinutes as number}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                delayMinutes: parseInt(e.target.value),
                                              })
                                            }
                                          />
                                        </div>
                                      )}

                                      {step.type === 'wait' && (
                                        <div className="mt-3 flex items-center gap-2">
                                          <InputUntitled
                                            type="number"
                                            value={step.config.duration as number}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                duration: parseInt(e.target.value),
                                              })
                                            }
                                            className="w-20"
                                          />
                                          <select
                                            className="p-2 border rounded bg-background"
                                            value={step.config.unit as string}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                unit: e.target.value,
                                              })
                                            }
                                          >
                                            <option value="minutes">Minutes</option>
                                            <option value="hours">Hours</option>
                                            <option value="days">Days</option>
                                          </select>
                                        </div>
                                      )}

                                      {step.type === 'condition' && (
                                        <div className="mt-3 space-y-2">
                                          <InputUntitled
                                            placeholder="Field"
                                            value={step.config.field as string}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                field: e.target.value,
                                              })
                                            }
                                          />
                                          <select
                                            className="w-full p-2 border rounded bg-background"
                                            value={step.config.operator as string}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                operator: e.target.value,
                                              })
                                            }
                                          >
                                            <option value="equals">Equals</option>
                                            <option value="contains">Contains</option>
                                            <option value="gt">Greater Than</option>
                                            <option value="lt">Less Than</option>
                                          </select>
                                          <InputUntitled
                                            placeholder="Value"
                                            value={step.config.value as string}
                                            onChange={(e) =>
                                              handleUpdateStep(step.id, {
                                                ...step.config,
                                                value: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <ButtonUntitled
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteStep(step.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </ButtonUntitled>
                                </div>
                              </div>
                          </div>
                        );
                      })}
                </div>
              </div>

              {/* Add Step Buttons */}
              <div className="mt-4 flex gap-2 flex-wrap">
                <ButtonUntitled
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStep('email')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </ButtonUntitled>
                <ButtonUntitled
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStep('sms')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  SMS
                </ButtonUntitled>
                <ButtonUntitled
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStep('wait')}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Wait
                </ButtonUntitled>
                <ButtonUntitled
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStep('condition')}
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Condition
                </ButtonUntitled>
              </div>

              {steps.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">No steps yet. Add your first step to begin.</p>
                </div>
              )}
            </CardContent>
          </CardUntitled>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CardUntitled>
            <CardHeader>
              <CardTitle>Sequence Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Steps</p>
                <p className="text-2xl font-bold">{steps.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emails</p>
                <p className="text-2xl font-bold">
                  {steps.filter((s) => s.type === 'email').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SMS Messages</p>
                <p className="text-2xl font-bold">
                  {steps.filter((s) => s.type === 'sms').length}
                </p>
              </div>
            </CardContent>
          </CardUntitled>

          <CardUntitled>
            <CardHeader>
              <CardTitle>Trigger Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <BadgeUntitled variant="outline" className="capitalize">
                  {trigger.replace('_', ' ')}
                </BadgeUntitled>
                <p className="text-sm text-muted-foreground">
                  {trigger === 'manual' && 'Manually enroll contacts'}
                  {trigger === 'form_submit' && 'When a form is submitted'}
                  {trigger === 'webhook' && 'Triggered via webhook'}
                  {trigger === 'contact_added' && 'When a contact is added'}
                </p>
              </div>
            </CardContent>
          </CardUntitled>
        </div>
      </div>
    </div>
  );
};

export default SequenceBuilder;
