/**
 * Leaderboard Component
 * 
 * Displays top users by MegaETH Native Score with pagination.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { RefreshCw, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

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

  const handlePrevPage = () => {
    if (page > 0) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (data && page < Math.floor(data.total_users / ITEMS_PER_PAGE)) {
      setPage(p => p + 1);
    }
  };

  if (loading && !data) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-mega-green" />
          <p className="text-mega-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-mega-green" />
          <h2 className="text-2xl font-bold text-mega-gray-900">
            MegaETH Native Leaderboard
          </h2>
        </div>
        <button
          onClick={() => fetchLeaderboard(page * ITEMS_PER_PAGE)}
          className="p-2 hover:bg-mega-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-mega-gray-400" />
        </button>
      </div>

      <p className="text-sm text-mega-gray-500 mb-6">
        {data.total_users.toLocaleString()} total users • Updated daily at midnight UTC
      </p>

      {/* Table */}
      <div className="overflow-x-auto -mx-8 px-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-mega-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-mega-gray-600">
                Rank
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-mega-gray-600">
                Address
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-mega-gray-600">
                Score 🥖
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-mega-gray-600">
                Txs
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-mega-gray-600">
                Days
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-mega-gray-600">
                Contracts
              </th>
            </tr>
          </thead>
          <tbody>
            {data.leaderboard.map((entry) => {
              const isCurrentUser = currentAddress &&
                entry.address.toLowerCase() === currentAddress.toLowerCase();

              return (
                <motion.tr
                  key={entry.address}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    border-b border-mega-gray-100 transition-colors
                    ${isCurrentUser ? 'bg-mega-green/10' : 'hover:bg-mega-gray-50'}
                  `}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {entry.rank <= 3 && (
                        <span className="text-lg">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className="font-semibold text-mega-gray-900">
                        #{entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <code className="text-sm font-mono text-mega-gray-700">
                      {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                    </code>
                    {isCurrentUser && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-mega-green bg-mega-green/10 rounded">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-mega-gray-900">
                    {entry.score.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-mega-gray-600">
                    {entry.total_txs.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-mega-gray-600">
                    {entry.days_active}
                  </td>
                  <td className="py-4 px-4 text-right text-mega-gray-600">
                    {entry.contracts_deployed}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-mega-gray-200">
        <div className="text-sm text-mega-gray-500">
          Showing {page * ITEMS_PER_PAGE + 1} - {Math.min((page + 1) * ITEMS_PER_PAGE, data.total_users)} of {data.total_users.toLocaleString()}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page >= Math.floor(data.total_users / ITEMS_PER_PAGE)}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
