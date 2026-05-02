import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Save, Eye, Code, Type, Image, AlignLeft, Grid3x3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { renderTemplate, extractVariables, ALL_VARIABLES } from '@/lib/marketing';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import { CardUntitled, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { TabsWithContent } from '@/components/ui/tabs-untitled';
import { useAuth } from '@/context/AuthContext';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['email', 'sms']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

type TemplateFormData = z.infer<typeof templateSchema>;
type EditorTab = 'visual' | 'code' | 'preview';

interface Block {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer';
  content?: string;
  styles?: Record<string, string>;
}

export const TemplateEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { organizationId } = useAuth();
  const isNew = !id;

  const [activeTab, setActiveTab] = useState<EditorTab>('visual');
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Fetch template if editing
  const { data: template, isLoading } = useQuery({
    queryKey: ['marketing-template', id, organizationId],
    queryFn: async () => {
      if (!id || !organizationId) return null;
      const { data, error } = await supabase
        .from('marketing_templates')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!organizationId,
  });

  // Initialize form with template data
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template || {
      name: '',
      type: 'email',
      subject: '',
      content: '',
    },
  });

  const watchedType = form.watch('type');

  useEffect(() => {
    if (template) {
      form.reset(template);
    }
  }, [template, form]);

  // Save template mutation
  const saveMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      // Extract variables from content
      const variables = extractVariables(data.content || '');

      const payload = {
        ...data,
        organization_id: organizationId,
        variables: variables.map(v => ({
          name: v,
          defaultValue: '',
        })),
      };

      if (id) {
        const { error } = await supabase
          .from('marketing_templates')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('marketing_templates')
          .insert(payload);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      navigate('/marketing/templates');
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    saveMutation.mutate(data);
  };

  // Add block to template
  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: '',
    };

    switch (type) {
      case 'text':
        newBlock.content = '<p>Your text here</p>';
        break;
      case 'image':
        newBlock.content = '<img src="/placeholder-image.svg" alt="Image" />';
        break;
      case 'button':
        newBlock.content = '<a href="https://example.com" style="padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">Click Here</a>';
        break;
      case 'divider':
        newBlock.content = '<hr style="border: none; border-top: 1px solid #e5e7eb;" />';
        break;
      case 'spacer':
        newBlock.content = '<div style="height: 20px;"></div>';
        break;
    }

    setBlocks([...blocks, newBlock]);
  };

  // Update block content
  const updateBlock = (blockId: string, content: string) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, content } : b));
  };

  // Remove block
  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    const content = form.getValues('content') || '';
    const variableString = `{{${variable}}}`;
    form.setValue('content', content + variableString);
  };

  const handleTabChange = (value: string) => {
    if (value === 'visual' || value === 'code' || value === 'preview') {
      setActiveTab(value);
    }
  };

  // Render preview
  const renderPreview = () => {
    const content = form.getValues('content') || '';
    const sampleData = {
      contact: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      },
      company: {
        name: 'Acme Corp',
      },
      organization: {
        name: 'My Organization',
      },
      today: new Date().toLocaleDateString(),
    };

    try {
      return renderTemplate(content, sampleData);
    } catch {
      return content;
    }
  };

  if (isLoading && id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonUntitled
            variant="ghost"
            size="icon"
            onClick={() => navigate('/marketing/templates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </ButtonUntitled>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? 'New Template' : template?.name || 'Edit Template'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isNew ? 'Create a new template' : 'Edit your template'}
            </p>
          </div>
        </div>
        <ButtonUntitled
          onClick={() => form.handleSubmit(onSubmit)()}
          disabled={saveMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Template
        </ButtonUntitled>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Details */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name">Template Name</label>
                  <InputUntitled
                    id="name"
                    {...form.register('name')}
                    placeholder="e.g., Welcome Email"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="type">Type</label>
                  <div className="flex bg-muted p-1 rounded">
                    <button
                      type="button"
                      onClick={() => form.setValue('type', 'email')}
                      className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                        watchedType === 'email' ? 'bg-background' : ''
                      }`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => form.setValue('type', 'sms')}
                      className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                        watchedType === 'sms' ? 'bg-background' : ''
                      }`}
                    >
                      SMS
                    </button>
                  </div>
                </div>
              </div>

              {watchedType === 'email' && (
                <div className="space-y-2">
                  <label htmlFor="subject">Subject Line</label>
                  <InputUntitled
                    id="subject"
                    {...form.register('subject')}
                    placeholder="e.g., Welcome to {{organization.name}}!"
                  />
                </div>
              )}
            </CardContent>
          </CardUntitled>

          {/* Content Editor */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsWithContent
                activeTab={activeTab}
                onTabChange={handleTabChange}
                tabs={[
                  {
                    id: 'visual',
                    label: 'Visual',
                    icon: Grid3x3,
                    content: (
                      <div className="space-y-4">
                        {/* Block Controls */}
                        <div className="flex gap-2 flex-wrap">
                          <ButtonUntitled
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock('text')}
                          >
                            <Type className="mr-2 h-4 w-4" />
                            Text
                          </ButtonUntitled>
                          <ButtonUntitled
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock('image')}
                          >
                            <Image className="mr-2 h-4 w-4" />
                            Image
                          </ButtonUntitled>
                          <ButtonUntitled
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock('button')}
                          >
                            <AlignLeft className="mr-2 h-4 w-4" />
                            Button
                          </ButtonUntitled>
                          <ButtonUntitled
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock('divider')}
                          >
                            Divider
                          </ButtonUntitled>
                          <ButtonUntitled
                            variant="outline"
                            size="sm"
                            onClick={() => addBlock('spacer')}
                          >
                            Spacer
                          </ButtonUntitled>
                        </div>

                        {/* Blocks List */}
                        <div className="space-y-2">
                          {blocks.map((block) => (
                            <div
                              key={block.id}
                              className="p-3 border rounded group hover:bg-muted/50"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <BadgeUntitled variant="outline" className="capitalize">
                                  {block.type}
                                </BadgeUntitled>
                                <ButtonUntitled
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBlock(block.id)}
                                  className="opacity-0 group-hover:opacity-100"
                                >
                                  Remove
                                </ButtonUntitled>
                              </div>
                              <TextareaUntitled
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, e.target.value)}
                                className="font-mono text-sm"
                                rows={3}
                              />
                            </div>
                          ))}
                          {blocks.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              Add blocks to build your template
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'code',
                    label: 'Code',
                    icon: Code,
                    content: (
                      <TextareaUntitled
                        {...form.register('content')}
                        placeholder={watchedType === 'email' ? '<html>...</html>' : 'Your SMS message'}
                        className="font-mono text-sm min-h-[400px]"
                      />
                    ),
                  },
                  {
                    id: 'preview',
                    label: 'Preview',
                    icon: Eye,
                    content: (
                      <div
                        className="p-4 border rounded bg-white min-h-[400px]"
                        dangerouslySetInnerHTML={{ __html: renderPreview() }}
                      />
                    ),
                  },
                ]}
              />
            </CardContent>
          </CardUntitled>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Click to insert variables into your template
              </p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {ALL_VARIABLES.map((variable) => (
                  <button
                    key={variable.name}
                    type="button"
                    onClick={() => insertVariable(variable.name)}
                    className="w-full text-left p-2 hover:bg-muted rounded transition-colors"
                  >
                    <code className="text-sm">{`{{${variable.name}}}`}</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      {variable.description}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </CardUntitled>

          {/* Detected Variables */}
          <CardUntitled>
            <CardHeader>
              <CardTitle>Detected Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {extractVariables(form.getValues('content') || '').map((variable) => (
                  <BadgeUntitled key={variable} variant="secondary">
                    {variable}
                  </BadgeUntitled>
                ))}
                {extractVariables(form.getValues('content') || '').length === 0 && (
                  <p className="text-sm text-muted-foreground">No variables detected</p>
                )}
              </div>
            </CardContent>
          </CardUntitled>

          {/* Character Count for SMS */}
          {watchedType === 'sms' && (
            <CardUntitled>
              <CardHeader>
                <CardTitle>Message Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Characters</span>
                    <span className="text-sm font-medium">
                      {(form.getValues('content') || '').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Segments</span>
                    <span className="text-sm font-medium">
                      {Math.ceil((form.getValues('content') || '').length / 160)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </CardUntitled>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
