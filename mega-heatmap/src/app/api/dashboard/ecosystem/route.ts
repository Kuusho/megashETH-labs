/**
 * Ecosystem Dashboard API
 * 
 * GET /api/dashboard/ecosystem
 * 
 * Returns MegaETH ecosystem-wide metrics from the deployment tracker database.
 * 
 * Data source: deployment-tracker/data/tracker.db
 * Cache: 15min TTL (ecosystem metrics update every 30min via cron)
 */

import { NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 900; // 15 minutes
const TRACKER_DB_PATH = path.join(
  process.cwd(),
  '../deployment-tracker/data/tracker.db'
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface EcosystemMetrics {
  id: number;
  total_tvl: number | null;
  total_addresses: number | null;
  total_txs: number | null;
  txs_24h: number | null;
  avg_gas_price: string | null;
  avg_block_time: number | null;
  deployment_count: number;
  snapshot_at: string;
}

interface TopProject {
  project: string;
  tvl_usd: number;
  category: string;
}

// ─── Database Helpers ────────────────────────────────────────────────────────

function getLatestEcosystemMetrics(): EcosystemMetrics | null {
  try {
    const db = new DatabaseSync(TRACKER_DB_PATH);
    
    const stmt = db.prepare(`
      SELECT * FROM ecosystem_metrics 
      ORDER BY snapshot_at DESC 
      LIMIT 1
    `);
    
    const result = stmt.get() as EcosystemMetrics | undefined;
    db.close();
    
    return result || null;
  } catch (error) {
    console.error('Failed to fetch ecosystem metrics:', error);
    return null;
  }
}

function getTopProject(): TopProject | null {
  try {
    const db = new DatabaseSync(TRACKER_DB_PATH);
    
    const stmt = db.prepare(`
      SELECT d.project, pm.tvl_usd, d.category
      FROM deployments d
      LEFT JOIN project_metrics pm ON pm.deployment_id = d.id
      WHERE pm.tvl_usd IS NOT NULL
      ORDER BY pm.tvl_usd DESC
      LIMIT 1
    `);
    
    const result = stmt.get() as TopProject | undefined;
    db.close();
    
    return result || null;
  } catch (error) {
    console.error('Failed to fetch top project:', error);
    return null;
  }
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const metrics = getLatestEcosystemMetrics();

    if (!metrics) {
      return NextResponse.json(
        { error: 'No ecosystem data available' },
        { status: 503 }
      );
    }

    const topProject = getTopProject();

    const response = NextResponse.json({
      total_tvl: metrics.total_tvl,
      total_tvl_formatted: metrics.total_tvl 
        ? `$${(metrics.total_tvl / 1e6).toFixed(1)}M`
        : null,
      total_addresses: metrics.total_addresses,
      total_addresses_formatted: metrics.total_addresses
        ? `${(metrics.total_addresses / 1000).toFixed(0)}K`
        : null,
      total_txs: metrics.total_txs,
      total_txs_formatted: metrics.total_txs
        ? `${(metrics.total_txs / 1e6).toFixed(1)}M`
        : null,
      txs_24h: metrics.txs_24h,
      txs_24h_formatted: metrics.txs_24h
        ? `${(metrics.txs_24h / 1e6).toFixed(2)}M`
        : null,
      avg_block_time: metrics.avg_block_time,
      deployment_count: metrics.deployment_count,
      top_project: topProject ? {
        name: topProject.project,
        tvl: topProject.tvl_usd,
        tvl_formatted: `$${(topProject.tvl_usd / 1e6).toFixed(1)}M`,
        category: topProject.category,
      } : null,
      updated_at: metrics.snapshot_at,
    });

    // Set cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`
    );
    response.headers.set('Access-Control-Allow-Origin', '*');

    return response;
  } catch (error) {
    console.error('Ecosystem API error:', error);
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
