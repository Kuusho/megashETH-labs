/**
 * Scoring Engine - MegaETH Native Score Calculator
 * 
 * Point Formula:
 * base = (txs * 0.5) + (gas_eth * 100) + (deploys * 50) + (days * 10) + (age_days * 2)
 * 
 * Multipliers (Activity):
 * - OG Bonus (1.5x): First tx before or on 2026-02-09 (mainnet launch)
 * - Builder Bonus (1.2x): Has deployed at least 1 contract
 * - Power User Bonus (1.3x): Average >50 tx/day
 * 
 * Multipliers (Identity):
 * - .mega Domain (1.15x): Owns a .mega domain name
 * - Farcaster (1.1x): Has linked Farcaster account
 * 
 * Multipliers (NFT Holdings):
 * - Protardio (1.2x): Holds Protardio NFT
 * - Native NFT (1.1x): Holds any MegaETH native NFT collection
 * 
 * Final Score: int(base * combined_multipliers)
 */

import type { UserMetrics, Multipliers } from './db/schema';
import { NFT_COLLECTIONS } from './db/schema';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAINNET_LAUNCH_TIMESTAMP = 1739059200; // 2026-02-09 00:00:00 UTC
const POWER_USER_TX_THRESHOLD = 50; // txs per day

const POINTS_PER_TX = 0.5;
const POINTS_PER_ETH_GAS = 100;
const POINTS_PER_CONTRACT = 50;
const POINTS_PER_DAY_ACTIVE = 10;
const POINTS_PER_DAY_AGE = 2;

// Activity multipliers
const MULTIPLIER_OG = 1.5;
const MULTIPLIER_BUILDER = 1.2;
const MULTIPLIER_POWER_USER = 1.3;

// Identity multipliers
const MULTIPLIER_MEGA_DOMAIN = 1.5;    // was 1.15
const MULTIPLIER_FARCASTER = 1.1;
const MULTIPLIER_AGENT = 1.15;         // ERC-8004 registered agent or operator

// Protardio
const MULTIPLIER_PROTARDIO = 1.3;           // was 1.2 (base for holding ≥1)
const PROTARDIO_BONUS_PER_EXTRA = 0.03;     // additive per extra held, if none listed
const PROTARDIO_MAX_STACK = 10;             // stacking cap (total including first)

// Native NFT
const MULTIPLIER_NATIVE_NFT_BASE = 1.2;         // was 1.1 flat
const NATIVE_NFT_BONUS_PER_COLLECTION = 0.05;
const NATIVE_NFT_MAX_COLLECTIONS = 2;

// ─── External Data Types ─────────────────────────────────────────────────────

export interface ExternalBonusData {
  hasMegaDomain?: boolean;
  hasFarcaster?: boolean;
  isAgent?: boolean;              // ERC-8004 registered agent or operator
  protardioCount?: number;        // replaces holdsProtardio boolean
  protardioAllUnlisted?: boolean;
  holdsNativeNft?: boolean;
  nativeNftCount?: number;        // distinct collections held
  nftHoldings?: string[];         // contract addresses of NFTs held
}

// ─── Multiplier Detection ────────────────────────────────────────────────────

export function getMultipliers(
  metrics: UserMetrics,
  external?: ExternalBonusData
): Multipliers {
  // Activity-based multipliers
  const ogBonus = metrics.firstTxTimestamp <= MAINNET_LAUNCH_TIMESTAMP;
  const builderBonus = metrics.contractsDeployed > 0;

  const daysSinceFirst = Math.max(
    1,
    Math.floor((Date.now() / 1000 - metrics.firstTxTimestamp) / 86400)
  );
  const avgTxPerDay = metrics.totalTxs / daysSinceFirst;
  const powerUserBonus = avgTxPerDay > POWER_USER_TX_THRESHOLD;

  // Identity multipliers (from external data)
  const megaDomainBonus = external?.hasMegaDomain ?? false;
  const farcasterBonus = external?.hasFarcaster ?? false;
  const agentBonus = external?.isAgent ?? false;

  // Protardio (count-based; no longer exclusive with native NFT)
  const protardioCount = external?.protardioCount ?? 0;
  const protardioBonus = protardioCount >= 1;
  const protardioAllUnlisted = external?.protardioAllUnlisted ?? false;

  // Native NFT (additive, capped at NATIVE_NFT_MAX_COLLECTIONS)
  const nativeNftCount = Math.min(
    external?.nativeNftCount ?? 0,
    NATIVE_NFT_MAX_COLLECTIONS
  );
  const nativeNftBonus = nativeNftCount >= 1;

  return {
    ogBonus,
    builderBonus,
    powerUserBonus,
    megaDomainBonus,
    farcasterBonus,
    agentBonus,
    protardioBonus,
    protardioCount,
    protardioAllUnlisted,
    nativeNftBonus,
    nativeNftCount,
  };
}

export function getMultiplierValue(multipliers: Multipliers): number {
  let value = 1.0;

  // Activity multipliers
  if (multipliers.ogBonus) value *= MULTIPLIER_OG;
  if (multipliers.builderBonus) value *= MULTIPLIER_BUILDER;
  if (multipliers.powerUserBonus) value *= MULTIPLIER_POWER_USER;

  // Identity multipliers
  if (multipliers.megaDomainBonus) value *= MULTIPLIER_MEGA_DOMAIN;
  if (multipliers.farcasterBonus)  value *= MULTIPLIER_FARCASTER;
  if (multipliers.agentBonus)      value *= MULTIPLIER_AGENT;

  // Protardio (separate tier, no longer exclusive with native NFT)
  if (multipliers.protardioBonus) {
    value *= MULTIPLIER_PROTARDIO; // 1.3× base
    if (multipliers.protardioAllUnlisted && multipliers.protardioCount > 1) {
      const extras = Math.min(multipliers.protardioCount - 1, PROTARDIO_MAX_STACK - 1);
      value += extras * PROTARDIO_BONUS_PER_EXTRA;
    }
  }

  // Native NFT (additive, capped at 2 collections)
  if (multipliers.nativeNftBonus) {
    const collectionBonus = multipliers.nativeNftCount * NATIVE_NFT_BONUS_PER_COLLECTION;
    value += MULTIPLIER_NATIVE_NFT_BASE - 1.0 + collectionBonus;
  }

  return value;
}

// ─── Score Calculation ───────────────────────────────────────────────────────

export function calculateBasePoints(metrics: UserMetrics): number {
  const daysSinceFirst = Math.max(
    1,
    Math.floor((Date.now() / 1000 - metrics.firstTxTimestamp) / 86400)
  );

  const basePoints =
    metrics.totalTxs * POINTS_PER_TX +
    metrics.gasSpentEth * POINTS_PER_ETH_GAS +
    metrics.contractsDeployed * POINTS_PER_CONTRACT +
    metrics.daysActive * POINTS_PER_DAY_ACTIVE +
    daysSinceFirst * POINTS_PER_DAY_AGE;

  return basePoints;
}

export function calculateScore(
  metrics: UserMetrics,
  external?: ExternalBonusData
): number {
  const basePoints = calculateBasePoints(metrics);
  const multipliers = getMultipliers(metrics, external);
  const multiplierValue = getMultiplierValue(multipliers);

  const finalScore = Math.floor(basePoints * multiplierValue);
  
  return finalScore;
}

// ─── Scoring Breakdown (for UI display) ─────────────────────────────────────

export interface ScoreBreakdown {
  basePoints: number;
  multipliers: Multipliers;
  multiplierValue: number;
  finalScore: number;
  breakdown: {
    fromTxs: number;
    fromGas: number;
    fromDeployments: number;
    fromDaysActive: number;
    fromAge: number;
  };
  protardioStack: number;   // final protardio multiplier value applied
  nativeNftStack: number;   // final native nft bonus value applied
  agentBonus: boolean;
}

export function getScoreBreakdown(
  metrics: UserMetrics,
  external?: ExternalBonusData
): ScoreBreakdown {
  const daysSinceFirst = Math.max(
    1,
    Math.floor((Date.now() / 1000 - metrics.firstTxTimestamp) / 86400)
  );

  const breakdown = {
    fromTxs: metrics.totalTxs * POINTS_PER_TX,
    fromGas: metrics.gasSpentEth * POINTS_PER_ETH_GAS,
    fromDeployments: metrics.contractsDeployed * POINTS_PER_CONTRACT,
    fromDaysActive: metrics.daysActive * POINTS_PER_DAY_ACTIVE,
    fromAge: daysSinceFirst * POINTS_PER_DAY_AGE,
  };

  const basePoints = calculateBasePoints(metrics);
  const multipliers = getMultipliers(metrics, external);
  const multiplierValue = getMultiplierValue(multipliers);
  const finalScore = Math.floor(basePoints * multiplierValue);

  // Protardio: base multiplier factor + any additive stacking bonus
  let protardioStack = 0;
  if (multipliers.protardioBonus) {
    protardioStack = MULTIPLIER_PROTARDIO;
    if (multipliers.protardioAllUnlisted && multipliers.protardioCount > 1) {
      const extras = Math.min(multipliers.protardioCount - 1, PROTARDIO_MAX_STACK - 1);
      protardioStack += extras * PROTARDIO_BONUS_PER_EXTRA;
    }
  }

  // Native NFT: additive contribution to the total multiplier
  let nativeNftStack = 0;
  if (multipliers.nativeNftBonus) {
    nativeNftStack = MULTIPLIER_NATIVE_NFT_BASE - 1.0 +
      multipliers.nativeNftCount * NATIVE_NFT_BONUS_PER_COLLECTION;
  }

  return {
    basePoints,
    multipliers,
    multiplierValue,
    finalScore,
    breakdown,
    protardioStack,
    nativeNftStack,
    agentBonus: multipliers.agentBonus,
  };
}

// ─── Utility Functions ───────────────────────────────────────────────────────

export function formatScore(score: number): string {
  return score.toLocaleString('en-US');
}

export function getPercentile(rank: number, totalUsers: number): number {
  if (totalUsers === 0) return 0;
  return parseFloat((((totalUsers - rank + 1) / totalUsers) * 100).toFixed(1));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ─── Test Cases (for validation) ─────────────────────────────────────────────

export const TEST_CASES = [
  {
    name: 'Basic User',
    metrics: {
      address: '0xtest1',
      totalTxs: 100,
      gasSpentEth: 0.1,
      contractsDeployed: 0,
      daysActive: 5,
      firstTxTimestamp: 1739232000, // Feb 11, 2026
      lastTxTimestamp: 1739664000,
    },
    expectedScore: 130, // (100*0.5 + 0.1*100 + 0 + 5*10 + 11*2) = 130
  },
  {
    name: 'OG Builder',
    metrics: {
      address: '0xtest2',
      totalTxs: 1000,
      gasSpentEth: 1.0,
      contractsDeployed: 3,
      daysActive: 14,
      firstTxTimestamp: 1739059200, // Feb 9, 2026 (mainnet launch)
      lastTxTimestamp: 1740268800,
    },
    expectedScore: 1836, // base=850, OG*1.5, Builder*1.2 = 1530
  },
  {
    name: 'Power User',
    metrics: {
      address: '0xtest3',
      totalTxs: 5000,
      gasSpentEth: 2.5,
      contractsDeployed: 1,
      daysActive: 14,
      firstTxTimestamp: 1739145600, // Feb 10, 2026
      lastTxTimestamp: 1740355200,
    },
    expectedScore: 6318, // All multipliers active
  },
];

// Run tests
export function runTests(): boolean {
  console.log('Running scoring engine tests...\n');
  
  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    const result = calculateScore(testCase.metrics);
    const breakdown = getScoreBreakdown(testCase.metrics);
    
    // Allow for small rounding differences
    const isClose = Math.abs(result - testCase.expectedScore) <= 10;
    
    if (isClose) {
      console.log(`✅ ${testCase.name}: ${result} (expected ~${testCase.expectedScore})`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}: ${result} (expected ${testCase.expectedScore})`);
      console.log(`   Breakdown:`, breakdown);
      failed++;
    }
  }

  console.log(`\nTests: ${passed} passed, ${failed} failed`);
  return failed === 0;
}
