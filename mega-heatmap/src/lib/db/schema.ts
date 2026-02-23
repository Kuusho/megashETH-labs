/**
 * Database Schema - MegaETH Heatmap Point System
 * 
 * Tables:
 * - user_activity: Stores aggregated user metrics + points
 * - daily_snapshots: Historical daily activity data
 * 
 * Using Drizzle ORM with Vercel Postgres
 */

import { pgTable, text, integer, real, serial, unique, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── User Activity Table ─────────────────────────────────────────────────────

export const userActivity = pgTable(
  'user_activity',
  {
    address: text('address').primaryKey().notNull(),
    totalTxs: integer('total_txs').default(0).notNull(),
    gasSpentWei: text('gas_spent_wei').default('0').notNull(),
    gasSpentEth: real('gas_spent_eth').default(0).notNull(),
    contractsDeployed: integer('contracts_deployed').default(0).notNull(),
    daysActive: integer('days_active').default(0).notNull(),
    firstTxTimestamp: integer('first_tx_timestamp'),
    lastTxTimestamp: integer('last_tx_timestamp'),
    megaethNativeScore: integer('megaeth_native_score').default(0).notNull(),
    rank: integer('rank'),
    lastUpdated: integer('last_updated').default(sql`extract(epoch from now())`).notNull(),
  },
  (table) => {
    return {
      scoreIdx: index('idx_user_score').on(table.megaethNativeScore.desc()),
      rankIdx: index('idx_user_rank').on(table.rank),
      updatedIdx: index('idx_user_updated').on(table.lastUpdated),
    };
  }
);

// ─── Daily Snapshots Table ───────────────────────────────────────────────────

export const dailySnapshots = pgTable(
  'daily_snapshots',
  {
    id: serial('id').primaryKey(),
    address: text('address').notNull(),
    snapshotDate: text('snapshot_date').notNull(), // YYYY-MM-DD format
    txsThatDay: integer('txs_that_day').default(0).notNull(),
    gasSpentThatDay: text('gas_spent_that_day').default('0').notNull(),
    createdAt: integer('created_at').default(sql`extract(epoch from now())`).notNull(),
  },
  (table) => {
    return {
      uniqueSnapshot: unique('unique_address_date').on(table.address, table.snapshotDate),
      addressIdx: index('idx_snapshot_address').on(table.address),
      dateIdx: index('idx_snapshot_date').on(table.snapshotDate),
    };
  }
);

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type UserActivity = typeof userActivity.$inferSelect;
export type NewUserActivity = typeof userActivity.$inferInsert;

export type DailySnapshot = typeof dailySnapshots.$inferSelect;
export type NewDailySnapshot = typeof dailySnapshots.$inferInsert;

// ─── Helper Types ────────────────────────────────────────────────────────────

export interface UserMetrics {
  address: string;
  totalTxs: number;
  gasSpentEth: number;
  contractsDeployed: number;
  daysActive: number;
  firstTxTimestamp: number;
  lastTxTimestamp: number;
}

export interface UserScore {
  megaethNativeScore: number;
  rank: number | null;
  totalUsers: number;
  percentile: number;
}

export interface Multipliers {
  ogBonus: boolean;        // First tx before mainnet launch
  builderBonus: boolean;   // Has deployed contracts
  powerUserBonus: boolean; // Avg > 50 tx/day
}
