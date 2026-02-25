/**
 * Database Schema - MegaETH Heatmap Point System
 * 
 * Tables:
 * - user_activity: Stores aggregated user metrics + points
 * - daily_snapshots: Historical daily activity data
 * 
 * Using Drizzle ORM with Vercel Postgres
 */

import { pgTable, text, integer, real, serial, boolean, unique, index } from 'drizzle-orm/pg-core';
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
  // Activity
  ogBonus: boolean;        // First tx before mainnet launch
  builderBonus: boolean;   // Has deployed contracts
  powerUserBonus: boolean; // Avg > 50 tx/day
  // Identity
  megaDomainBonus: boolean;   // Owns a .mega domain
  farcasterBonus: boolean;    // Has linked Farcaster account
  agentBonus: boolean;        // ERC-8004 registered agent or operator
  // Protardio (count-based)
  protardioBonus: boolean;       // true if holding ≥1
  protardioCount: number;        // total held
  protardioAllUnlisted: boolean; // true if none are listed on a marketplace
  // Native NFT (additive, capped at 2 collections)
  nativeNftBonus: boolean;
  nativeNftCount: number;        // distinct collections held (capped at 2 for scoring)
}

// NFT collection addresses for multiplier checks
export const NFT_COLLECTIONS = {
  protardio: '0x5d38451841ee7a2e824a88afe47b00402157b08d',
  badlyDrawnBarrys: '0xa7911e22b9bba3af9d43bbae3491aa50396cc453',
  badBunnz: '0x89ff7a37bf8851bcbee20b1032afc583f89b40ff',
  glitchyBunnies: '0x19f9b860eb96b574af72f639cc15cfe2685053a0',
  worldComputerNetizens: '0x3fd43a658915a7ce5ae0a2e48f72b9fce7ba0c44',
  legendOfBreadio: '0x015061aa806b5abab9ee453e366e18a713e8ea80',
  nacciCartel: '0x2e5902a40115bf36739949d9875be0bcd2384c05',
} as const;

// ─── User Profiles Table ─────────────────────────────────────────────────────

export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),                   // UUID, generated client-side
  primaryAddress: text('primary_address').notNull(),
  displayName: text('display_name'),
  twitter: text('twitter'),                      // Optional, stored as-is
  avatarUrl: text('avatar_url'),                 // Optional: base64 data URL or external URL
  createdAt: integer('created_at').notNull(),    // Unix epoch seconds
});

// ─── Profile Wallets Table ───────────────────────────────────────────────────

export const profileWallets = pgTable(
  'profile_wallets',
  {
    id: serial('id').primaryKey(),
    profileId: text('profile_id').notNull()
      .references(() => userProfiles.id, { onDelete: 'cascade' }),
    address: text('address').notNull().unique(),  // Lowercase normalised
    isPrimary: boolean('is_primary').default(false),
    signature: text('signature').notNull(),
    message: text('message').notNull(),           // Exact signed message
    addedAt: integer('added_at').notNull(),
  },
  (table) => {
    return {
      profileIdIdx: index('idx_pw_profile_id').on(table.profileId),
      addressIdx: index('idx_pw_address').on(table.address),
    };
  }
);

// ─── Profile TypeScript Types ─────────────────────────────────────────────────

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type ProfileWallet = typeof profileWallets.$inferSelect;
export type NewProfileWallet = typeof profileWallets.$inferInsert;
