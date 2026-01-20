// Leaderboard types

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'all-time';

export type SortMetric = 'transactions' | 'streak' | 'activeDays';

export interface LeaderboardEntry {
  // Identity
  userId: string;
  displayName: string;
  displayUsername: string;
  displayPfp?: string;
  identityType: 'wallet' | 'farcaster' | 'twitter';

  // Wallet address (for fetching transaction data)
  walletAddress: string;

  // Stats
  totalTransactions: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;

  // Timeframe-specific stats
  periodTransactions: number; // Transactions in current timeframe

  // Meta
  lastUpdated: string;
  joinedAt: string;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  timeframe: TimeFrame;
  sortBy: SortMetric;
  lastSync: string | null;
}

export interface LeaderboardStats {
  totalUsers: number;
  totalTransactions: number;
  topStreak: number;
  mostActiveUser: string | null;
}
