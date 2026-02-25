/**
 * Chain Configuration
 * Using Base for testing until MegaETH mainnet is live
 */

export type SupportedChain = "base" | "megaeth";

export const CHAINS = {
  base: {
    id: 8453,
    name: "Base",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=8453",
  },
  megaeth: {
    id: 6342,
    name: "MegaETH",
    // Separate from the wallet RPC (NEXT_PUBLIC_MEGAETH_RPC_URL) — set this to your
    // Alchemy URL for richer tx history (alchemy_getAssetTransfers). Falls back to
    // the public globalstake endpoint which supports standard eth_getLogs only.
    rpcUrl: process.env.NEXT_PUBLIC_MEGAETH_TX_RPC_URL || "https://rpc-megaeth-mainnet.globalstake.io",
    explorerUrl: "https://megaeth.blockscout.com",
    explorerApiUrl: "https://megaeth.blockscout.com/api",
  },
} as const;

// Current active chain - MegaETH mainnet is live!
export const ACTIVE_CHAIN: SupportedChain = "megaeth";

export function getChainConfig(chain: SupportedChain = ACTIVE_CHAIN) {
  return CHAINS[chain];
}
