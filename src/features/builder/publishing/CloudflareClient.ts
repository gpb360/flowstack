// ============================================================================
// CLOUDFLARE PAGES API CLIENT
// Communicates with Cloudflare Pages through a Supabase Edge Function proxy.
// The edge function holds the API token; this client never sees it.
// ============================================================================

import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface CloudflareProject {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  created_on: string;
  production_branch: string;
}

export interface CloudflareDeployment {
  id: string;
  url: string;
  environment: 'production' | 'preview';
  created_on: string;
  project_name: string;
  production_branch: string;
  aliases: string[];
}

export interface CloudflarePublishResult {
  success: boolean;
  deployment?: CloudflareDeployment;
  project?: CloudflareProject;
  url?: string;
  error?: string;
}

export interface DeploymentFile {
  /** Relative path, e.g. "index.html" or "about/index.html" */
  path: string;
  /** File content as a string */
  content: string;
}

type ProxyAction =
  | 'create-project'
  | 'deploy'
  | 'list-deployments'
  | 'delete-deployment'
  | 'get-project';

interface ProxyRequest {
  action: ProxyAction;
  projectName?: string;
  deploymentId?: string;
  files?: Array<{ path: string; content: string }>;
  branch?: string;
}

interface ProxyResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// PROXY CALLER
// ============================================================================

async function callProxy<T = unknown>(body: ProxyRequest): Promise<ProxyResponse<T>> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    return { success: false, error: 'Not authenticated. Please log in.' };
  }

  // Supabase Edge Function URL is derived from the supabase project URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const functionUrl = `${supabaseUrl}/functions/v1/cloudflare-publish`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg: string;
      try {
        const errJson = JSON.parse(text);
        errorMsg = errJson.error || errJson.message || `HTTP ${response.status}`;
      } catch {
        errorMsg = text || `HTTP ${response.status}`;
      }
      return { success: false, error: errorMsg };
    }

    const json = await response.json();
    return json as ProxyResponse<T>;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: `Failed to reach publish service: ${message}` };
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Create a new Cloudflare Pages project (Direct Upload type).
 * Idempotent — if the project already exists, returns the existing project.
 */
export async function createProject(projectName: string): Promise<ProxyResponse<CloudflareProject>> {
  return callProxy<CloudflareProject>({
    action: 'create-project',
    projectName,
  });
}

/**
 * Get an existing project's details.
 */
export async function getProject(projectName: string): Promise<ProxyResponse<CloudflareProject>> {
  return callProxy<CloudflareProject>({
    action: 'get-project',
    projectName,
  });
}

/**
 * Deploy files to a Cloudflare Pages project.
 * Files are sent as an array of { path, content } objects.
 * The edge function handles multipart upload to Cloudflare.
 */
export async function deployFiles(
  projectName: string,
  files: DeploymentFile[],
  branch: string = 'main'
): Promise<ProxyResponse<CloudflareDeployment>> {
  return callProxy<CloudflareDeployment>({
    action: 'deploy',
    projectName,
    files,
    branch,
  });
}

/**
 * List recent deployments for a project.
 */
export async function listDeployments(
  projectName: string
): Promise<ProxyResponse<CloudflareDeployment[]>> {
  return callProxy<CloudflareDeployment[]>({
    action: 'list-deployments',
    projectName,
  });
}

/**
 * Delete a specific deployment.
 */
export async function deleteDeployment(
  projectName: string,
  deploymentId: string
): Promise<ProxyResponse<void>> {
  return callProxy<void>({
    action: 'delete-deployment',
    projectName,
    deploymentId,
  });
}

// ============================================================================
// HIGH-LEVEL PUBLISH FLOW
// ============================================================================

/**
 * Full publish flow:
 * 1. Ensure project exists (create if needed)
 * 2. Deploy files
 * 3. Return deployment URL
 */
export async function publishToCloudflare(
  projectName: string,
  files: DeploymentFile[]
): Promise<CloudflarePublishResult> {
  // Step 1: Ensure project exists
  const projectResult = await createProject(projectName);
  if (!projectResult.success) {
    return {
      success: false,
      error: `Failed to create/get project: ${projectResult.error}`,
    };
  }

  // Step 2: Deploy files
  const deployResult = await deployFiles(projectName, files);
  if (!deployResult.success) {
    return {
      success: false,
      error: `Deployment failed: ${deployResult.error}`,
    };
  }

  return {
    success: true,
    deployment: deployResult.data,
    project: projectResult.data,
    url: deployResult.data?.url || `https://${projectName}.pages.dev`,
  };
}

/**
 * Sanitize a string into a valid Cloudflare Pages project name.
 * Rules: lowercase, alphanumeric + hyphens, no leading/trailing hyphens, max 58 chars.
 */
export function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')  // Replace invalid chars with hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
    .slice(0, 58);                 // Max length
}
