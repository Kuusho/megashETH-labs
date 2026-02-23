'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';

interface Deployment {
  id: string;
  project: string;
  category: string | null;
  tvl_usd: number | null;
  tvl_formatted: string | null;
  contract_address: string | null;
  verified: boolean;
  tx_count: number | null;
  score: number | null;
  classification: string | null;
  twitter: string | null;
  deployed_at: string;
}

interface DeploymentsData {
  count: number;
  categories: string[];
  current_filter: string;
  deployments: Deployment[];
  updated_at: string;
}

export function DeploymentList() {
  const [data, setData] = useState<DeploymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchData = async (category?: string) => {
    setLoading(true);
    try {
      const url =
        category && category !== 'all'
          ? `/api/dashboard/deployments?category=${category}&limit=20`
          : '/api/dashboard/deployments?limit=20';
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setData(await response.json());
    } catch (err) {
      console.error('Failed to fetch deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(selectedCategory); }, [selectedCategory]);

  if (loading && !data) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--color-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading projects...</p>
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
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          Projects on MegaETH
        </h2>
        <button
          onClick={() => fetchData(selectedCategory)}
          className="p-1.5 rounded-md transition-colors hover:bg-[rgba(174,164,191,0.08)]"
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            style={{ color: 'var(--color-dim)' }}
          />
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {data.categories.slice(0, 6).map((cat) => (
            <FilterButton
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        {/* Project list */}
        <div className="space-y-2">
          {data.deployments.map((deployment, index) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center justify-between p-4 rounded-lg border transition-colors"
              style={{
                backgroundColor: 'var(--color-surface-raised)',
                borderColor: 'rgba(174, 164, 191, 0.1)',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(132, 226, 150, 0.25)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(174, 164, 191, 0.1)')}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                  style={{
                    backgroundColor: 'rgba(132, 226, 150, 0.1)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {deployment.project}
                    </span>
                    {deployment.verified && (
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                    )}
                    {deployment.classification && (
                      <span
                        className="px-1.5 py-0.5 text-[10px] rounded font-mono"
                        style={{
                          backgroundColor:
                            deployment.classification === 'blue-chip'
                              ? 'rgba(132, 226, 150, 0.1)'
                              : 'rgba(174, 164, 191, 0.08)',
                          color:
                            deployment.classification === 'blue-chip' ? 'var(--color-accent)' : 'var(--color-dim)',
                        }}
                      >
                        {deployment.classification}
                      </span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-dim)' }}>
                    {deployment.category || 'uncategorized'}
                    {deployment.twitter && (
                      <span className="ml-2" style={{ color: 'var(--color-accent)' }}>
                        {deployment.twitter}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                {deployment.tvl_formatted && (
                  <div className="text-sm font-semibold font-mono" style={{ color: 'var(--color-text)' }}>
                    {deployment.tvl_formatted}
                  </div>
                )}
                {deployment.tx_count && (
                  <div className="text-xs font-mono" style={{ color: 'var(--color-dim)' }}>
                    {deployment.tx_count.toLocaleString()} txs
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {data.deployments.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--color-dim)' }}>
            No projects found in this category.
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t text-center"
        style={{ borderColor: 'rgba(174, 164, 191, 0.08)' }}
      >
        <p className="text-xs font-mono" style={{ color: 'var(--color-dim)' }}>
          {data.count} projects tracked by Bunny Intel
        </p>
      </div>
    </motion.div>
  );
}

function FilterButton({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
      style={{
        backgroundColor: active ? 'var(--color-accent)' : 'rgba(174, 164, 191, 0.08)',
        color: active ? 'var(--color-bg)' : 'var(--color-muted)',
        border: active ? 'none' : '1px solid rgba(174, 164, 191, 0.15)',
      }}
    >
      {label}
    </button>
  );
}
