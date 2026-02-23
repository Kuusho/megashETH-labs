/**
 * Activity Aggregation - Fetch & Parse MegaETH Transaction Data
 * 
 * Data Source: Blockscout API (https://megaeth.blockscout.com/api/v2)
 * 
 * Flow:
 * 1. Fetch paginated transaction history for address
 * 2. Calculate metrics (txs, gas, deployments, days active)
 * 3. Store in database
 * 4. Calculate score
 * 5. Update rank
 */

import type { UserMetrics, NewUserActivity } from './db/schema';
import { calculateScore } from './scoring';

// ─── Constants ───────────────────────────────────────────────────────────────

const BLOCKSCOUT_API_BASE = 'https://megaeth.blockscout.com/api/v2';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 10000;

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlockscoutTransaction {
  hash: string;
  block: number;
  timestamp: string; // ISO 8601
  from: {
    hash: string;
  };
  to: {
    hash: string | null; // null for contract deployments
  } | null;
  value: string; // wei
  fee: {
    value: string; // wei, total gas cost
  };
  gas_used: string;
  gas_price: string;
  status: string; // "ok" or "error"
  method: string | null;
  tx_types: string[];
}

interface BlockscoutResponse {
  items: BlockscoutTransaction[];
  next_page_params: {
    block_number: number;
    index: number;
    items_count: number;
  } | null;
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Rate limited - wait longer
      if (response.status === 429) {
        const waitTime = Math.min(RETRY_DELAY_MS * Math.pow(2, i), 10000);
        console.log(`Rate limited, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const waitTime = RETRY_DELAY_MS * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${retries} after ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Max retries exceeded');
}

// ─── Transaction Fetching ────────────────────────────────────────────────────

export async function fetchAllTransactions(
  address: string,
  maxPages = 50 // Prevent infinite loops
): Promise<BlockscoutTransaction[]> {
  const transactions: BlockscoutTransaction[] = [];
  let nextPageParams: BlockscoutResponse['next_page_params'] = null;
  let pageCount = 0;

  while (pageCount < maxPages) {
    const url = new URL(`${BLOCKSCOUT_API_BASE}/addresses/${address}/transactions`);
    
    if (nextPageParams) {
      url.searchParams.set('block_number', nextPageParams.block_number.toString());
      url.searchParams.set('index', nextPageParams.index.toString());
      url.searchParams.set('items_count', nextPageParams.items_count.toString());
    }

    try {
      const response = await fetchWithRetry(url.toString());
      const data: BlockscoutResponse = await response.json();

      transactions.push(...data.items);
      nextPageParams = data.next_page_params;
      pageCount++;

      // No more pages
      if (!nextPageParams) break;

      // Rate limiting: small delay between pages
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to fetch page ${pageCount + 1}:`, error);
      break;
    }
  }

  return transactions;
}

// ─── Metrics Calculation ─────────────────────────────────────────────────────

export function calculateMetrics(
  address: string,
  transactions: BlockscoutTransaction[]
): UserMetrics {
  if (transactions.length === 0) {
    return {
      address,
      totalTxs: 0,
      gasSpentEth: 0,
      contractsDeployed: 0,
      daysActive: 0,
      firstTxTimestamp: Math.floor(Date.now() / 1000),
      lastTxTimestamp: Math.floor(Date.now() / 1000),
    };
  }

  // Total transactions
  const totalTxs = transactions.length;

  // Total gas spent (sum of all tx fees)
  let totalGasWei = 0n;
  for (const tx of transactions) {
    if (tx.fee?.value) {
      totalGasWei += BigInt(tx.fee.value);
    }
  }
  const gasSpentEth = Number(totalGasWei) / 1e18;

  // Contract deployments (to === null)
  const contractsDeployed = transactions.filter(
    tx => tx.from.hash.toLowerCase() === address.toLowerCase() && 
          tx.to === null
  ).length;

  // Days active (unique dates)
  const uniqueDates = new Set<string>();
  for (const tx of transactions) {
    const date = new Date(tx.timestamp).toISOString().split('T')[0];
    uniqueDates.add(date);
  }
  const daysActive = uniqueDates.size;

  // First and last transaction timestamps
  const timestamps = transactions.map(tx => new Date(tx.timestamp).getTime() / 1000);
  const firstTxTimestamp = Math.min(...timestamps);
  const lastTxTimestamp = Math.max(...timestamps);

  return {
    address,
    totalTxs,
    gasSpentEth,
    contractsDeployed,
    daysActive,
    firstTxTimestamp,
    lastTxTimestamp,
  };
}

// ─── Database Operations ─────────────────────────────────────────────────────

export function metricsToDbRecord(
  metrics: UserMetrics,
  score: number
): NewUserActivity {
  return {
    address: metrics.address.toLowerCase(),
    totalTxs: metrics.totalTxs,
    gasSpentWei: (BigInt(Math.floor(metrics.gasSpentEth * 1e18))).toString(),
    gasSpentEth: metrics.gasSpentEth,
    contractsDeployed: metrics.contractsDeployed,
    daysActive: metrics.daysActive,
    firstTxTimestamp: metrics.firstTxTimestamp,
    lastTxTimestamp: metrics.lastTxTimestamp,
    megaethNativeScore: score,
    rank: null, // Will be calculated separately
    lastUpdated: Math.floor(Date.now() / 1000),
  };
}

// ─── Main Aggregation Function ──────────────────────────────────────────────

export interface AggregationResult {
  metrics: UserMetrics;
  score: number;
  dbRecord: NewUserActivity;
}

export async function aggregateUserActivity(
  address: string
): Promise<AggregationResult> {
  console.log(`Aggregating activity for ${address}...`);

  // Fetch all transactions
  const transactions = await fetchAllTransactions(address);
  console.log(`  Found ${transactions.length} transactions`);

  // Calculate metrics
  const metrics = calculateMetrics(address, transactions);
  console.log(`  Metrics:`, {
    txs: metrics.totalTxs,
    gas: metrics.gasSpentEth.toFixed(4),
    deployments: metrics.contractsDeployed,
    days: metrics.daysActive,
  });

  // Calculate score
  const score = calculateScore(metrics);
  console.log(`  Score: ${score}`);

  // Convert to DB record
  const dbRecord = metricsToDbRecord(metrics, score);

  return {
    metrics,
    score,
    dbRecord,
  };
}

// ─── Batch Processing ────────────────────────────────────────────────────────

export async function aggregateBatch(
  addresses: string[],
  onProgress?: (current: number, total: number) => void
): Promise<AggregationResult[]> {
  const results: AggregationResult[] = [];
  
  for (let i = 0; i < addresses.length; i++) {
    try {
      const result = await aggregateUserActivity(addresses[i]);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, addresses.length);
      }
      
      // Rate limiting between addresses
      if (i < addresses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Failed to aggregate ${addresses[i]}:`, error);
      // Continue with next address
    }
  }

  return results;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

// ─── Export All ──────────────────────────────────────────────────────────────

export type {
  BlockscoutTransaction,
  BlockscoutResponse,
  UserMetrics,
};
