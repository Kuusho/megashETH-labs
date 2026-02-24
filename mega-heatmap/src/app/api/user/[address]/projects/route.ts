/**
 * Frequent Projects API
 *
 * GET /api/user/:address/projects
 *
 * Returns up to 8 catalogue-verified projects the user interacts with most,
 * derived from their last ~200 transactions cross-referenced against tracker.db.
 *
 * Cache: 10 min TTL
 */

import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fetchAllTransactions } from '@/lib/activity';
import { PROJECTS, CATEGORIES } from '@/data/catalogue';

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 600; // 10 minutes
const TX_PAGES = 4;            // 4 pages × 50 txs ≈ 200 txs
const TOP_N = 8;

const TRACKER_DB_PATH = path.join(
  process.cwd(),
  '../deployment-tracker/data/tracker.db'
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrackerRow {
  contract_address: string;
  project: string;
  category: string | null;
  tvl_usd: number | null;
  classification: string | null;
  created_at: string;
}

// ─── DB Helpers ──────────────────────────────────────────────────────────────

function formatTVL(tvl: number | null): string | null {
  if (!tvl) return null;
  if (tvl >= 1e6) return `$${(tvl / 1e6).toFixed(2)}M`;
  if (tvl >= 1e3) return `$${(tvl / 1e3).toFixed(1)}K`;
  return `$${tvl.toFixed(2)}`;
}

function queryTrackerForAddresses(addresses: string[]): TrackerRow[] {
  if (addresses.length === 0) return [];

  try {
    const db = new DatabaseSync(TRACKER_DB_PATH);

    const placeholders = addresses.map(() => '?').join(', ');
    const query = `
      SELECT
        d.contract_address,
        d.project,
        d.category,
        d.created_at,
        pm.tvl_usd,
        pm.classification
      FROM deployments d
      LEFT JOIN (
        SELECT deployment_id, tvl_usd, classification
        FROM project_metrics
        WHERE id IN (
          SELECT MAX(id)
          FROM project_metrics
          GROUP BY deployment_id
        )
      ) pm ON pm.deployment_id = d.id
      WHERE LOWER(d.contract_address) IN (${placeholders})
        AND d.contract_address IS NOT NULL
    `;

    const stmt = db.prepare(query);
    const rows = stmt.all(...addresses) as unknown as TrackerRow[];
    db.close();
    return rows;
  } catch (error) {
    console.error('[projects] tracker.db query failed:', error);
    return [];
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  try {
    // 1. Fetch last ~200 transactions (4 pages)
    const transactions = await fetchAllTransactions(address, TX_PAGES);

    // 2. Count interactions per `to` address (exclude null = contract deploys)
    const interactionCount = new Map<string, number>();
    const lastInteractedAt = new Map<string, number>();

    for (const tx of transactions) {
      const toAddr = tx.to?.hash;
      if (!toAddr) continue; // skip deploys

      const norm = toAddr.toLowerCase();
      interactionCount.set(norm, (interactionCount.get(norm) ?? 0) + 1);

      const ts = Math.floor(new Date(tx.timestamp).getTime() / 1000);
      const existing = lastInteractedAt.get(norm) ?? 0;
      if (ts > existing) lastInteractedAt.set(norm, ts);
    }

    if (interactionCount.size === 0) {
      return NextResponse.json({ projects: [] });
    }

    // 3. Query tracker.db for matching contract_addresses
    const uniqueAddresses = Array.from(interactionCount.keys());
    const trackerRows = queryTrackerForAddresses(uniqueAddresses);

    if (trackerRows.length === 0) {
      const response = NextResponse.json({ projects: [] });
      response.headers.set(
        'Cache-Control',
        `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`
      );
      return response;
    }

    // 4. Build catalogue lookup: twitter handle → Project
    const catalogueMap = new Map(
      PROJECTS.map(p => [p.twitter.toLowerCase(), p])
    );
    const categoryMap = new Map(
      CATEGORIES.map(c => [c.id, c])
    );

    // 5. Join tracker rows with catalogue metadata
    const enriched = trackerRows.map(row => {
      const contractAddr = row.contract_address.toLowerCase();
      const count = interactionCount.get(contractAddr) ?? 0;
      const lastAt = lastInteractedAt.get(contractAddr) ?? 0;

      // Normalise tracker project handle → look up in catalogue
      const handle = row.project.replace(/^@/, '').toLowerCase();
      const catalogueEntry = catalogueMap.get(handle);
      const categoryInfo = row.category
        ? categoryMap.get(row.category as Parameters<typeof categoryMap.get>[0])
        : null;

      return {
        project: catalogueEntry?.name ?? row.project,
        twitter: handle,
        category: row.category,
        categoryColor: categoryInfo?.color ?? '#64748B',
        description: catalogueEntry?.description ?? null,
        tvl_formatted: formatTVL(row.tvl_usd),
        classification: row.classification,
        interaction_count: count,
        last_interacted_at: lastAt,
        featured: catalogueEntry?.featured ?? false,
      };
    });

    // 6. Sort by interaction count DESC, take top N
    const top = enriched
      .sort((a, b) => b.interaction_count - a.interaction_count)
      .slice(0, TOP_N);

    const response = NextResponse.json({ projects: top });
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`
    );
    return response;
  } catch (error) {
    console.error('[projects] handler error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
