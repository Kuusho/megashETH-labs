'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, Users, Zap, Boxes, Crown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function EcosystemStats() {
  const [data, setData] = useState<EcosystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard/ecosystem');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData(await response.json());
    } catch (err) {
      console.error('Failed to fetch ecosystem data:', err);
      setError('Failed to load ecosystem data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: '#84e296' }} />
          <p className="text-sm" style={{ color: '#aea4bf' }}>Loading ecosystem data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>
          {error ?? 'No data available'}
        </p>
        <button onClick={fetchData} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total TVL', value: data.total_tvl_formatted ?? 'N/A', icon: TrendingUp },
    { label: 'Active Addresses', value: data.total_addresses_formatted ?? 'N/A', icon: Users },
    { label: 'Total Transactions', value: data.total_txs_formatted ?? 'N/A', icon: Zap },
    { label: 'Projects Deployed', value: data.deployment_count.toString(), icon: Boxes },
  ];

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
        <h2 className="text-lg font-bold" style={{ color: '#f5f8de' }}>
          MegaETH Ecosystem
        </h2>
        <button
          onClick={fetchData}
          className="p-1.5 rounded-md transition-colors hover:bg-[rgba(174,164,191,0.08)]"
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            style={{ color: '#8f6593' }}
          />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: 'rgba(174, 164, 191, 0.1)' }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="p-5"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <Icon className="w-4 h-4 mb-3" style={{ color: '#84e296' }} />
              <div className="text-2xl font-bold font-mono tabular-nums mb-1" style={{ color: '#f5f8de' }}>
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: '#8f6593' }}>
                {stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top project */}
      {data.top_project && (
        <div
          className="mx-6 my-5 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(132, 226, 150, 0.06)',
            border: '1px solid rgba(132, 226, 150, 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#84e296' }} />
            <div>
              <div className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#8f6593' }}>
                Top Project by TVL
              </div>
              <div className="text-sm font-semibold" style={{ color: '#f5f8de' }}>
                {data.top_project.name}
                <span className="ml-2 font-mono text-xs" style={{ color: '#84e296' }}>
                  {data.top_project.tvl_formatted}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="px-6 py-3 border-t text-right"
        style={{ borderColor: 'rgba(174, 164, 191, 0.08)' }}
      >
        <p className="text-xs font-mono" style={{ color: '#8f6593' }}>
          Updated {new Date(data.updated_at).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
