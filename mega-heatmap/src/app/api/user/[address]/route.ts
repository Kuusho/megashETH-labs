/**
 * User Profile API
 * 
 * GET /api/user/:address
 * 
 * Returns user's MegaETH activity metrics, score, rank, and multipliers.
 * Automatically aggregates data if user not in DB or data is stale (>24h).
 * 
 * Cache: 5min TTL
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userActivity } from '@/lib/db/schema';
import { eq, count, gt, desc } from 'drizzle-orm';
import {
  aggregateUserActivity,
  isValidAddress,
  normalizeAddress,
} from '@/lib/activity';
import { getScoreBreakdown, getPercentile, calculateScore } from '@/lib/scoring';
import { fetchExternalBonusDataCached } from '@/lib/external-bonus';

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_TTL_SECONDS = 300; // 5 minutes
const STALE_THRESHOLD_SECONDS = 86400; // 24 hours

// ─── Helper Functions ────────────────────────────────────────────────────────

async function getUserFromDb(address: string) {
  const results = await db
    .select()
    .from(userActivity)
    .where(eq(userActivity.address, address))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}

async function getTotalUsers(): Promise<number> {
  const result = await db.select({ count: count() }).from(userActivity);
  return result[0]?.count || 0;
}

async function isDataStale(lastUpdated: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  return now - lastUpdated > STALE_THRESHOLD_SECONDS;
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address: rawAddress } = params;

  // Validate address
  if (!isValidAddress(rawAddress)) {
    return NextResponse.json(
      { error: 'Invalid Ethereum address' },
      { status: 400 }
    );
  }

  const address = normalizeAddress(rawAddress);

  try {
    // Check if user exists in DB
    let user = await getUserFromDb(address);

    // If user doesn't exist or data is stale, aggregate fresh data
    if (!user || await isDataStale(user.lastUpdated)) {
      console.log(`Aggregating fresh data for ${address}...`);
      
      try {
        const { dbRecord } = await aggregateUserActivity(address);

        // Insert or update user activity
        await db
          .insert(userActivity)
          .values(dbRecord)
          .onConflictDoUpdate({
            target: userActivity.address,
            set: dbRecord,
          });

        // Recalculate ranks for all users
        await recalculateRanks();

        // Fetch updated user
        user = await getUserFromDb(address);
      } catch (aggregationError) {
        console.error('Aggregation failed:', aggregationError);
        
        // If aggregation fails and we have stale data, return it with a warning
        if (user) {
          const totalUsers = await getTotalUsers();
          const percentile = user.rank ? getPercentile(user.rank, totalUsers) : 0;

          return NextResponse.json({
            address: user.address,
            metrics: {
              total_txs: user.totalTxs,
              gas_spent_eth: user.gasSpentEth,
              contracts_deployed: user.contractsDeployed,
              days_active: user.daysActive,
              first_tx_date: user.firstTxTimestamp ? new Date(user.firstTxTimestamp * 1000).toISOString().split('T')[0] : null,
              avg_tx_per_day: user.daysActive > 0 ? user.totalTxs / user.daysActive : 0,
            },
            score: {
              megaeth_native_score: user.megaethNativeScore,
              rank: user.rank,
              total_users: totalUsers,
              percentile,
            },
            multipliers: {
              og_bonus: user.firstTxTimestamp ? user.firstTxTimestamp <= 1739059200 : false,
              builder_bonus: user.contractsDeployed > 0,
              power_user_bonus: false, // Can't calculate without days since first
            },
            last_updated: new Date(user.lastUpdated * 1000).toISOString(),
            warning: 'Data may be stale. Refresh failed.',
          });
        }

        // No data at all and aggregation failed
        return NextResponse.json(
          { error: 'Failed to fetch user data. Please try again later.' },
          { status: 503 }
        );
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No activity found for this address' },
        { status: 404 }
      );
    }

    // Calculate metrics for response
    const totalUsers = await getTotalUsers();
    const percentile = user.rank ? getPercentile(user.rank, totalUsers) : 0;

    const daysSinceFirst = user.firstTxTimestamp 
      ? Math.max(1, Math.floor((Date.now() / 1000 - user.firstTxTimestamp) / 86400))
      : 1;
    const avgTxPerDay = user.totalTxs / daysSinceFirst;

    // Fetch external bonus data (identity + NFT holdings)
    const externalData = await fetchExternalBonusDataCached(address);

    // Build metrics object
    const metrics = {
      address: user.address,
      totalTxs: user.totalTxs,
      gasSpentEth: user.gasSpentEth,
      contractsDeployed: user.contractsDeployed,
      daysActive: user.daysActive,
      firstTxTimestamp: user.firstTxTimestamp ?? 0,
      lastTxTimestamp: user.lastTxTimestamp ?? 0,
    };

    // Get multipliers with external data
    const breakdown = getScoreBreakdown(metrics, externalData);
    
    // Recalculate score with external bonuses
    const enhancedScore = calculateScore(metrics, externalData);

    // Build response
    const response = NextResponse.json({
      address: user.address,
      metrics: {
        total_txs: user.totalTxs,
        gas_spent_eth: parseFloat(user.gasSpentEth.toFixed(4)),
        contracts_deployed: user.contractsDeployed,
        days_active: user.daysActive,
        first_tx_date: user.firstTxTimestamp ? new Date(user.firstTxTimestamp * 1000).toISOString().split('T')[0] : null,
        avg_tx_per_day: parseFloat(avgTxPerDay.toFixed(2)),
      },
      score: {
        megaeth_native_score: enhancedScore,
        base_score: user.megaethNativeScore, // activity-only score from DB
        rank: user.rank,
        total_users: totalUsers,
        percentile,
      },
      multipliers: breakdown.multipliers,
      identity: {
        mega_domain: externalData.hasMegaDomain,
        farcaster: externalData.hasFarcaster,
      },
      nft_holdings: {
        protardio: externalData.holdsProtardio,
        native_nft: externalData.holdsNativeNft,
        collections: externalData.nftHoldings?.length ?? 0,
      },
      last_updated: new Date(user.lastUpdated * 1000).toISOString(),
    });

    // Set cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS * 2}`
    );

    return response;
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── Rank Recalculation ──────────────────────────────────────────────────────

async function recalculateRanks() {
  // Fetch all users ordered by score
  const users = await db
    .select({ address: userActivity.address, score: userActivity.megaethNativeScore })
    .from(userActivity)
    .orderBy(desc(userActivity.megaethNativeScore));

  // Update ranks
  for (let i = 0; i < users.length; i++) {
    await db
      .update(userActivity)
      .set({ rank: i + 1 })
      .where(eq(userActivity.address, users[i].address));
  }

  console.log(`Recalculated ranks for ${users.length} users`);
}
