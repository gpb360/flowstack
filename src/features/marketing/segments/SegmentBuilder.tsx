import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Save, Trash2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import type { Database } from '@/types/database.types';

interface SegmentRule {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: string;
  logic: 'and' | 'or';
}

interface Segment {
  id: string;
  name: string;
  rules: SegmentRule[];
  estimated_size: number;
}

const FIELD_OPTIONS = [
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company_name', label: 'Company Name' },
  { value: 'position', label: 'Position' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'tags', label: 'Tags' },
];

export const SegmentBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [segmentName, setSegmentName] = useState('');
  const [rules, setRules] = useState<SegmentRule[]>([]);
  const [estimatedSize, setEstimatedSize] = useState(0);

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Save segment logic here
      console.log('Saving segment:', { name: segmentName, rules });
      navigate('/marketing/segments');
    },
  });

  const addRule = () => {
    const newRule: SegmentRule = {
      id: Date.now().toString(),
      field: 'email',
      operator: 'contains',
      value: '',
      logic: rules.length === 0 ? 'and' : 'and',
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (ruleId: string, updates: Partial<SegmentRule>) => {
    setRules(rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter((r) => r.id !== ruleId));
  };

  // Calculate estimated segment size
  const calculateEstimate = () => {
    // Simple estimation - in production, this would query the database
    let estimate = contacts.length;

    rules.forEach((rule) => {
      if (rule.operator === 'contains' && rule.value) {
        estimate = Math.floor(estimate * 0.5);
      } else if (rule.operator === 'equals' && rule.value) {
        estimate = Math.floor(estimate * 0.3);
      }
    });

    setEstimatedSize(estimate);
  };

  React.useEffect(() => {
    calculateEstimate();
  }, [rules, contacts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonUntitled
            variant="ghost"
            size="icon"
            onClick={() => navigate('/marketing/segments')}
          >
            <ArrowLeft className="h-4 w-4" />
          </ButtonUntitled>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'New Segment' : 'Edit Segment'}</h1>
            <p className="text-sm text-muted-foreground">
              Define audience segments for targeted campaigns
            </p>
          </div>
        </div>
        <ButtonUntitled onClick={() => saveMutation.mutate()} disabled={!segmentName || rules.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          Save Segment
        </ButtonUntitled>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Segment Details */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Segment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label htmlFor="name">Segment Name</label>
                <InputUntitled
                  id="name"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="e.g., Active Leads"
                />
              </div>
            </CardContent>
          </CardUntitled>

          {/* Rules Builder */}
          <CardUntitled>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Segment Rules</CardTitle>
                <ButtonUntitled variant="outline" size="sm" onClick={addRule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </ButtonUntitled>
              </div>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rules yet. Add your first rule to define the segment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="p-4 border rounded-lg space-y-3">
                      {index > 0 && (
                        <div className="flex items-center gap-2">
                          <BadgeUntitled
                            variant={rule.logic === 'and' ? 'primary' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() =>
                              updateRule(rule.id, { logic: rule.logic === 'and' ? 'or' : 'and' })
                            }
                          >
                            {rule.logic.toUpperCase()}
                          </BadgeUntitled>
                          <span className="text-sm text-muted-foreground">
                            {rule.logic === 'and' ? 'All conditions must match' : 'Any condition can match'}
                          </span>
                        </div>
                      )}

                      <div className="grid gap-3 md:grid-cols-4">
                        <select
                          className="p-2 border rounded bg-background"
                          value={rule.field}
                          onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                        >
                          {FIELD_OPTIONS.map((field) => (
                            <option key={field.value} value={field.value}>
                              {field.label}
                            </option>
                          ))}
                        </select>

                        <select
                          className="p-2 border rounded bg-background"
                          value={rule.operator}
                          onChange={(e) =>
                            updateRule(rule.id, { operator: e.target.value as any })
                          }
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="gt">Greater Than</option>
                          <option value="lt">Less Than</option>
                          <option value="in">In List</option>
                        </select>

                        <InputUntitled
                          placeholder="Value"
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                        />

                        <ButtonUntitled
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </ButtonUntitled>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CardUntitled>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estimate */}
          <CardUntitled>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Estimated Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{estimatedSize.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {rules.length === 0
                  ? 'Add rules to see estimate'
                  : `of ${contacts.length} total contacts`}
              </p>
            </CardContent>
          </CardUntitled>

          {/* Help */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Use AND to narrow your segment</p>
              <p>• Use OR to broaden your segment</p>
              <p>• "Contains" works for text fields</p>
              <p>• "Greater/Less Than" for numbers and dates</p>
            </CardContent>
          </CardUntitled>

          {/* Preview */}
          {rules.length > 0 && (
            <CardUntitled>
              <CardHeader>
                <CardTitle>Segment Query</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {rules
                    .map(
                      (r, i) =>
                        `${i > 0 ? r.logic.toUpperCase() : ''} ${r.field} ${r.operator} "${r.value}"`
                    )
                    .join('\n')}
                </pre>
              </CardContent>
            </CardUntitled>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegmentBuilder;
