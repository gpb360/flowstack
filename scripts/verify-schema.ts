// Supabase Schema Verification Script
// Run with: npx tsx scripts/verify-schema.ts
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TableCheck {
  name: string;
  exists: boolean;
  error?: string;
}

async function checkTable(tableName: string): Promise<TableCheck> {
  try {
    // Try to select from the table with limit 0 to check existence
    const { error } = await supabase.from(tableName).select('*').limit(0);
    
    if (error) {
      // RLS might block the select, but the table exists
      if (error.code === '42P01') {
        return { name: tableName, exists: false, error: 'Table does not exist' };
      }
      // Other errors (RLS, permissions) mean the table exists
      return { name: tableName, exists: true };
    }
    return { name: tableName, exists: true };
  } catch (err: any) {
    return { name: tableName, exists: false, error: err.message };
  }
}

async function main() {
  console.log('🔍 Verifying Supabase schema...\n');
  console.log(`URL: ${supabaseUrl}\n`);

  const coreTables = [
    'user_profiles',
    'organizations',
    'memberships',
    'organization_settings',
    'contacts',
    'companies',
    'activities',
    'tags',
    'deals',
    'stages',
    'pipelines',
    'workflows',
    'workflow_nodes',
    'workflow_executions',
    'sites',
    'pages',
    'site_versions',
    'agent_executions',
    'conversation_memories',
    'newsletter_subscribers',
  ];

  const results: TableCheck[] = [];

  for (const table of coreTables) {
    const result = await checkTable(table);
    results.push(result);
    const icon = result.exists ? '✅' : '❌';
    const suffix = result.error ? ` — ${result.error}` : '';
    console.log(`  ${icon} ${table}${suffix}`);
  }

  const existing = results.filter(r => r.exists).length;
  const missing = results.filter(r => !r.exists);

  console.log(`\n📊 Results: ${existing}/${coreTables.length} tables found`);

  if (missing.length > 0) {
    console.log(`\n⚠️  Missing tables:`);
    missing.forEach(t => {
      console.log(`  - ${t.name}${t.error ? ` (${t.error})` : ''}`);
      console.log(`  → Run: psql < db/<relevant_schema>.sql`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All core tables verified!');
    process.exit(0);
  }
}

main();
