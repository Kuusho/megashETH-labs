/**
 * External Bonus Data Fetcher
 *
 * Fetches identity + NFT data for scoring multipliers:
 * - .mega domain ownership
 * - Farcaster account linkage
 * - NFT holdings (Protardio count + MegaETH native collections) — on-chain via Blockscout
 * - Protardio listing status — OpenSea API (listing check only, no ownership checks)
 * - Agent/operator registration — on-chain via Blockscout contract query
 */

import { lookupByAddress } from './neynar';
import { NFT_COLLECTIONS, MEGA_NAMES_CONTRACT } from './db/schema';
import type { ExternalBonusData } from './scoring';

const BLOCKSCOUT_API = 'https://megaeth.blockscout.com/api/v2'; // MegaETH — native NFTs

// ─── NFT Balance Check via Blockscout ────────────────────────────────────────

interface BlockscoutNft {
  token: {
    address_hash: string;  // Blockscout returns address_hash, not address
    name: string;
    type: string;
  };
  value: string;
}

interface NftHoldingResult {
  contractAddresses: string[];  // unique contract addresses held
  protardioCount: number;       // count of individual Protardio tokens held
  nativeNftCount: number;       // count of distinct native collections held (excl. Protardio)
}

// Fetch MegaETH native NFT collections (does NOT include Protardio — that's on Base)
async function fetchNftHoldings(address: string): Promise<NftHoldingResult> {
  const empty: NftHoldingResult = { contractAddresses: [], protardioCount: 0, nativeNftCount: 0 };
  try {
    const response = await fetch(
      `${BLOCKSCOUT_API}/addresses/${address.toLowerCase()}/nft?type=ERC-721`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      console.error('[ExternalBonus] MegaETH NFT fetch failed:', response.status);
      return empty;
    }

    const data = await response.json();
    const items: BlockscoutNft[] = data.items || [];

    // Unique contract addresses held on MegaETH
    const contractAddresses = [
      ...new Set(
        items
          .filter(item => item.token?.address_hash)
          .map(item => item.token.address_hash.toLowerCase())
      ),
    ];

    // Distinct native collections held (Protardio excluded — it lives on Base)
    const nativeAddrs = Object.values(NFT_COLLECTIONS)
      .map(a => a.toLowerCase())
      .filter(a => a !== NFT_COLLECTIONS.protardio.toLowerCase());
    const nativeNftCount = nativeAddrs.filter(a => contractAddresses.includes(a)).length;

    return { contractAddresses, protardioCount: 0, nativeNftCount };
  } catch (error) {
    console.error('[ExternalBonus] MegaETH NFT fetch error:', error);
    return empty;
  }
}

// Fetch Protardio count from Base via Alchemy NFT API
// (Protardio is deployed on Base, not MegaETH)
// Requires ALCHEMY_BASE_RPC_URL env var: https://base-mainnet.g.alchemy.com/v2/{key}
async function fetchProtardioCount(address: string): Promise<number> {
  const rpcUrl = process.env.ALCHEMY_BASE_RPC_URL;
  if (!rpcUrl) {
    console.warn('[ExternalBonus] ALCHEMY_BASE_RPC_URL not set, skipping Protardio check');
    return 0;
  }

  // Extract API key from RPC URL: https://base-mainnet.g.alchemy.com/v2/{key}
  const apiKey = rpcUrl.split('/').pop();
  if (!apiKey) {
    console.warn('[ExternalBonus] Could not parse Alchemy API key from ALCHEMY_BASE_RPC_URL');
    return 0;
  }

  try {
    const url = new URL(`https://base-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`);
    url.searchParams.set('owner', address.toLowerCase());
    url.searchParams.append('contractAddresses[]', NFT_COLLECTIONS.protardio);
    url.searchParams.set('withMetadata', 'false');

    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.warn('[ExternalBonus] Alchemy Protardio fetch failed:', response.status);
      return 0;
    }

    const data = await response.json();
    return (data.totalCount as number) ?? (data.ownedNfts?.length ?? 0);
  } catch (error) {
    console.warn('[ExternalBonus] Alchemy Protardio fetch error:', error);
    return 0;
  }
}

// ─── Check Specific Collection Holdings ──────────────────────────────────────

function checkCollectionHoldings(result: NftHoldingResult): {
  holdsProtardio: boolean;
  holdsNativeNft: boolean;
  collectionsHeld: string[];
} {
  const protardioAddr = NFT_COLLECTIONS.protardio.toLowerCase();
  const collectionsHeld = Object.entries(NFT_COLLECTIONS)
    .filter(([_, addr]) => result.contractAddresses.includes(addr.toLowerCase()))
    .map(([name]) => name);

  return {
    holdsProtardio: result.protardioCount > 0,
    holdsNativeNft: result.nativeNftCount > 0 ||
      result.contractAddresses.includes(protardioAddr),
    collectionsHeld,
  };
}

// ─── Protardio Listing Status via OpenSea API ─────────────────────────────────

/**
 * Returns true if the address has NO active Protardio listings (all unlisted).
 * Uses OpenSea API for listing status only — all ownership checks use Blockscout.
 * Defaults to true (optimistic) on any API failure to avoid penalising users.
 */
async function checkProtardioListingStatus(address: string): Promise<boolean> {
  const apiKey = process.env.OPENSEA_API_KEY;
  if (!apiKey) {
    console.warn('[ExternalBonus] OPENSEA_API_KEY not set, assuming all unlisted');
    return true;
  }

  try {
    const response = await fetch(
      `https://api.opensea.io/api/v2/orders/megaeth/seaport/listings` +
      `?asset_contract_address=${NFT_COLLECTIONS.protardio}` +
      `&maker=${address.toLowerCase()}` +
      `&order_by=created_date&order_direction=desc&limit=1`,
      { headers: { 'x-api-key': apiKey, Accept: 'application/json' } }
    );

    if (!response.ok) {
      console.warn('[ExternalBonus] OpenSea listing check failed:', response.status);
      return true; // optimistic on API error
    }

    const data = await response.json();
    return (data.orders?.length ?? 0) === 0; // true = no active listings = all unlisted
  } catch (error) {
    console.warn('[ExternalBonus] OpenSea listing check error:', error);
    return true; // optimistic on fetch error
  }
}

// ─── Agent / Operator Registration via Blockscout ────────────────────────────

const AGENT_REGISTRY_CONTRACT = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432';

/**
 * Returns true if the address is an ERC-8004 registered agent OR an operator
 * for a registered agent. Checks both in parallel via Blockscout read methods.
 * Defaults to false on any fetch error.
 */
async function checkAgentRegistration(address: string): Promise<boolean> {
  const contractApi =
    `${BLOCKSCOUT_API}/smart-contracts/${AGENT_REGISTRY_CONTRACT}/query-read-method`;

  try {
    const [agentRes, operatorRes] = await Promise.all([
      fetch(contractApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args: [address], method_id: 'isRegisteredAgent', from: address }),
      }),
      fetch(contractApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args: [address], method_id: 'getAgentForOperator', from: address }),
      }),
    ]);

    if (agentRes.ok) {
      const d = await agentRes.json();
      if (d.result?.[0]?.value === true) return true;
    }

    if (operatorRes.ok) {
      const d = await operatorRes.json();
      const returned = (d.result?.[0]?.value ?? '') as string;
      const ZERO = '0x0000000000000000000000000000000000000000';
      if (returned && returned !== ZERO && returned !== '0x0') return true;
    }

    return false;
  } catch (error) {
    console.warn('[ExternalBonus] Agent registration check error:', error);
    return false;
  }
}

// ─── Main Fetcher ────────────────────────────────────────────────────────────

export async function fetchExternalBonusData(address: string): Promise<ExternalBonusData> {
  console.log('[ExternalBonus] Fetching data for:', address);

  // Parallel fetch all external data
  // Note: .mega domain is detected on-chain via MegaNames NFT holdings — no dotmega API needed
  // Note: Protardio is on Base; MegaETH native collections are fetched separately
  const [farcasterUsers, nftResult, protardioCount, protardioUnlisted, isAgent] = await Promise.all([
    lookupByAddress(address),
    fetchNftHoldings(address),           // MegaETH native collections via Blockscout
    fetchProtardioCount(address),         // Protardio on Base via Base Blockscout
    checkProtardioListingStatus(address), // OpenSea API — listing status only
    checkAgentRegistration(address),      // on-chain via Blockscout
  ]);

  // Detect .mega domain ownership from on-chain NFT holdings (MegaNames ERC-721)
  const hasMegaDomain = nftResult.contractAddresses.includes(MEGA_NAMES_CONTRACT.toLowerCase());

  const nftCheck = checkCollectionHoldings(nftResult);

  const result: ExternalBonusData = {
    hasMegaDomain,
    hasFarcaster: farcasterUsers.length > 0,
    isAgent,
    protardioCount,  // from Base Blockscout
    protardioAllUnlisted: protardioUnlisted,
    holdsNativeNft: nftResult.nativeNftCount > 0,
    nativeNftCount: nftResult.nativeNftCount,
    nftHoldings: nftResult.contractAddresses,
  };

  console.log('[ExternalBonus] Result:', {
    megaDomain: hasMegaDomain,
    farcaster: farcasterUsers[0]?.username || 'none',
    collections: nftCheck.collectionsHeld.length,
    protardioCount,
    protardioAllUnlisted: protardioUnlisted,
    isAgent,
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
