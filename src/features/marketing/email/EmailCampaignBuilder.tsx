import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Save, Send, Clock, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { TabsWithContent } from '@/components/ui/tabs-untitled';
import type { Database } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row'] & Record<string, any>;
type Template = Database['public']['Tables']['marketing_templates']['Row'] & Record<string, any>;

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  template_id: z.string().uuid().optional(),
  scheduled_at: z.string().optional(),
  audience_filters: z.record(z.string(), z.any()).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export const EmailCampaignBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { organizationId } = useAuth();
  const isNew = !id;

  const [selectedTab, setSelectedTab] = useState<'details' | 'content' | 'audience' | 'review'>('details');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch campaign if editing
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['marketing-campaign', id, organizationId],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!organizationId,
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ['marketing-templates', 'email', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_templates')
        .select('*')
        .eq('type', 'email')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: campaign || {
      name: '',
      template_id: undefined,
      scheduled_at: undefined,
      audience_filters: {},
    },
  });

  // Save campaign mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const payload = {
        ...data,
        organization_id: organizationId,
        type: 'email' as const,
        status: 'draft' as const,
        template_id: data.template_id || null,
      };

      if (id) {
        const { error } = await supabase
          .from('marketing_campaigns')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('marketing_campaigns')
          .insert(payload);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      navigate('/marketing/email');
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    saveMutation.mutate(data);
  };

  const handleSendNow = () => {
    form.setValue('scheduled_at', undefined);
    saveMutation.mutate({
      ...form.getValues(),
      status: 'sending',
    } as any);
  };

  const handleSchedule = () => {
    saveMutation.mutate({
      ...form.getValues(),
      status: 'scheduled',
    } as any);
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
            size="sm"
            onClick={() => navigate('/marketing/email')}
          >
            <ArrowLeft className="w-4 h-4" />
          </ButtonUntitled>
          <div>
            <h1 className="text-xl font-medium text-white">
              {isNew ? 'New Email Campaign' : campaign?.name || 'Edit Campaign'}
            </h1>
            <p className="text-sm text-[#6b7280]">
              {isNew ? 'Create a new email campaign' : 'Edit your email campaign'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={saveMutation.isPending}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft
          </ButtonUntitled>
          <ButtonUntitled
            variant="primary"
            size="sm"
            onClick={handleSendNow}
            disabled={saveMutation.isPending}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Now
          </ButtonUntitled>
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={handleSchedule}
            disabled={saveMutation.isPending}
            leftIcon={<Clock className="w-4 h-4" />}
          >
            Schedule
          </ButtonUntitled>
        </div>
      </div>

      <TabsWithContent
        activeTab={selectedTab}
        onTabChange={(v) => setSelectedTab(v as any)}
        tabs={[
          {
            id: 'details',
            label: 'Details',
            content: (
              <div className="space-y-4">
                <CardUntitled title="Campaign Details">
                  <div className="space-y-4">
                    <InputUntitled
                      label="Campaign Name"
                      id="name"
                      {...form.register('name')}
                      placeholder="e.g., Monthly Newsletter"
                      state={form.formState.errors.name ? 'error' : 'default'}
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-red-400">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                </CardUntitled>
              </div>
            ),
          },
          {
            id: 'content',
            label: 'Content',
            content: (
              <div className="space-y-4">
                <CardUntitled title="Select Template">
                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          "rounded-lg border p-4 cursor-pointer transition-colors",
                          selectedTemplate?.id === template.id
                            ? "border-[#d4af37]/40 bg-[#d4af37]/5"
                            : "border-[#2a2d35] hover:border-[#4b5563]"
                        )}
                        onClick={() => {
                          setSelectedTemplate(template);
                          form.setValue('template_id', template.id);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-white">{template.name}</h3>
                            <p className="text-xs text-[#6b7280]">
                              {template.subject || 'No subject'}
                            </p>
                          </div>
                          <BadgeUntitled variant="secondary">Email</BadgeUntitled>
                        </div>
                      </div>
                    ))}
                  </div>
                  {templates.length === 0 && (
                    <div className="text-center py-8 text-[#4b5563] text-sm">
                      No templates found. Create one first.
                    </div>
                  )}
                </CardUntitled>

                {selectedTemplate && (
                  <CardUntitled title="Preview">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-[#6b7280]">Subject</label>
                        <p className="text-sm font-medium text-white">{selectedTemplate.subject}</p>
                      </div>
                      <div>
                        <label className="text-xs text-[#6b7280]">Body</label>
                        <div
                          className="mt-2 p-4 border border-[#2a2d35] rounded-lg bg-[#0c0d0e]"
                          dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                        />
                      </div>
                    </div>
                  </CardUntitled>
                )}
              </div>
            ),
          },
          {
            id: 'audience',
            label: 'Audience',
            content: (
              <CardUntitled title="Target Audience">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#6b7280]">Recipients</label>
                    <p className="text-sm text-[#4b5563] mt-1">
                      Define who will receive this campaign
                    </p>
                    <div className="p-4 border border-dashed border-[#2a2d35] rounded-lg text-center text-[#4b5563] text-sm mt-3">
                      Segment selector coming soon
                    </div>
                  </div>
                </div>
              </CardUntitled>
            ),
          },
          {
            id: 'review',
            label: 'Review',
            content: (
              <CardUntitled title="Campaign Review">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#6b7280]">Campaign Name</label>
                    <p className="text-sm font-medium text-white">{form.watch('name')}</p>
                  </div>
                  {selectedTemplate && (
                    <>
                      <div>
                        <label className="text-xs text-[#6b7280]">Template</label>
                        <p className="text-sm font-medium text-white">{selectedTemplate.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-[#6b7280]">Subject</label>
                        <p className="text-sm font-medium text-white">{selectedTemplate.subject}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardUntitled>
            ),
          },
        ]}
      />
    </div>
  );
};

export default EmailCampaignBuilder;
