/**
 * Ecosystem Stats Component
 * 
 * Displays MegaETH ecosystem-wide metrics in card format.
 * Fetches from /api/dashboard/ecosystem
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, Users, Zap, Boxes, Crown } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EcosystemData {
  total_tvl: number | null;
  total_tvl_formatted: string | null;
  total_addresses: number | null;
  total_addresses_formatted: string | null;
  total_txs: number | null;
  total_txs_formatted: string | null;
  txs_24h: number | null;
  txs_24h_formatted: string | null;
  avg_block_time: number | null;
  deployment_count: number;
  top_project: {
    name: string;
    tvl: number;
    tvl_formatted: string;
    category: string;
  } | null;
  updated_at: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EcosystemStats() {
  const [data, setData] = useState<EcosystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/ecosystem');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const ecosystemData = await response.json();
      setData(ecosystemData);
    } catch (err) {
      console.error('Failed to fetch ecosystem data:', err);
      setError('Failed to load ecosystem data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-mega-green" />
          <p className="text-mega-gray-600">Loading ecosystem data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-500 mb-4">{error || 'No data available'}</p>
        <button onClick={fetchData} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total TVL',
      value: data.total_tvl_formatted || 'N/A',
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      label: 'Active Addresses',
      value: data.total_addresses_formatted || 'N/A',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Total Transactions',
      value: data.total_txs_formatted || 'N/A',
      icon: Zap,
      color: 'text-yellow-500',
    },
    {
      label: 'Projects Deployed',
      value: data.deployment_count.toString(),
      icon: Boxes,
      color: 'text-purple-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-mega-gray-900">
          MegaETH Ecosystem
        </h2>
        <button
          onClick={fetchData}
          className="p-2 hover:bg-mega-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-mega-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white rounded-xl border border-mega-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-mega-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-mega-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Top Project */}
      {data.top_project && (
        <div className="p-4 bg-gradient-to-r from-mega-green/10 to-mega-green/5 rounded-xl border border-mega-green/20">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-mega-green" />
            <div>
              <div className="text-sm text-mega-gray-600">Top Project by TVL</div>
              <div className="font-semibold text-mega-gray-900">
                {data.top_project.name} — {data.top_project.tvl_formatted}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-mega-gray-200 text-center">
        <p className="text-xs text-mega-gray-400">
          Last updated: {new Date(data.updated_at).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
