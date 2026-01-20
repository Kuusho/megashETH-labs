/**
 * Chain Configuration
 * Using Base for testing until MegaETH mainnet is live
 */

export type SupportedChain = "base" | "megaeth";

export const CHAINS = {
  base: {
    id: 8453,
    name: "Base",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://base-mainnet.g.alchemy.com/v2/M6x3kxsv7R7NmVAxQEFoo",
    explorerUrl: "https://basescan.org",
    explorerApiUrl: "https://api.etherscan.io/v2/api?chainid=8453",
  },
  megaeth: {
    id: 4326,
    name: "MegaETH",
    rpcUrl: process.env.NEXT_PUBLIC_MEGAETH_RPC_URL || "https://megaeth-mainnet.g.alchemy.com/v2/M6x3kxsv7R7NmVAxQEFoo",
    explorerUrl: "https://megaeth.blockscout.com",
    explorerApiUrl: "https://megaeth.blockscout.com/api",
  },
} as const;

// Current active chain - MegaETH mainnet is live!
export const ACTIVE_CHAIN: SupportedChain = "megaeth";

export function getChainConfig(chain: SupportedChain = ACTIVE_CHAIN) {
  return CHAINS[chain];
}
