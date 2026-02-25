/**
 * External Bonus Data Fetcher
 * 
 * Fetches identity + NFT data for scoring multipliers:
 * - .mega domain ownership
 * - Farcaster account linkage
 * - NFT holdings (Protardio + MegaETH native collections)
 */

import { resolveAddressToName } from './dotmega';
import { lookupByAddress } from './neynar';
import { NFT_COLLECTIONS } from './db/schema';
import type { ExternalBonusData } from './scoring';

const MEGAETH_CHAIN_ID = 4326;
const BLOCKSCOUT_API = 'https://megaeth.blockscout.com/api/v2';

// ─── NFT Balance Check via Blockscout ────────────────────────────────────────

interface BlockscoutNft {
  token: {
    address: string;
    name: string;
    type: string;
  };
  value: string;
}

async function fetchNftHoldings(address: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${BLOCKSCOUT_API}/addresses/${address.toLowerCase()}/nft?type=ERC-721`,
      { next: { revalidate: 300 } } // cache for 5 min
    );

    if (!response.ok) {
      console.error('[ExternalBonus] Blockscout NFT fetch failed:', response.status);
      return [];
    }

    const data = await response.json();
    const items: BlockscoutNft[] = data.items || [];
    
    // Extract unique contract addresses
    const holdings = items
      .filter(item => item.token?.address)
      .map(item => item.token.address.toLowerCase());

    return [...new Set(holdings)];
  } catch (error) {
    console.error('[ExternalBonus] NFT fetch error:', error);
    return [];
  }
}

// ─── Check Specific Collection Holdings ──────────────────────────────────────

function checkCollectionHoldings(holdings: string[]): {
  holdsProtardio: boolean;
  holdsNativeNft: boolean;
  collectionsHeld: string[];
} {
  const holdingsLower = holdings.map(h => h.toLowerCase());
  const collectionAddresses = Object.values(NFT_COLLECTIONS).map(a => a.toLowerCase());

  const collectionsHeld = Object.entries(NFT_COLLECTIONS)
    .filter(([_, addr]) => holdingsLower.includes(addr.toLowerCase()))
    .map(([name, _]) => name);

  return {
    holdsProtardio: holdingsLower.includes(NFT_COLLECTIONS.protardio.toLowerCase()),
    holdsNativeNft: collectionAddresses.some(addr => holdingsLower.includes(addr)),
    collectionsHeld,
  };
}

// ─── Main Fetcher ────────────────────────────────────────────────────────────

export async function fetchExternalBonusData(address: string): Promise<ExternalBonusData> {
  console.log('[ExternalBonus] Fetching data for:', address);

  // Parallel fetch all external data
  const [megaDomain, farcasterUsers, nftHoldings] = await Promise.all([
    resolveAddressToName(address),
    lookupByAddress(address),
    fetchNftHoldings(address),
  ]);

  const nftCheck = checkCollectionHoldings(nftHoldings);

  const result: ExternalBonusData = {
    hasMegaDomain: !!megaDomain?.name,
    hasFarcaster: farcasterUsers.length > 0,
    holdsProtardio: nftCheck.holdsProtardio,
    holdsNativeNft: nftCheck.holdsNativeNft,
    nftHoldings,
  };

  console.log('[ExternalBonus] Result:', {
    megaDomain: megaDomain?.name || 'none',
    farcaster: farcasterUsers[0]?.username || 'none',
    nfts: nftCheck.collectionsHeld.length,
    protardio: nftCheck.holdsProtardio,
  });

  return result;
}

// ─── Cached Fetcher (for API routes) ─────────────────────────────────────────

const bonusCache = new Map<string, { data: ExternalBonusData; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchExternalBonusDataCached(address: string): Promise<ExternalBonusData> {
  const key = address.toLowerCase();
  const cached = bonusCache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const data = await fetchExternalBonusData(address);
  bonusCache.set(key, { data, timestamp: Date.now() });

  return data;
}

// ─── Bulk Fetcher (for leaderboard) ──────────────────────────────────────────

export async function fetchExternalBonusDataBulk(
  addresses: string[],
  concurrency = 5
): Promise<Map<string, ExternalBonusData>> {
  const results = new Map<string, ExternalBonusData>();
  
  // Process in batches to respect rate limits
  for (let i = 0; i < addresses.length; i += concurrency) {
    const batch = addresses.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (addr) => {
        const data = await fetchExternalBonusDataCached(addr);
        return { addr, data };
      })
    );
    
    for (const { addr, data } of batchResults) {
      results.set(addr.toLowerCase(), data);
    }

    // Small delay between batches to be nice to APIs
    if (i + concurrency < addresses.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return results;
}
