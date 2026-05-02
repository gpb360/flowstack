import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const statusValues = ['submitted', 'reviewing', 'brief_ready', 'sprint_proposed', 'closed'] as const;

interface AdminUpdatePayload {
  auditRequestId?: string;
  status?: string;
  internalNotes?: string;
  flowBrief?: Record<string, unknown>;
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

    if (userError || !user?.email) return json({ error: 'Authentication is required' }, 401);
    if (!isAdminEmail(user.email)) return json({ error: 'FlowStack audit admin access is required' }, 403);

    const payload = (await req.json()) as AdminUpdatePayload;
    const auditRequestId = cleanString(payload.auditRequestId);
    const status = enumValue(payload.status, statusValues);
    const internalNotes = cleanString(payload.internalNotes);
    const flowBrief = isPlainObject(payload.flowBrief) ? payload.flowBrief : {};

    if (!auditRequestId) return json({ error: 'Audit request ID is required' }, 400);
    if (!status) return json({ error: 'Valid audit status is required' }, 400);

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) return json({ error: 'Audit service role is not configured' }, 500);

    const adminClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey);

    const { data: existing, error: existingError } = await adminClient
      .from('audit_requests')
      .select('metadata')
      .eq('id', auditRequestId)
      .maybeSingle();

    if (existingError || !existing) return json({ error: 'Audit request was not found' }, 404);

    const updatedAt = new Date().toISOString();
    const metadata = {
      ...(isPlainObject(existing.metadata) ? existing.metadata : {}),
      internalNotes,
      internalReviewedAt: updatedAt,
      internalReviewedBy: user.email,
    };

    const { data: audit, error: updateError } = await adminClient
      .from('audit_requests')
      .update({
        status,
        flow_brief: flowBrief,
        metadata,
        updated_at: updatedAt,
      })
      .eq('id', auditRequestId)
      .select('*')
      .single();

    if (updateError || !audit) {
      return json({ error: updateError?.message ?? 'Audit update failed' }, 400);
    }

    return json({ audit });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected audit admin update error';
    return json({ error: message }, 500);
  }
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const enumValue = <T extends string>(value: unknown, allowed: readonly T[]): T | null => {
  const cleaned = cleanString(value);
  return allowed.includes(cleaned as T) ? cleaned as T : null;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isAdminEmail = (email: string) => {
  const configured = Deno.env.get('FLOWSTACK_ADMIN_EMAILS') ?? '';
  const allowed = configured
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
};
