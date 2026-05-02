import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const INTAKE_VERSION = 'audit_mvp_v1';

const businessTypes = [
  'creator_solo',
  'agency_marketing',
  'saas_software',
  'local_service',
  'corporate_internal',
  'consulting_services',
  'other',
] as const;

const teamSizeRanges = ['unknown', 'solo', '2_10', '11_50', '51_200', '201_1000', '1000_plus'] as const;
const spendRanges = ['unknown', 'under_500', '500_2000', '2000_10000', '10000_plus'] as const;
const urgencyValues = ['exploring', 'this_month', 'this_week', 'urgent'] as const;

interface AuditDraftPayload {
  focus?: string[];
  businessType?: string;
  teamSizeRange?: string;
  monthlyToolSpendRange?: string;
  urgency?: string;
  businessName?: string;
  websiteUrl?: string;
  currentPain?: string;
  tools?: string[];
  projectSignals?: string[];
  desiredOutcome?: string;
  contactEmail?: string;
  consentToContact?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SubmitAuditPayload {
  organizationId?: string | null;
  draft?: AuditDraftPayload;
}

interface EmailResult {
  sent: boolean;
  provider?: string;
  id?: string | null;
  skippedReason?: string;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authentication is required' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return json({ error: 'Authentication is required' }, 401);
    }

    const payload = (await req.json()) as SubmitAuditPayload;
    const draft = payload.draft;
    const organizationId = cleanString(payload.organizationId);

    if (!draft) return json({ error: 'Audit draft is required' }, 400);

    const focus = cleanStringArray(draft.focus);
    const tools = cleanStringArray(draft.tools);
    const projectSignals = cleanStringArray(draft.projectSignals);
    const currentPain = cleanString(draft.currentPain);
    const desiredOutcome = cleanString(draft.desiredOutcome);
    const businessName = cleanString(draft.businessName);
    const websiteUrl = cleanString(draft.websiteUrl);
    const contactEmail = cleanString(draft.contactEmail) || user.email || '';
    const businessType = enumValue(draft.businessType, businessTypes);
    const teamSizeRange = enumValue(draft.teamSizeRange, teamSizeRanges) ?? 'unknown';
    const monthlyToolSpendRange = enumValue(draft.monthlyToolSpendRange, spendRanges) ?? 'unknown';
    const urgency = enumValue(draft.urgency, urgencyValues) ?? 'exploring';

    if (focus.length === 0) return json({ error: 'Select at least one audit focus' }, 400);
    if (!businessType) return json({ error: 'Select the kind of flow we are looking at' }, 400);
    if (currentPain.length < 10) return json({ error: 'Describe the flow you want us to understand' }, 400);

    if (organizationId) {
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError || !membership) {
        return json({ error: 'You do not have access to this organization' }, 403);
      }
    }

    const submittedAt = new Date().toISOString();
    const metadata = {
      tools,
      projectSignals,
      businessType,
      teamSizeRange,
      monthlyToolSpendRange,
      urgency,
      intakeVersion: INTAKE_VERSION,
      consentToContact: Boolean(draft.consentToContact),
      sourceDraftCreatedAt: draft.createdAt ?? null,
      sourceDraftUpdatedAt: draft.updatedAt ?? null,
    };

    const { data: auditRequest, error: auditError } = await supabase
      .from('audit_requests')
      .insert({
        organization_id: organizationId || null,
        user_id: user.id,
        contact_email: contactEmail,
        business_name: businessName,
        website_url: websiteUrl,
        focus,
        current_pain: currentPain,
        desired_outcome: desiredOutcome,
        status: 'submitted',
        source: 'audit_intake_page',
        flow_brief: {},
        metadata,
        submitted_at: submittedAt,
      })
      .select('id')
      .single();

    if (auditError || !auditRequest) {
      return json({ error: auditError?.message ?? 'Failed to create audit request' }, 400);
    }

    const answers = [
      answer(auditRequest.id, 'focus', focus),
      answer(auditRequest.id, 'business_type', businessType),
      answer(auditRequest.id, 'team_size_range', teamSizeRange),
      answer(auditRequest.id, 'monthly_tool_spend_range', monthlyToolSpendRange),
      answer(auditRequest.id, 'urgency', urgency),
      answer(auditRequest.id, 'tools', tools),
      answer(auditRequest.id, 'project_signals', projectSignals),
      answer(auditRequest.id, 'current_pain', currentPain),
      answer(auditRequest.id, 'desired_outcome', desiredOutcome),
      answer(auditRequest.id, 'contact', {
        email: contactEmail,
        businessName,
        websiteUrl,
        consentToContact: Boolean(draft.consentToContact),
      }),
    ];

    const { error: answersError } = await supabase.from('audit_answers').insert(answers);

    if (answersError) {
      return json({ error: answersError.message, auditRequestId: auditRequest.id }, 400);
    }

    const emailInput = {
      auditRequestId: auditRequest.id,
      contactEmail,
      businessName,
      websiteUrl,
      focus,
      tools,
      projectSignals,
      businessType,
      teamSizeRange,
      monthlyToolSpendRange,
      urgency,
      currentPain,
      desiredOutcome,
      submittedAt,
    };

    const notification = {
      internal: await notifyInternalAuditSubmission(emailInput),
      customer: await notifyCustomerAuditSubmission(emailInput),
    };

    return json({ auditRequestId: auditRequest.id, notification });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected audit submission error';
    return json({ error: message }, 500);
  }
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const cleanStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.map(item => cleanString(item)).filter(Boolean).slice(0, 100)
    : [];

const enumValue = <T extends string>(value: unknown, allowed: readonly T[]): T | null => {
  const cleaned = cleanString(value);
  return allowed.includes(cleaned as T) ? cleaned as T : null;
};

const answer = (auditRequestId: string, questionKey: string, value: unknown) => ({
  audit_request_id: auditRequestId,
  question_key: questionKey,
  answer: { value },
});

const notifyInternalAuditSubmission = async (input: AuditEmailInput): Promise<EmailResult> => {
  const notificationTo = Deno.env.get('AUDIT_NOTIFICATION_TO');
  if (!notificationTo) {
    return { sent: false, skippedReason: 'AUDIT_NOTIFICATION_TO is not configured' };
  }

  const subjectName = input.businessName || input.contactEmail || 'New audit request';

  return sendEmail({
    to: notificationTo,
    subject: `New FlowStack audit: ${subjectName}`,
    html: renderInternalAuditNotification(input),
    idempotencyKey: `audit-request/${input.auditRequestId}/internal`,
  });
};

const notifyCustomerAuditSubmission = async (input: AuditEmailInput): Promise<EmailResult> => {
  if (!input.contactEmail) {
    return { sent: false, skippedReason: 'No customer email was provided' };
  }

  const subjectName = input.businessName ? ` for ${input.businessName}` : '';

  return sendEmail({
    to: input.contactEmail,
    subject: `FlowStack received your audit${subjectName}`,
    html: renderCustomerAuditConfirmation(input),
    idempotencyKey: `audit-request/${input.auditRequestId}/customer`,
  });
};

const sendEmail = async (input: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
}): Promise<EmailResult> => {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    return { sent: false, skippedReason: 'RESEND_API_KEY is not configured' };
  }

  const from = Deno.env.get('RESEND_AUDIT_FROM') ?? 'FlowStack <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
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

interface AuditEmailInput {
  auditRequestId: string;
  contactEmail: string;
  businessName: string;
  websiteUrl: string;
  focus: string[];
  tools: string[];
  projectSignals: string[];
  businessType: string;
  teamSizeRange: string;
  monthlyToolSpendRange: string;
  urgency: string;
  currentPain: string;
  desiredOutcome: string;
  submittedAt: string;
}

const renderInternalAuditNotification = (input: AuditEmailInput) => `
  <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <h1 style="font-size: 22px; margin: 0 0 12px;">New FlowStack audit request</h1>
    <p style="margin: 0 0 16px;">A new audit intake was submitted on ${escapeHtml(input.submittedAt)}.</p>
    ${field('Audit ID', input.auditRequestId)}
    ${field('Business', input.businessName)}
    ${field('Contact email', input.contactEmail)}
    ${field('Website', input.websiteUrl)}
    ${field('Business type', input.businessType)}
    ${field('Team size', input.teamSizeRange)}
    ${field('Monthly tool spend', input.monthlyToolSpendRange)}
    ${field('Urgency', input.urgency)}
    ${field('Focus', input.focus.join(', '))}
    ${field('Tools', input.tools.join(', '))}
    ${field('Signals', input.projectSignals.join(', '))}
    ${field('Desired outcome', input.desiredOutcome)}
    <h2 style="font-size: 16px; margin: 20px 0 8px;">Current flow context</h2>
    <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(input.currentPain)}</p>
  </div>
`;

const renderCustomerAuditConfirmation = (input: AuditEmailInput) => `
  <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <h1 style="font-size: 22px; margin: 0 0 12px;">Your FlowStack audit is saved</h1>
    <p style="margin: 0 0 16px;">
      We received your audit request${input.businessName ? ` for ${escapeHtml(input.businessName)}` : ''}.
      Your first preview is directional and based only on the information submitted.
    </p>
    ${field('Audit ID', input.auditRequestId)}
    ${field('Primary focus', input.focus.join(', '))}
    ${field('Urgency', input.urgency)}
    <p style="margin: 16px 0 0;">
      The next step is a human-reviewed Flow Brief or a free review call if you want to talk through the flow first.
    </p>
  </div>
`;

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
