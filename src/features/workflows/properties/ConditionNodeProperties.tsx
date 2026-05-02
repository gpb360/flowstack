/**
 * Condition Node Properties Component
 */

import { type Node } from '@xyflow/react';
import { Label } from '@/components/ui/label';
import { InputUntitled } from '@/components/ui/input-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface ConditionNodePropertiesProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export const ConditionNodeProperties = ({ node, onUpdate }: ConditionNodePropertiesProps) => {
  const data = node.data as any;
  const conditions = data.conditions || { operator: 'and', conditions: [] };

  const addCondition = () => {
    onUpdate({
      conditions: {
        ...conditions,
        conditions: [
          ...conditions.conditions,
          { field: '', operator: 'eq', value: '' },
        ],
      },
    });
  };

  const removeCondition = (index: number) => {
    onUpdate({
      conditions: {
        ...conditions,
        conditions: conditions.conditions.filter((_: any, i: number) => i !== index),
      },
    });
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...conditions.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    onUpdate({
      conditions: {
        ...conditions,
        conditions: newConditions,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="operator">Operator</Label>
        <Select
          value={conditions.operator || 'and'}
          onValueChange={(value) =>
            onUpdate({
              conditions: {
                ...conditions,
                operator: value as 'and' | 'or',
              },
            })
          }
        >
          <SelectTrigger id="operator" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="and">AND (All must match)</SelectItem>
            <SelectItem value="or">OR (Any must match)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Conditions</Label>
          <ButtonUntitled variant="ghost" size="sm" onClick={addCondition}>
            <Plus size={14} className="mr-1" />
            Add
          </ButtonUntitled>
        </div>

        {conditions.conditions.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded">
            No conditions added. Click "Add" to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {conditions.conditions.map((condition: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Condition {index + 1}</span>
                  <ButtonUntitled
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onClick={() => removeCondition(index)}
                    className="h-6 w-6"
                  >
                    <Trash2 size={12} />
                  </ButtonUntitled>
                </div>

                <InputUntitled
                  placeholder="Field (e.g., contact.email)"
                  value={condition.field || ''}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  size="sm"
                />

                <Select
                  value={condition.operator || 'eq'}
                  onValueChange={(value) => updateCondition(index, 'operator', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq">Equals</SelectItem>
                    <SelectItem value="ne">Not Equals</SelectItem>
                    <SelectItem value="gt">Greater Than</SelectItem>
                    <SelectItem value="lt">Less Than</SelectItem>
                    <SelectItem value="gte">Greater or Equal</SelectItem>
                    <SelectItem value="lte">Less or Equal</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="starts_with">Starts With</SelectItem>
                    <SelectItem value="ends_with">Ends With</SelectItem>
                    <SelectItem value="is_empty">Is Empty</SelectItem>
                    <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
                  </SelectContent>
                </Select>

                <InputUntitled
                  placeholder="Value"
                  value={condition.value || ''}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
