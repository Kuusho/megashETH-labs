/**
 * User Profile Component
 * 
 * Displays MegaETH Native Score, metrics, rank, and multiplier badges.
 * Fetches data from /api/user/:address
 */

'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { RefreshCw, Award, Zap, Calendar, Flame } from 'lucide-react';
import { MultiplierBadge } from './MultiplierBadge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserData {
  address: string;
  metrics: {
    total_txs: number;
    gas_spent_eth: number;
    contracts_deployed: number;
    days_active: number;
    first_tx_date: string;
    avg_tx_per_day: number;
  };
  score: {
    megaeth_native_score: number;
    rank: number | null;
    total_users: number;
    percentile: number;
  };
  multipliers: {
    og_bonus: boolean;
    builder_bonus: boolean;
    power_user_bonus: boolean;
  };
  last_updated: string;
  warning?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserProfile() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/${address}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No onchain activity found for this address on MegaETH.');
          setData(null);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const userData = await response.json();
      setData(userData);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
    } else {
      setData(null);
      setError(null);
    }
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center"
      >
        <p className="text-mega-gray-600">
          Connect your wallet to see your MegaETH Activity
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8"
      >
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-mega-green" />
          <p className="text-mega-gray-600">Loading your activity...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchUserData}
          className="btn-secondary text-sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </motion.div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-mega-gray-900">
          Your MegaETH Activity
        </h2>
        <button
          onClick={fetchUserData}
          className="p-2 hover:bg-mega-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-mega-gray-400" />
        </button>
      </div>

      {data.warning && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{data.warning}</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Transactions"
          value={data.metrics.total_txs.toLocaleString()}
          icon={Zap}
        />
        <MetricCard
          label="Gas Spent"
          value={`${data.metrics.gas_spent_eth.toFixed(4)} ETH`}
          icon={Flame}
        />
        <MetricCard
          label="Contracts Deployed"
          value={data.metrics.contracts_deployed}
          icon={Award}
        />
        <MetricCard
          label="Days Active"
          value={`${data.metrics.days_active} / 14`}
          icon={Calendar}
        />
      </div>

      {/* Score Section */}
      <div className="mb-8 p-6 bg-gradient-to-br from-mega-green/10 to-mega-green/5 rounded-xl border border-mega-green/20">
        <div className="text-center mb-4">
          <div className="text-6xl font-bold text-mega-green mb-2">
            🥖 {data.score.megaeth_native_score.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-mega-gray-600">
            MegaETH Native Score
          </div>
        </div>

        {data.score.rank && (
          <div className="flex items-center justify-center space-x-6 text-sm text-mega-gray-600">
            <div>
              <span className="font-semibold text-mega-gray-900">Rank:</span>{' '}
              #{data.score.rank.toLocaleString()} / {data.score.total_users.toLocaleString()}
            </div>
            <div>
              <span className="font-semibold text-mega-gray-900">Percentile:</span>{' '}
              Top {(100 - data.score.percentile).toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* Multiplier Badges */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-mega-gray-600 mb-3">Active Multipliers</h3>
        <div className="flex flex-wrap gap-2">
          <MultiplierBadge
            active={data.multipliers.og_bonus}
            label="OG User"
            description="First tx before or on mainnet launch"
            multiplier="1.5x"
            emoji="🌟"
          />
          <MultiplierBadge
            active={data.multipliers.builder_bonus}
            label="Builder"
            description="Deployed at least 1 contract"
            multiplier="1.2x"
            emoji="🛠️"
          />
          <MultiplierBadge
            active={data.multipliers.power_user_bonus}
            label="Power User"
            description="Average >50 tx/day"
            multiplier="1.3x"
            emoji="⚡"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-mega-gray-200 text-center">
        <p className="text-sm text-mega-gray-500">
          Points update daily. Keep building. 🐰
        </p>
        <p className="text-xs text-mega-gray-400 mt-2">
          Last updated: {new Date(data.last_updated).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-mega-gray-200">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-mega-green" />
      </div>
      <div className="text-2xl font-bold text-mega-gray-900 mb-1">
        {value}
      </div>
      <div className="text-xs text-mega-gray-500">{label}</div>
    </div>
  );
}
