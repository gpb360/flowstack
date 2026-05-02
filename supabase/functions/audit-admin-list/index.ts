import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const urgencyRank: Record<string, number> = {
  urgent: 0,
  this_week: 1,
  this_month: 2,
  exploring: 3,
};

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

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceRoleKey) return json({ error: 'Audit service role is not configured' }, 500);

    const adminClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey);
    const { data, error } = await adminClient
      .from('audit_requests')
      .select('*')
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .limit(100);

    if (error) return json({ error: error.message }, 400);

    const audits = (data ?? []).sort((a, b) => {
      const aUrgency = metadataValue(a.metadata, 'urgency');
      const bUrgency = metadataValue(b.metadata, 'urgency');
      const rankDiff = (urgencyRank[aUrgency] ?? 9) - (urgencyRank[bUrgency] ?? 9);
      if (rankDiff !== 0) return rankDiff;
      return new Date(b.submitted_at ?? b.created_at).getTime() - new Date(a.submitted_at ?? a.created_at).getTime();
    });

    return json({ audits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected audit admin list error';
    return json({ error: message }, 500);
  }
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const isAdminEmail = (email: string) => {
  const configured = Deno.env.get('FLOWSTACK_ADMIN_EMAILS') ?? '';
  const allowed = configured
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email.trim().toLowerCase());
};

const metadataValue = (metadata: unknown, key: string) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return '';
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
};
