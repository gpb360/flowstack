/**
 * Action Node Properties Component
 */

import { useState } from 'react';
import { type Node } from '@xyflow/react';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import { TabsUntitled } from '@/components/ui/tabs-untitled';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ActionNodePropertiesProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export const ActionNodeProperties = ({ node, onUpdate }: ActionNodePropertiesProps) => {
  const data = node.data as any;
  const actionType = data.actionType || '';
  const config = data.config || {};
  const [activeTab, setActiveTab] = useState('settings');

  const tabs = [
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <div className="space-y-4 mt-4">
          <div>
            <InputUntitled
              id="action-type"
              label="Action Type"
              value={actionType}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <InputUntitled
              id="timeout"
              type="number"
              label="Timeout (ms)"
              value={data.timeout || 30000}
              onChange={(e) => onUpdate({ timeout: parseInt(e.target.value) || 30000 })}
              helperText="Default: 30000ms (30 seconds)"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'parameters',
      label: 'Parameters',
      content: (
        <div className="space-y-4 mt-4">
          {/* Email Parameters */}
          {actionType === 'communication:send_email' && (
            <>
              <InputUntitled
                id="email-to"
                label="To"
                value={config.to || ''}
                onChange={(e) => onUpdate({ config: { ...config, to: e.target.value } })}
                placeholder="recipient@example.com"
              />
              <InputUntitled
                id="email-subject"
                label="Subject"
                value={config.subject || ''}
                onChange={(e) => onUpdate({ config: { ...config, subject: e.target.value } })}
                placeholder="Email subject"
              />
              <TextareaUntitled
                id="email-body"
                label="Body"
                value={config.body || ''}
                onChange={(e) => onUpdate({ config: { ...config, body: e.target.value } })}
                placeholder="Email content..."
                rows={4}
              />
            </>
          )}

          {/* SMS Parameters */}
          {actionType === 'communication:send_sms' && (
            <>
              <InputUntitled
                id="sms-to"
                label="Phone Number"
                value={config.to || ''}
                onChange={(e) => onUpdate({ config: { ...config, to: e.target.value } })}
                placeholder="+1234567890"
              />
              <TextareaUntitled
                id="sms-message"
                label="Message"
                value={config.message || ''}
                onChange={(e) => onUpdate({ config: { ...config, message: e.target.value } })}
                placeholder="SMS message..."
                rows={3}
              />
            </>
          )}

          {/* CRM Contact Parameters */}
          {actionType === 'crm:create_contact' && (
            <>
              <InputUntitled
                id="contact-first-name"
                label="First Name"
                value={config.first_name || ''}
                onChange={(e) => onUpdate({ config: { ...config, first_name: e.target.value } })}
              />
              <InputUntitled
                id="contact-last-name"
                label="Last Name"
                value={config.last_name || ''}
                onChange={(e) => onUpdate({ config: { ...config, last_name: e.target.value } })}
              />
              <InputUntitled
                id="contact-email"
                label="Email"
                type="email"
                value={config.email || ''}
                onChange={(e) => onUpdate({ config: { ...config, email: e.target.value } })}
              />
              <InputUntitled
                id="contact-phone"
                label="Phone"
                value={config.phone || ''}
                onChange={(e) => onUpdate({ config: { ...config, phone: e.target.value } })}
              />
            </>
          )}

          {/* Delay Parameters */}
          {actionType === 'logic:delay' && (
            <>
              <InputUntitled
                id="delay-duration"
                type="number"
                label="Duration"
                value={config.duration || 1000}
                onChange={(e) => onUpdate({ config: { ...config, duration: parseInt(e.target.value) || 1000 } })}
              />
              <div>
                <Label htmlFor="delay-unit">Unit</Label>
                <Select
                  value={config.unit || 'milliseconds'}
                  onValueChange={(value) => onUpdate({ config: { ...config, unit: value } })}
                >
                  <SelectTrigger id="delay-unit" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="milliseconds">Milliseconds</SelectItem>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Default parameters for other actions */}
          {!['communication:send_email', 'communication:send_sms', 'crm:create_contact', 'logic:delay'].includes(actionType) && (
            <div className="text-sm text-gray-500">
              <p>No parameters available for this action type.</p>
              <p className="text-xs mt-1">Configure action-specific settings in the execution engine.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'retry',
      label: 'Retry',
      content: (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="retry-enabled">Enable Retry</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="retry-enabled"
                checked={!!data.retryConfig}
                onChange={(e) =>
                  onUpdate({
                    retryConfig: e.target.checked
                      ? { maxAttempts: 3, backoffType: 'exponential', initialDelay: 1000 }
                      : undefined,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                {data.retryConfig ? 'Retry enabled' : 'Retry disabled'}
              </span>
            </div>
          </div>

          {data.retryConfig && (
            <>
              <InputUntitled
                id="max-attempts"
                type="number"
                label="Max Attempts"
                value={data.retryConfig.maxAttempts || 3}
                onChange={(e) =>
                  onUpdate({
                    retryConfig: {
                      ...data.retryConfig,
                      maxAttempts: parseInt(e.target.value) || 3,
                    },
                  })
                }
              />
              <div>
                <Label htmlFor="backoff-type">Backoff Type</Label>
                <Select
                  value={data.retryConfig.backoffType || 'exponential'}
                  onValueChange={(value) =>
                    onUpdate({
                      retryConfig: {
                        ...data.retryConfig,
                        backoffType: value as any,
                      },
                    })
                  }
                >
                  <SelectTrigger id="backoff-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="exponential">Exponential</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <InputUntitled
                id="initial-delay"
                type="number"
                label="Initial Delay (ms)"
                value={data.retryConfig.initialDelay || 1000}
                onChange={(e) =>
                  onUpdate({
                    retryConfig: {
                      ...data.retryConfig,
                      initialDelay: parseInt(e.target.value) || 1000,
                    },
                  })
                }
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <TabsUntitled
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="enclosed"
        fullWidth
      />
    </div>
  );
};
