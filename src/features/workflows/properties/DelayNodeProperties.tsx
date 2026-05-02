/**
 * Delay Node Properties Component
 */

import { type Node } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { InputUntitled } from '@/components/ui/input-untitled';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DelayNodePropertiesProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export const DelayNodeProperties = ({ node, onUpdate }: DelayNodePropertiesProps) => {
  const data = node.data as any;
  const duration = data.duration || 1000;
  const unit = data.unit || 'milliseconds';

  return (
    <div className="space-y-4">
      <div>
        <InputUntitled
          id="delay-duration"
          type="number"
          label="Duration"
          value={duration}
          onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 1000 })}
        />
      </div>

      <div>
        <Label htmlFor="delay-unit">Unit</Label>
        <Select
          value={unit}
          onValueChange={(value) => onUpdate({ unit: value })}
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

      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-900 font-medium">Total Delay</p>
        <p className="text-2xl font-bold text-purple-700 mt-1">
          {duration} {unit}
        </p>
      </div>

      <div className="text-xs text-gray-500">
        <p>The workflow will wait for this duration before continuing to the next node.</p>
      </div>
    </div>
  );
};
