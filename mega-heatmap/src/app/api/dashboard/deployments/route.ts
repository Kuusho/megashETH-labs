/**
 * Deployments Dashboard API
 * 
 * GET /api/dashboard/deployments?category=defi&limit=20
 * 
 * Returns enriched deployment data from the deployment tracker.
 * Supports category filtering.
 * 
 * Cache: 30min TTL (enrichment runs every 30min)
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 1800; // 30 minutes
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const TRACKER_DB_PATH = path.join(
  process.cwd(),
  '../deployment-tracker/data/tracker.db'
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Deployment {
  id: string;
  project: string;
  category: string | null;
  contract_address: string | null;
  contract_verified: number;
  url: string | null;
  created_at: string;
  tvl_usd: number | null;
  tx_count: number | null;
  is_verified: number | null;
  score: number | null;
  classification: string | null;
}

// ─── Database Helpers ────────────────────────────────────────────────────────

function getDeployments(category?: string, limit: number = DEFAULT_LIMIT): Deployment[] {
  try {
    const db = new DatabaseSync(TRACKER_DB_PATH);
    
    let query = `
      SELECT 
        d.id,
        d.project,
        d.category,
        d.contract_address,
        d.contract_verified,
        d.url,
        d.created_at,
        pm.tvl_usd,
        pm.tx_count,
        pm.is_verified,
        pm.score,
        pm.classification
      FROM deployments d
      LEFT JOIN (
        SELECT deployment_id, tvl_usd, tx_count, is_verified, score, classification
        FROM project_metrics
        WHERE id IN (
          SELECT MAX(id) 
          FROM project_metrics 
          GROUP BY deployment_id
        )
      ) pm ON pm.deployment_id = d.id
    `;
    
    if (category) {
      query += ` WHERE LOWER(d.category) = LOWER(?)`;
    }
    
    query += ` ORDER BY pm.tvl_usd DESC NULLS LAST, pm.score DESC NULLS LAST`;
    query += ` LIMIT ?`;

    const stmt = db.prepare(query);
    const results = category 
      ? stmt.all(category, limit) as unknown as Deployment[]
      : stmt.all(limit) as unknown as Deployment[];
    
    db.close();
    
    return results;
  } catch (error) {
    console.error('Failed to fetch deployments:', error);
    return [];
  }
}

function getCategories(): string[] {
  try {
    const db = new DatabaseSync(TRACKER_DB_PATH);
    
    const stmt = db.prepare(`
      SELECT DISTINCT category 
      FROM deployments 
      WHERE category IS NOT NULL
      ORDER BY category
    `);
    
    const results = stmt.all() as { category: string }[];
    db.close();
    
    return results.map(r => r.category);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// ─── Formatting Helpers ──────────────────────────────────────────────────────

function formatTVL(tvl: number | null): string | null {
  if (!tvl) return null;
  
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
  if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(1)}K`;
  return `$${tvl.toFixed(2)}`;
}

function extractTwitterHandle(url: string | null): string | null {
  if (!url) return null;
  
  const match = url.match(/twitter\.com\/([^\/\?]+)/);
  return match ? `@${match[1]}` : null;
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const categoryParam = searchParams.get('category');
  const limitParam = searchParams.get('limit');

  const limit = Math.min(
    parseInt(limitParam || String(DEFAULT_LIMIT), 10),
    MAX_LIMIT
  );

  try {
    const deployments = getDeployments(categoryParam || undefined, limit);
    const categories = getCategories();

    const response = NextResponse.json({
      count: deployments.length,
      categories,
      current_filter: categoryParam || 'all',
      deployments: deployments.map(d => ({
        id: d.id,
        project: d.project,
        category: d.category,
        tvl_usd: d.tvl_usd,
        tvl_formatted: formatTVL(d.tvl_usd),
        contract_address: d.contract_address,
        verified: !!d.contract_verified || !!d.is_verified,
        tx_count: d.tx_count,
        score: d.score,
        classification: d.classification,
        twitter: extractTwitterHandle(d.url),
        deployed_at: d.created_at,
      })),
      updated_at: new Date().toISOString(),
    });

    // Set cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`
    );
    response.headers.set('Access-Control-Allow-Origin', '*');

    return response;
  } catch (error) {
    console.error('Deployments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  return response;
}
