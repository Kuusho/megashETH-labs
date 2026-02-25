"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { type ReactNode, useState, useEffect } from "react";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { LeaderboardProvider } from "@/lib/leaderboard";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProfileGate } from "@/components/profile/ProfileGate";

// MegaETH mainnet chain configuration
const MEGAETH_RPC = process.env.NEXT_PUBLIC_MEGAETH_RPC_URL || "https://rpc-megaeth-mainnet.globalstake.io";

const megaeth = {
  id: 6342,
  name: "MegaETH",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [MEGAETH_RPC],
    },
  },
  blockExplorers: {
    default: {
      name: "MegaETH Explorer",
      url: "https://explorer.megaeth.com",
    },
  },
} as const;

// Wagmi + RainbowKit config
const config = getDefaultConfig({
  appName: "megaSHETH Labs",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [megaeth],
  transports: {
    [megaeth.id]: http(MEGAETH_RPC),
  },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
          },
        },
      })
  );

  // Prevent SSR/prerendering issues with localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/prerender, return null to prevent wallet provider issues
  // This causes a flash but prevents build errors
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            initialChain={megaeth.id}
            appInfo={{
              appName: "Bunny Intel",
              learnMoreUrl: "https://megaeth.com",
            }}
          >
            <LeaderboardProvider>
              <ProfileGate />
              {children}
            </LeaderboardProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
