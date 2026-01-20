"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  fetchTransactionHistory,
  filterToLastDays,
  type TransactionSummary,
} from "@/lib/transactions";
import { ACTIVE_CHAIN, type SupportedChain } from "@/lib/chains";
import { calculateStreak } from "@/lib/utils";

interface UseTransactionHistoryOptions {
  address?: string;
  chain?: SupportedChain;
  days?: number;
  enabled?: boolean;
}

interface TransactionHistoryResult {
  data: TransactionSummary | null;
  dailyActivity: Map<string, number>;
  stats: {
    totalTransactions: number;
    activeDays: number;
    currentStreak: number;
    longestStreak: number;
  };
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTransactionHistory({
  address: addressProp,
  chain = ACTIVE_CHAIN,
  days = 365,
  enabled = true,
}: UseTransactionHistoryOptions = {}): TransactionHistoryResult {
  const { address: connectedAddress } = useAccount();
  const address = addressProp || connectedAddress;

  console.log("[useTransactionHistory] address:", address, "enabled:", enabled, "will fetch:", enabled && !!address);

  const query = useQuery({
    queryKey: ["transactionHistory", address, chain],
    queryFn: () => fetchTransactionHistory(address!, chain),
    enabled: enabled && !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Filter to last N days
  const dailyActivity = query.data
    ? filterToLastDays(query.data.dailyActivity, days)
    : new Map<string, number>();

  // Calculate stats
  const { current: currentStreak, longest: longestStreak } =
    calculateStreak(dailyActivity);
  const totalTransactions = Array.from(dailyActivity.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const activeDays = dailyActivity.size;

  return {
    data: query.data || null,
    dailyActivity,
    stats: {
      totalTransactions,
      activeDays,
      currentStreak,
      longestStreak,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for comparing two addresses
 */
export function useCompareTransactionHistory(
  addressA: string | undefined,
  addressB: string | undefined,
  chain: SupportedChain = ACTIVE_CHAIN
) {
  const historyA = useTransactionHistory({
    address: addressA,
    chain,
    enabled: !!addressA,
  });

  const historyB = useTransactionHistory({
    address: addressB,
    chain,
    enabled: !!addressB,
  });

  return {
    userA: historyA,
    userB: historyB,
    isLoading: historyA.isLoading || historyB.isLoading,
    isError: historyA.isError || historyB.isError,
  };
}
