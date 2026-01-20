"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";
import {
  type LeaderboardEntry,
  type LeaderboardState,
  type LeaderboardStats,
  type TimeFrame,
  type SortMetric,
} from "./types";

const STORAGE_KEY = "megasheth_leaderboard";

// Initial state
const initialState: LeaderboardState = {
  entries: [],
  timeframe: 'all-time',
  sortBy: 'transactions',
  lastSync: null,
};

// Context
interface LeaderboardContextValue {
  entries: LeaderboardEntry[];
  timeframe: TimeFrame;
  sortBy: SortMetric;
  stats: LeaderboardStats;
  isLoading: boolean;
  isOnLeaderboard: boolean;
  joinLeaderboard: (displayName?: string) => void;
  leaveLeaderboard: () => void;
  updateMyStats: (stats: Partial<LeaderboardEntry>) => void;
  setTimeframe: (tf: TimeFrame) => void;
  setSortBy: (metric: SortMetric) => void;
  refreshLeaderboard: () => void;
  getRank: (walletAddress: string) => number | null;
}

const LeaderboardContext = createContext<LeaderboardContextValue | null>(null);

// Sort entries based on metric and timeframe
function sortEntries(
  entries: LeaderboardEntry[],
  sortBy: SortMetric,
  timeframe: TimeFrame
): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (sortBy === 'transactions') {
      if (timeframe !== 'all-time') {
        return b.periodTransactions - a.periodTransactions;
      }
      return b.totalTransactions - a.totalTransactions;
    }
    if (sortBy === 'streak') {
      return b.currentStreak - a.currentStreak;
    }
    if (sortBy === 'activeDays') {
      return b.activeDays - a.activeDays;
    }
    return 0;
  });
}

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<LeaderboardState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LeaderboardState;
        setState(parsed);
        console.log("[Leaderboard] Loaded", parsed.entries.length, "entries");
      }
    } catch (error) {
      console.error("[Leaderboard] Failed to load:", error);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  // Check if current wallet is on leaderboard
  const isOnLeaderboard = !!address && state.entries.some(
    e => e.walletAddress.toLowerCase() === address.toLowerCase()
  );

  // Join leaderboard
  const joinLeaderboard = useCallback((displayName?: string) => {
    if (!address || !isConnected) {
      console.warn("[Leaderboard] Cannot join without wallet");
      return;
    }

    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const newEntry: LeaderboardEntry = {
      userId: address.toLowerCase(),
      displayName: displayName || shortAddr,
      displayUsername: shortAddr,
      displayPfp: undefined,
      identityType: 'wallet',
      walletAddress: address.toLowerCase(),
      totalTransactions: 0,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      periodTransactions: 0,
      lastUpdated: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      entries: [...prev.entries.filter(e => e.walletAddress.toLowerCase() !== address.toLowerCase()), newEntry],
      lastSync: new Date().toISOString(),
    }));

    console.log("[Leaderboard] Joined:", shortAddr);
  }, [address, isConnected]);

  // Leave leaderboard
  const leaveLeaderboard = useCallback(() => {
    if (!address) return;

    setState(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.walletAddress.toLowerCase() !== address.toLowerCase()),
    }));

    console.log("[Leaderboard] Left");
  }, [address]);

  // Update my stats
  const updateMyStats = useCallback((stats: Partial<LeaderboardEntry>) => {
    if (!address) return;

    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e =>
        e.walletAddress.toLowerCase() === address.toLowerCase()
          ? {
              ...e,
              ...stats,
              lastUpdated: new Date().toISOString(),
            }
          : e
      ),
    }));
  }, [address]);

  // Set timeframe
  const setTimeframe = useCallback((tf: TimeFrame) => {
    setState(prev => ({ ...prev, timeframe: tf }));
  }, []);

  // Set sort metric
  const setSortBy = useCallback((metric: SortMetric) => {
    setState(prev => ({ ...prev, sortBy: metric }));
  }, []);

  // Refresh leaderboard
  const refreshLeaderboard = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastSync: new Date().toISOString(),
    }));
  }, []);

  // Get wallet's rank
  const getRank = useCallback((walletAddress: string): number | null => {
    const sorted = sortEntries(state.entries, state.sortBy, state.timeframe);
    const index = sorted.findIndex(e => e.walletAddress.toLowerCase() === walletAddress.toLowerCase());
    return index >= 0 ? index + 1 : null;
  }, [state.entries, state.sortBy, state.timeframe]);

  // Compute stats
  const stats: LeaderboardStats = {
    totalUsers: state.entries.length,
    totalTransactions: state.entries.reduce((sum, e) => sum + e.totalTransactions, 0),
    topStreak: Math.max(0, ...state.entries.map(e => e.currentStreak)),
    mostActiveUser: state.entries.length > 0
      ? sortEntries(state.entries, 'transactions', 'all-time')[0]?.displayUsername || null
      : null,
  };

  // Get sorted entries
  const sortedEntries = sortEntries(state.entries, state.sortBy, state.timeframe);

  return (
    <LeaderboardContext.Provider
      value={{
        entries: sortedEntries,
        timeframe: state.timeframe,
        sortBy: state.sortBy,
        stats,
        isLoading,
        isOnLeaderboard,
        joinLeaderboard,
        leaveLeaderboard,
        updateMyStats,
        setTimeframe,
        setSortBy,
        refreshLeaderboard,
        getRank,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error("useLeaderboard must be used within LeaderboardProvider");
  }
  return context;
}
