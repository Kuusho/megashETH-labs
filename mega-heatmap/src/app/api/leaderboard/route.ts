/**
 * Leaderboard API
 * 
 * GET /api/leaderboard?limit=100&offset=0&search=0x...
 * 
 * Returns top users by MegaETH Native Score.
 * Supports pagination and address search.
 * 
 * Cache: 10min TTL
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userActivity } from '@/lib/db/schema';
import { eq, count, sql, desc } from 'drizzle-orm';
import { normalizeAddress, isValidAddress } from '@/lib/activity';

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 600; // 10 minutes
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const searchParam = searchParams.get('search');

  // Parse and validate params
  const limit = Math.min(
    parseInt(limitParam || String(DEFAULT_LIMIT), 10),
    MAX_LIMIT
  );
  const offset = Math.max(0, parseInt(offsetParam || '0', 10));

  try {
    // If search param provided, find that specific user's position
    if (searchParam) {
      if (!isValidAddress(searchParam)) {
        return NextResponse.json(
          { error: 'Invalid search address' },
          { status: 400 }
        );
      }

      const address = normalizeAddress(searchParam);
      
      const user = await db
        .select()
        .from(userActivity)
        .where(eq(userActivity.address, address))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json(
          { error: 'Address not found in leaderboard' },
          { status: 404 }
        );
      }

      const totalUsers = await getTotalUsers();

      const response = NextResponse.json({
        found: true,
        user: {
          rank: user[0].rank,
          address: user[0].address,
          score: user[0].megaethNativeScore,
          total_txs: user[0].totalTxs,
          days_active: user[0].daysActive,
        },
        total_users: totalUsers,
      });

      setCacheHeaders(response);
      return response;
    }

    // Regular leaderboard query
    const totalUsers = await getTotalUsers();

    const leaderboard = await db
      .select({
        rank: userActivity.rank,
        address: userActivity.address,
        score: userActivity.megaethNativeScore,
        total_txs: userActivity.totalTxs,
        days_active: userActivity.daysActive,
        contracts_deployed: userActivity.contractsDeployed,
      })
      .from(userActivity)
      .orderBy(desc(userActivity.megaethNativeScore))
      .limit(limit)
      .offset(offset);

    const response = NextResponse.json({
      total_users: totalUsers,
      limit,
      offset,
      returned: leaderboard.length,
      leaderboard: leaderboard.map(user => ({
        rank: user.rank || 0,
        address: user.address,
        score: user.score,
        total_txs: user.total_txs,
        days_active: user.days_active,
        contracts_deployed: user.contracts_deployed,
      })),
      updated_at: new Date().toISOString(),
    });

    setCacheHeaders(response);
    return response;
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── Helper Functions ────────────────────────────────────────────────────────

async function getTotalUsers(): Promise<number> {
  const result = await db.select({ count: count() }).from(userActivity);
  return result[0]?.count || 0;
}

function setCacheHeaders(response: NextResponse) {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`
  );
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  setCacheHeaders(response);
  return response;
}
