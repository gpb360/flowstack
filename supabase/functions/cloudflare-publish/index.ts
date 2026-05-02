/**
 * Supabase Edge Function: Cloudflare Pages Publishing Proxy
 *
 * Securely proxies requests to the Cloudflare Pages API.
 * Holds the API token server-side — never exposes it to the client.
 *
 * POST /functions/v1/cloudflare-publish
 *
 * Headers:
 *   Authorization: Bearer <supabase_jwt>
 *
 * Body:
 *   {
 *     action: 'create-project' | 'get-project' | 'deploy' | 'list-deployments' | 'delete-deployment',
 *     projectName?: string,
 *     deploymentId?: string,
 *     files?: Array<{ path: string, content: string }>,
 *     branch?: string
 *   }
 *
 * Environment Variables (set via supabase secrets):
 *   CLOUDFLARE_API_TOKEN — Cloudflare API token with Pages:Edit permission
 *   CLOUDFLARE_ACCOUNT_ID — Cloudflare account ID
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

// ============================================================================
// HELPERS
// ============================================================================

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

async function cfFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const url = `${CF_API_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData — browser/fetch sets the boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({ success: false, errors: [{ message: 'Invalid JSON response' }] }));
  return { ok: res.ok, status: res.status, data };
}

// ============================================================================
// ACTIONS
// ============================================================================

async function createProject(
  accountId: string,
  token: string,
  projectName: string
) {
  // Try to get the existing project first
  const existing = await cfFetch(
    `/accounts/${accountId}/pages/projects/${projectName}`,
    token,
    { method: 'GET' }
  );

  if (existing.ok && existing.data?.result) {
    return { success: true, data: existing.data.result };
  }

  // Create a new Direct Upload project
  const result = await cfFetch(
    `/accounts/${accountId}/pages/projects`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        name: projectName,
        production_branch: 'main',
      }),
    }
  );

  if (!result.ok) {
    const errMsg =
      result.data?.errors?.[0]?.message || `HTTP ${result.status}`;
    // Project might already exist (race condition)
    if (result.status === 409 || errMsg.includes('already exists')) {
      const retry = await cfFetch(
        `/accounts/${accountId}/pages/projects/${projectName}`,
        token,
        { method: 'GET' }
      );
      if (retry.ok && retry.data?.result) {
        return { success: true, data: retry.data.result };
      }
    }
    return { success: false, error: errMsg };
  }

  return { success: true, data: result.data.result };
}

async function getProject(
  accountId: string,
  token: string,
  projectName: string
) {
  const result = await cfFetch(
    `/accounts/${accountId}/pages/projects/${projectName}`,
    token,
    { method: 'GET' }
  );

  if (!result.ok) {
    return {
      success: false,
      error: result.data?.errors?.[0]?.message || `HTTP ${result.status}`,
    };
  }

  return { success: true, data: result.data.result };
}

async function deploy(
  accountId: string,
  token: string,
  projectName: string,
  files: Array<{ path: string; content: string }>,
  branch = 'main'
) {
  // Cloudflare Pages Direct Upload uses multipart form data.
  // Each file is a separate form field with the path as the key.
  const formData = new FormData();

  for (const file of files) {
    const blob = new Blob([file.content], { type: getMimeType(file.path) });
    formData.append(file.path, blob, file.path);
  }

  // The branch is sent as a form field
  formData.append('branch', branch);

  const url = `/accounts/${accountId}/pages/projects/${projectName}/deployments`;

  const res = await fetch(`${CF_API_BASE}${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type — FormData sets it with the boundary
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({
    success: false,
    errors: [{ message: 'Invalid JSON response from Cloudflare' }],
  }));

  if (!res.ok) {
    return {
      success: false,
      error: data?.errors?.[0]?.message || `Deployment failed: HTTP ${res.status}`,
    };
  }

  return { success: true, data: data.result };
}

async function listDeployments(
  accountId: string,
  token: string,
  projectName: string
) {
  const result = await cfFetch(
    `/accounts/${accountId}/pages/projects/${projectName}/deployments?per_page=20`,
    token,
    { method: 'GET' }
  );

  if (!result.ok) {
    return {
      success: false,
      error: result.data?.errors?.[0]?.message || `HTTP ${result.status}`,
    };
  }

  return { success: true, data: result.data.result || [] };
}

async function deleteDeployment(
  accountId: string,
  token: string,
  projectName: string,
  deploymentId: string
) {
  const result = await cfFetch(
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}`,
    token,
    { method: 'DELETE' }
  );

  if (!result.ok) {
    return {
      success: false,
      error: result.data?.errors?.[0]?.message || `HTTP ${result.status}`,
    };
  }

  return { success: true, data: null };
}

// ============================================================================
// MIME TYPES
// ============================================================================

function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    ico: 'image/x-icon',
    txt: 'text/plain',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ------------------------------------------------------------------
    // Auth: Verify Supabase JWT
    // ------------------------------------------------------------------
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse('Missing authorization header', 401);
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: userData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !userData?.user) {
      return errorResponse('Invalid or expired token', 401);
    }

    // ------------------------------------------------------------------
    // Load Cloudflare credentials
    // ------------------------------------------------------------------
    const cfToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cfAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');

    if (!cfToken || !cfAccountId) {
      return errorResponse(
        'Cloudflare credentials not configured. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in Supabase secrets.',
        500
      );
    }

    // ------------------------------------------------------------------
    // Parse request
    // ------------------------------------------------------------------
    const body = await req.json();
    const { action, projectName, deploymentId, files, branch } = body;

    if (!action) {
      return errorResponse('Missing "action" in request body');
    }

    // ------------------------------------------------------------------
    // Dispatch
    // ------------------------------------------------------------------
    let result;

    switch (action) {
      case 'create-project':
        if (!projectName) return errorResponse('Missing projectName');
        result = await createProject(cfAccountId, cfToken, projectName);
        break;

      case 'get-project':
        if (!projectName) return errorResponse('Missing projectName');
        result = await getProject(cfAccountId, cfToken, projectName);
        break;

      case 'deploy':
        if (!projectName) return errorResponse('Missing projectName');
        if (!files || !Array.isArray(files) || files.length === 0) {
          return errorResponse('Missing or empty files array');
        }
        result = await deploy(
          cfAccountId,
          cfToken,
          projectName,
          files,
          branch || 'main'
        );
        break;

      case 'list-deployments':
        if (!projectName) return errorResponse('Missing projectName');
        result = await listDeployments(cfAccountId, cfToken, projectName);
        break;

      case 'delete-deployment':
        if (!projectName) return errorResponse('Missing projectName');
        if (!deploymentId) return errorResponse('Missing deploymentId');
        result = await deleteDeployment(
          cfAccountId,
          cfToken,
          projectName,
          deploymentId
        );
        break;

      default:
        return errorResponse(`Unknown action: ${action}`);
    }

    return jsonResponse(result, result.success ? 200 : 400);
  } catch (err) {
    console.error('cloudflare-publish error:', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return errorResponse(message, 500);
  }
});
