import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { calculateSMSCost, truncateForSMS } from '@/lib/marketing';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import { CardUntitled, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import type { Database } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row'] & Record<string, any>;

export const SMSBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { organizationId } = useAuth();
  const isNew = !id;

  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['marketing-campaign', id, organizationId],
    queryFn: async () => {
      if (!id || !organizationId) return null;
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

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const payload = {
        name: `SMS Campaign - ${new Date().toLocaleDateString()}`,
        organization_id: organizationId,
        type: 'sms' as const,
        status: 'draft' as const,
        content: message,
        scheduled_at: scheduledAt || null,
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
      navigate('/marketing/sms');
    },
  });

  const costInfo = calculateSMSCost(message);

  if (isLoading && id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonUntitled
            variant="ghost"
            size="icon"
            onClick={() => navigate('/marketing/sms')}
          >
            <ArrowLeft className="h-4 w-4" />
          </ButtonUntitled>
          <div>
            <h1 className="text-2xl font-bold">{isNew ? 'New SMS Campaign' : 'Edit SMS'}</h1>
            <p className="text-sm text-muted-foreground">
              Create and send SMS messages to your contacts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonUntitled
            variant="outline"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !message}
          >
            <Clock className="mr-2 h-4 w-4" />
            Save Draft
          </ButtonUntitled>
          <ButtonUntitled
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !message}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Now
          </ButtonUntitled>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CardUntitled>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="message">Message</label>
                <TextareaUntitled
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your SMS message here..."
                  rows={6}
                  maxLength={1600}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{message.length} / 1600 characters</span>
                  <span>{costInfo.segments} segment(s)</span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="schedule">Schedule (optional)</label>
                <InputUntitled
                  id="schedule"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            </CardContent>
          </CardUntitled>
        </div>

        <div className="space-y-6">
          <CardUntitled>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Characters</p>
                <p className="text-2xl font-bold">{message.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Segments</p>
                <p className="text-2xl font-bold">{costInfo.segments}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
                <p className="text-2xl font-bold">
                  ${costInfo.estimatedCostUSD.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground">per recipient</p>
              </div>
            </CardContent>
          </CardUntitled>

          <CardUntitled>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-muted">
                <p className="text-sm whitespace-pre-wrap">{message || 'Your message here...'}</p>
              </div>
            </CardContent>
          </CardUntitled>
        </div>
      </div>
    </div>
  );
};

export default SMSBuilder;
