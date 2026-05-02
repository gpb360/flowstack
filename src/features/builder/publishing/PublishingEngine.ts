// ============================================================================
// PUBLISHING ENGINE — Orchestrates site rendering and deployment
// ============================================================================

import type { Site, Page } from '../types';
import {
  renderSite,
  renderPageHTML,
  generateSitemap,
  generate404Page,
  type RenderedFile,
} from './HTMLRenderer';
import {
  publishToCloudflare,
  sanitizeProjectName,
  type CloudflarePublishResult,
} from './CloudflareClient';

// ============================================================================
// TYPES
// ============================================================================

export interface PublishOptions {
  generateSitemap: boolean;
}

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
  deploymentId?: string;
  publishedAt?: Date;
  projectName?: string;
  filesDeployed?: number;
}

export interface VersionHistory {
  id: string;
  version: string;
  publishedAt: Date;
  publishedBy: string;
  url: string;
  status: 'success' | 'failed';
}

// ============================================================================
// PUBLISH FLOW
// ============================================================================

/**
 * Main publish function — renders site to static HTML, deploys to Cloudflare Pages.
 */
export async function publishSite(
  site: Site,
  pages: Page[],
  options: PublishOptions,
  cloudflareProjectName?: string
): Promise<PublishResult> {
  try {
    // Step 1: Determine project name
    const projectName = cloudflareProjectName
      || sanitizeProjectName(site.subdomain || site.name);

    if (!projectName) {
      return { success: false, error: 'Could not determine project name' };
    }

    // Step 2: Render all pages to static HTML
    const files = renderSite(site, pages);

    if (files.length === 0) {
      return { success: false, error: 'No published pages to deploy' };
    }

    // Remove sitemap if option is disabled
    const deployFiles = options.generateSitemap
      ? files
      : files.filter((f) => f.path !== 'sitemap.xml');

    // Step 3: Deploy to Cloudflare Pages
    const result: CloudflarePublishResult = await publishToCloudflare(projectName, deployFiles);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Deployment failed',
        projectName,
      };
    }

    return {
      success: true,
      url: result.url,
      deploymentId: result.deployment?.id,
      publishedAt: new Date(),
      projectName,
      filesDeployed: deployFiles.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during publishing',
    };
  }
}

// ============================================================================
// EXPORT (HTML Download)
// ============================================================================

/**
 * Export site as a downloadable HTML file (offline backup / manual hosting).
 */
export async function exportToHTML(site: Site, pages: Page[]): Promise<Blob> {
  const files = renderSite(site, pages);

  if (files.length === 1) {
    // Single page — download as HTML directly
    return new Blob([files[0].content], { type: 'text/html' });
  }

  // Multi-page — create a simple zip-like concatenated download
  // (Real zip would need a library; for MVP we create an index with inline pages)
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.name} — Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
    h1 { font-size: 1.5rem; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .count { color: #6b7280; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>${site.name}</h1>
  <p class="count">${files.length} files exported</p>
  <ul>
    ${files.map((f) => `<li><a href="${f.path}">${f.path}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>`;

  return new Blob([indexHtml], { type: 'text/html' });
}

// ============================================================================
// VERSION HELPERS
// ============================================================================

export function generateVersionNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day}-${hours}${minutes}`;
}

export function calculateFileSize(html: string): number {
  return new Blob([html]).size;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ============================================================================
// RE-EXPORTS for backward compatibility
// ============================================================================

export { renderSite, renderPageHTML, generateSitemap, generate404Page };
export type { RenderedFile };
