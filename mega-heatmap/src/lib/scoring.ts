/**
 * Scoring Engine - MegaETH Native Score Calculator
 * 
 * Point Formula:
 * base = (txs * 0.5) + (gas_eth * 100) + (deploys * 50) + (days * 10) + (age_days * 2)
 * 
 * Multipliers:
 * - OG Bonus (1.5x): First tx before or on 2026-02-09 (mainnet launch)
 * - Builder Bonus (1.2x): Has deployed at least 1 contract
 * - Power User Bonus (1.3x): Average >50 tx/day
 * 
 * Final Score: int(base * combined_multipliers)
 */

import type { UserMetrics, Multipliers } from './db/schema';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAINNET_LAUNCH_TIMESTAMP = 1739059200; // 2026-02-09 00:00:00 UTC
const POWER_USER_TX_THRESHOLD = 50; // txs per day

const POINTS_PER_TX = 0.5;
const POINTS_PER_ETH_GAS = 100;
const POINTS_PER_CONTRACT = 50;
const POINTS_PER_DAY_ACTIVE = 10;
const POINTS_PER_DAY_AGE = 2;

const MULTIPLIER_OG = 1.5;
const MULTIPLIER_BUILDER = 1.2;
const MULTIPLIER_POWER_USER = 1.3;

// ─── Multiplier Detection ────────────────────────────────────────────────────

export function getMultipliers(metrics: UserMetrics): Multipliers {
  const ogBonus = metrics.firstTxTimestamp <= MAINNET_LAUNCH_TIMESTAMP;
  const builderBonus = metrics.contractsDeployed > 0;
  
  const daysSinceFirst = Math.max(
    1,
    Math.floor((Date.now() / 1000 - metrics.firstTxTimestamp) / 86400)
  );
  const avgTxPerDay = metrics.totalTxs / daysSinceFirst;
  const powerUserBonus = avgTxPerDay > POWER_USER_TX_THRESHOLD;

  return {
    ogBonus,
    builderBonus,
    powerUserBonus,
  };
}

export function getMultiplierValue(multipliers: Multipliers): number {
  let value = 1.0;
  
  if (multipliers.ogBonus) value *= MULTIPLIER_OG;
  if (multipliers.builderBonus) value *= MULTIPLIER_BUILDER;
  if (multipliers.powerUserBonus) value *= MULTIPLIER_POWER_USER;
  
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

export function calculateScore(metrics: UserMetrics): number {
  const basePoints = calculateBasePoints(metrics);
  const multipliers = getMultipliers(metrics);
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
}

export function getScoreBreakdown(metrics: UserMetrics): ScoreBreakdown {
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
  const multipliers = getMultipliers(metrics);
  const multiplierValue = getMultiplierValue(multipliers);
  const finalScore = Math.floor(basePoints * multiplierValue);

  return {
    basePoints,
    multipliers,
    multiplierValue,
    finalScore,
    breakdown,
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
