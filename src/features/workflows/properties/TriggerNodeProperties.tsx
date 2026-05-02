/**
 * Trigger Node Properties Component
 */

import { type Node } from '@xyflow/react';
import { InputUntitled } from '@/components/ui/input-untitled';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface TriggerNodePropertiesProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export const TriggerNodeProperties = ({ node, onUpdate }: TriggerNodePropertiesProps) => {
  const data = node.data as any;
  const trigger = data.trigger || {};

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="trigger-enabled">Enabled</Label>
        <div className="flex items-center gap-2 mt-1">
          <Switch
            id="trigger-enabled"
            checked={trigger.enabled !== false}
            onCheckedChange={(checked) =>
              onUpdate({
                trigger: { ...trigger, enabled: checked },
              })
            }
          />
          <span className="text-sm text-gray-600">
            {trigger.enabled !== false ? 'Trigger is active' : 'Trigger is disabled'}
          </span>
        </div>
      </div>

      {trigger.type === 'webhook:incoming' && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <Label className="text-purple-900">Webhook Configuration</Label>
          <div className="mt-2 text-sm text-purple-700">
            <p className="font-medium">Webhook URL:</p>
            <code className="block mt-1 p-2 bg-purple-100 rounded text-xs break-all">
              {`${window.location.origin}/api/webhook/${node.id}`}
            </code>
          </div>
        </div>
      )}

      {trigger.type === 'schedule:cron' && (
        <div>
          <InputUntitled
            id="cron-expression"
            label="Cron Expression"
            value={trigger.config?.cron || ''}
            onChange={(e) =>
              onUpdate({
                trigger: {
                  ...trigger,
                  config: { ...trigger.config, cron: e.target.value },
                },
              })
            }
            placeholder="0 9 * * *"
            helperText="Example: 0 9 * * * for daily at 9 AM"
          />
        </div>
      )}

      {trigger.type === 'form:submission' && (
        <div>
          <InputUntitled
            id="form-id"
            label="Form ID"
            value={trigger.config?.form_id || ''}
            onChange={(e) =>
              onUpdate({
                trigger: {
                  ...trigger,
                  config: { ...trigger.config, form_id: e.target.value },
                },
              })
            }
            placeholder="Select a form..."
          />
        </div>
      )}
    </div>
  );
};
