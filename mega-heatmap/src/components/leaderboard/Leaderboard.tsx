'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
  total_txs: number;
  days_active: number;
  contracts_deployed: number;
}

interface LeaderboardData {
  total_users: number;
  limit: number;
  offset: number;
  returned: number;
  leaderboard: LeaderboardEntry[];
  updated_at: string;
}

const RANK_COLORS: Record<number, string> = {
  1: '#e8c37a', // gold
  2: '#aea4bf', // silver (Lilac Ash)
  3: '#b8825e', // bronze
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Leaderboard() {
  const { address: currentAddress } = useAccount();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 50;

  const fetchLeaderboard = async (offset: number = 0) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard?limit=${ITEMS_PER_PAGE}&offset=${offset}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const leaderboardData = await response.json();
      setData(leaderboardData);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(page * ITEMS_PER_PAGE);
  }, [page]);

  const handlePrevPage = () => { if (page > 0) setPage(p => p - 1); };
  const handleNextPage = () => {
    if (data && page < Math.floor(data.total_users / ITEMS_PER_PAGE))
      setPage(p => p + 1);
  };

  if (loading && !data) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#84e296' }} />
          <p className="text-sm" style={{ color: '#aea4bf' }}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(174, 164, 191, 0.12)' }}
      >
        <div className="flex items-center gap-2.5">
          <Trophy className="w-4 h-4" style={{ color: '#84e296' }} />
          <h2 className="text-lg font-bold" style={{ color: '#f5f8de' }}>
            MegaETH Leaderboard
          </h2>
        </div>
        <button
          onClick={() => fetchLeaderboard(page * ITEMS_PER_PAGE)}
          className="p-1.5 rounded-md transition-colors hover:bg-[rgba(174,164,191,0.08)]"
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            style={{ color: '#8f6593' }}
          />
        </button>
      </div>

      <p className="px-6 py-3 text-xs font-mono border-b" style={{ color: '#8f6593', borderColor: 'rgba(174, 164, 191, 0.08)' }}>
        {data.total_users.toLocaleString()} total users · Updated daily at midnight UTC
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(174, 164, 191, 0.1)' }}>
              {['Rank', 'Address', 'Score', 'Txs', 'Days', 'Contracts'].map((h, i) => (
                <th
                  key={h}
                  className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider ${i > 1 ? 'text-right' : 'text-left'}`}
                  style={{ color: '#8f6593' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.leaderboard.map((entry) => {
              const isCurrentUser =
                currentAddress &&
                entry.address.toLowerCase() === currentAddress.toLowerCase();
              const rankColor = RANK_COLORS[entry.rank];

              return (
                <motion.tr
                  key={entry.address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    borderBottom: '1px solid rgba(174, 164, 191, 0.06)',
                    backgroundColor: isCurrentUser
                      ? 'rgba(132, 226, 150, 0.05)'
                      : 'transparent',
                  }}
                  className="transition-colors hover:bg-[rgba(174,164,191,0.04)]"
                >
                  <td className="py-3.5 px-4">
                    <span
                      className="text-sm font-mono font-semibold"
                      style={{ color: rankColor ?? '#aea4bf' }}
                    >
                      {entry.rank <= 3 ? '▲' : ''} #{entry.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <code
                        className="text-xs font-mono"
                        style={{ color: '#aea4bf' }}
                      >
                        {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                      </code>
                      {isCurrentUser && (
                        <span
                          className="px-1.5 py-0.5 text-[10px] font-semibold rounded"
                          style={{
                            backgroundColor: 'rgba(132, 226, 150, 0.12)',
                            color: '#84e296',
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-sm font-mono font-semibold" style={{ color: '#f5f8de' }}>
                      {entry.score.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-sm font-mono" style={{ color: '#aea4bf' }}>
                    {entry.total_txs.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-sm font-mono" style={{ color: '#aea4bf' }}>
                    {entry.days_active}
                  </td>
                  <td className="py-3.5 px-4 text-right text-sm font-mono" style={{ color: '#aea4bf' }}>
                    {entry.contracts_deployed}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="flex items-center justify-between px-6 py-4 border-t"
        style={{ borderColor: 'rgba(174, 164, 191, 0.1)' }}
      >
        <div className="text-xs font-mono" style={{ color: '#8f6593' }}>
          {page * ITEMS_PER_PAGE + 1}–
          {Math.min((page + 1) * ITEMS_PER_PAGE, data.total_users)} of{' '}
          {data.total_users.toLocaleString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>
          <button
            onClick={handleNextPage}
            disabled={page >= Math.floor(data.total_users / ITEMS_PER_PAGE)}
            className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
