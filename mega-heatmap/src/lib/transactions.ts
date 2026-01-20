/**
 * Transaction Data Fetching - Multi-Chain Support
 * Supports MegaETH (Blockscout) and Base (Alchemy) for comparisons
 */

import { ACTIVE_CHAIN, type SupportedChain } from "./chains";

// API Configuration
const CHAIN_APIS = {
  megaeth: {
    type: 'blockscout' as const,
    baseUrl: 'https://megaeth.blockscout.com/api',
    apiKey: process.env.NEXT_PUBLIC_MEGAETH_BLOCKSCOUT_API_KEY || '',
  },
  base: {
    type: 'alchemy' as const,
    baseUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/M6x3kxsv7R7NmVAxQEFoo',
    apiKey: '', // included in URL
  },
} as const;

export interface TransactionSummary {
  address: string;
  chain: SupportedChain;
  totalTransactions: number;
  firstTxDate: string | null;
  lastTxDate: string | null;
  dailyActivity: Map<string, number>;
}

/**
 * Fetch transaction history for an address
 * @param address - Wallet address to fetch
 * @param chain - Target chain ('megaeth' | 'base')
 */
export async function fetchTransactionHistory(
  address: string,
  chain: SupportedChain = ACTIVE_CHAIN
): Promise<TransactionSummary> {
  const config = CHAIN_APIS[chain];

  if (config.type === 'blockscout') {
    return fetchBlockscoutHistory(address, chain, config.baseUrl, config.apiKey);
  }

  return fetchAlchemyHistory(address, chain, config.baseUrl);
}

/**
 * Fetch from multiple chains in parallel for comparison
 */
export async function fetchMultiChainHistory(
  address: string,
  chains: SupportedChain[] = ['megaeth', 'base']
): Promise<Map<SupportedChain, TransactionSummary>> {
  const results = await Promise.all(
    chains.map(chain => fetchTransactionHistory(address, chain))
  );

  const map = new Map<SupportedChain, TransactionSummary>();
  results.forEach((result, i) => map.set(chains[i], result));
  return map;
}

/**
 * Blockscout API (MegaETH, and other Blockscout-based explorers)
 */
async function fetchBlockscoutHistory(
  address: string,
  chain: SupportedChain,
  baseUrl: string,
  apiKey: string
): Promise<TransactionSummary> {
  const dailyActivity = new Map<string, number>();
  let totalTransactions = 0;
  let firstTxDate: string | null = null;
  let lastTxDate: string | null = null;

  try {
    console.log(`[${chain}] Fetching transactions for:`, address);

    const apiKeyParam = apiKey ? `&apikey=${apiKey}` : '';
    const url = `${baseUrl}?module=account&action=txlist&address=${address}&sort=desc${apiKeyParam}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log(`[${chain}] Response status:`, data.status, "message:", data.message);

    if (data.status === "1" && Array.isArray(data.result)) {
      console.log(`[${chain}] Transactions found:`, data.result.length);

      for (const tx of data.result) {
        const timestamp = parseInt(tx.timeStamp, 10);
        if (!timestamp) continue;

        const date = new Date(timestamp * 1000).toISOString().split('T')[0];

        if (!firstTxDate || date < firstTxDate) firstTxDate = date;
        if (!lastTxDate || date > lastTxDate) lastTxDate = date;

        dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1);
        totalTransactions++;
      }
    } else {
      console.log(`[${chain}] No transactions or error:`, data.message);
    }

    console.log(`[${chain}] Total processed:`, totalTransactions, "Active days:", dailyActivity.size);

    return { address, chain, totalTransactions, firstTxDate, lastTxDate, dailyActivity };
  } catch (error) {
    console.error(`[${chain}] Error:`, error);
    return { address, chain, totalTransactions: 0, firstTxDate: null, lastTxDate: null, dailyActivity };
  }
}

/**
 * Alchemy API (Base, Ethereum, and other Alchemy-supported chains)
 */
async function fetchAlchemyHistory(
  address: string,
  chain: SupportedChain,
  rpcUrl: string
): Promise<TransactionSummary> {
  const dailyActivity = new Map<string, number>();
  let totalTransactions = 0;
  let firstTxDate: string | null = null;
  let lastTxDate: string | null = null;

  try {
    console.log(`[${chain}] Fetching transfers for:`, address);

    const [fromRes, toRes] = await Promise.all([
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromAddress: address,
            category: ['external', 'erc20', 'erc721', 'erc1155'],
            withMetadata: true,
            order: 'desc',
            maxCount: '0x3e8',
          }]
        })
      }),
      fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'alchemy_getAssetTransfers',
          params: [{
            toAddress: address,
            category: ['external', 'erc20', 'erc721', 'erc1155'],
            withMetadata: true,
            order: 'desc',
            maxCount: '0x3e8',
          }]
        })
      })
    ]);

    const [fromData, toData] = await Promise.all([fromRes.json(), toRes.json()]);

    console.log(`[${chain}] From transfers:`, fromData.result?.transfers?.length || 0);
    console.log(`[${chain}] To transfers:`, toData.result?.transfers?.length || 0);

    const processTransfers = (transfers: any[]) => {
      for (const tx of transfers) {
        const timestamp = tx.metadata?.blockTimestamp;
        if (!timestamp) continue;

        const date = timestamp.split('T')[0];

        if (!firstTxDate || date < firstTxDate) firstTxDate = date;
        if (!lastTxDate || date > lastTxDate) lastTxDate = date;

        dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1);
        totalTransactions++;
      }
    };

    if (fromData.result?.transfers) processTransfers(fromData.result.transfers);
    if (toData.result?.transfers) processTransfers(toData.result.transfers);

    console.log(`[${chain}] Total processed:`, totalTransactions, "Active days:", dailyActivity.size);

    return { address, chain, totalTransactions, firstTxDate, lastTxDate, dailyActivity };
  } catch (error) {
    console.error(`[${chain}] Error:`, error);
    return { address, chain, totalTransactions: 0, firstTxDate: null, lastTxDate: null, dailyActivity };
  }
}

/**
 * Filter activity to last N days
 */
export function filterToLastDays(
  activity: Map<string, number>,
  days: number = 365
): Map<string, number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const filtered = new Map<string, number>();
  for (const [date, count] of activity) {
    if (date >= cutoffStr) {
      filtered.set(date, count);
    }
  }
  return filtered;
}
