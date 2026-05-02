import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriorityPayload {
  auditRequestId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authentication is required' }, 401);

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) return json({ error: 'Authentication is required' }, 401);

    const payload = (await req.json()) as PriorityPayload;
    const auditRequestId = cleanString(payload.auditRequestId);
    if (!auditRequestId) return json({ error: 'Audit request ID is required' }, 400);

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) return json({ error: 'Audit service role is not configured' }, 500);

    const adminClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey);

    const { data: audit, error: auditError } = await adminClient
      .from('audit_requests')
      .select('*')
      .eq('id', auditRequestId)
      .maybeSingle();

    if (auditError || !audit) return json({ error: 'Audit request was not found' }, 404);
    if (audit.user_id !== user.id) return json({ error: 'You do not have access to this audit' }, 403);

    const requestedAt = new Date().toISOString();
    const metadata = {
      ...(isPlainObject(audit.metadata) ? audit.metadata : {}),
      priorityAuditRequestedAt: requestedAt,
      priorityAuditRequestedBy: user.id,
    };

    const { error: updateError } = await adminClient
      .from('audit_requests')
      .update({ metadata, updated_at: requestedAt })
      .eq('id', auditRequestId);

    if (updateError) return json({ error: updateError.message }, 400);

    const notification = await notifyPriorityRequest({
      auditRequestId,
      businessName: cleanString(audit.business_name),
      contactEmail: cleanString(audit.contact_email) || user.email || '',
      requestedAt,
    });

    return json({ auditRequestId, requestedAt, notification });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected priority audit error';
    return json({ error: message }, 500);
  }
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const notifyPriorityRequest = async (input: {
  auditRequestId: string;
  businessName: string;
  contactEmail: string;
  requestedAt: string;
}) => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const notificationTo = Deno.env.get('AUDIT_NOTIFICATION_TO');

  if (!resendApiKey || !notificationTo) {
    return { sent: false, skippedReason: 'RESEND_API_KEY or AUDIT_NOTIFICATION_TO is not configured' };
  }

  const from = Deno.env.get('RESEND_AUDIT_FROM') ?? 'FlowStack <onboarding@resend.dev>';
  const subjectName = input.businessName || input.contactEmail || input.auditRequestId;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `audit-request/${input.auditRequestId}/priority`,
    },
    body: JSON.stringify({
      from,
      to: [notificationTo],
      subject: `Priority Flow Audit requested: ${subjectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h1 style="font-size: 22px; margin: 0 0 12px;">Priority Flow Audit requested</h1>
          ${field('Audit ID', input.auditRequestId)}
          ${field('Business', input.businessName)}
          ${field('Contact email', input.contactEmail)}
          ${field('Requested at', input.requestedAt)}
        </div>
      `,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      sent: false,
      provider: 'resend',
      error: typeof data?.message === 'string' ? data.message : 'Resend notification failed',
    };
  }

  return { sent: true, provider: 'resend', id: data?.id ?? null };
};

const field = (label: string, value: string) =>
  value
    ? `<p style="margin: 0 0 8px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
    : '';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
