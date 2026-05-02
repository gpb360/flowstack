import React, { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { TabsWithContent } from '@/components/ui/tabs-untitled';
import { CONTACT_VARIABLES, COMPANY_VARIABLES, SYSTEM_VARIABLES } from '@/lib/marketing';
import type { TemplateVariable } from '@/lib/marketing';

interface TemplateVariablesProps {
  onSelect?: (variable: string) => void;
}

export const TemplateVariables: React.FC<TemplateVariablesProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState('Contact');

  const variableGroups = {
    Contact: CONTACT_VARIABLES,
    Company: COMPANY_VARIABLES,
    System: SYSTEM_VARIABLES,
  };

  const filteredGroups = Object.entries(variableGroups).reduce((acc, [group, variables]) => {
    const filtered = variables.filter((v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as Record<string, TemplateVariable[]>);

  const handleCopy = (variable: string) => {
    const variableString = `{{${variable}}}`;
    navigator.clipboard.writeText(variableString);
    setCopiedVariable(variable);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  const handleSelect = (variable: string) => {
    if (onSelect) {
      onSelect(variable);
    }
  };

  return (
    <CardUntitled>
      <CardHeader>
        <CardTitle>Available Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <InputUntitled
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Variable Groups */}
          <TabsWithContent
            activeTab={activeGroup}
            onTabChange={setActiveGroup}
            fullWidth
            tabs={Object.entries(filteredGroups).map(([group, variables]) => ({
              id: group,
              label: group,
              content: (
                <div className="space-y-2">
                  {variables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-medium">{`{{${variable.name}}}`}</code>
                        {variable.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {variable.description}
                          </p>
                        )}
                        {variable.required && (
                          <BadgeUntitled variant="destructive" className="mt-1 text-xs">
                            Required
                          </BadgeUntitled>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {onSelect && (
                          <ButtonUntitled
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelect(variable.name)}
                          >
                            Insert
                          </ButtonUntitled>
                        )}
                        <ButtonUntitled
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(variable.name)}
                        >
                          {copiedVariable === variable.name ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </ButtonUntitled>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            }))}
          />

          {/* Help Text */}
          <div className="p-3 bg-muted rounded">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Use variables to personalize your templates. They will be
              replaced with actual data when sent.
            </p>
          </div>
        </div>
      </CardContent>
    </CardUntitled>
  );
};

export default TemplateVariables;
