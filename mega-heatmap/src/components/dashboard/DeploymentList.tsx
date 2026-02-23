/**
 * Deployment List Component
 * 
 * Displays enriched deployment data with category filtering.
 * Fetches from /api/dashboard/deployments
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export function DeploymentList() {
  const [data, setData] = useState<DeploymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchData = async (category?: string) => {
    setLoading(true);

    try {
      const url = category && category !== 'all'
        ? `/api/dashboard/deployments?category=${category}&limit=20`
        : '/api/dashboard/deployments?limit=20';
        
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const deploymentsData = await response.json();
      setData(deploymentsData);
    } catch (err) {
      console.error('Failed to fetch deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedCategory);
  }, [selectedCategory]);

  if (loading && !data) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-mega-green" />
          <p className="text-mega-gray-600">Loading projects...</p>
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
        <h2 className="text-2xl font-bold text-mega-gray-900">
          Projects on MegaETH
        </h2>
        <button
          onClick={() => fetchData(selectedCategory)}
          className="p-2 hover:bg-mega-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-mega-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Project List */}
      <div className="space-y-3">
        {data.deployments.map((deployment, index) => (
          <motion.div
            key={deployment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-mega-gray-200 hover:border-mega-green/30 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-lg bg-mega-green/10 flex items-center justify-center text-sm font-bold text-mega-green">
                {index + 1}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-mega-gray-900">
                    {deployment.project}
                  </span>
                  {deployment.verified && (
                    <CheckCircle className="w-4 h-4 text-mega-green" />
                  )}
                  {deployment.classification && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      deployment.classification === 'blue-chip' 
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-mega-gray-100 text-mega-gray-600'
                    }`}>
                      {deployment.classification}
                    </span>
                  )}
                </div>
                <div className="text-sm text-mega-gray-500">
                  {deployment.category || 'uncategorized'}
                  {deployment.twitter && (
                    <span className="ml-2 text-mega-green">{deployment.twitter}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              {deployment.tvl_formatted && (
                <div className="font-semibold text-mega-gray-900">
                  {deployment.tvl_formatted}
                </div>
              )}
              {deployment.tx_count && (
                <div className="text-xs text-mega-gray-500">
                  {deployment.tx_count.toLocaleString()} txs
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {data.deployments.length === 0 && (
        <div className="text-center py-8 text-mega-gray-500">
          No projects found in this category
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-mega-gray-200 text-center">
        <p className="text-sm text-mega-gray-500">
          {data.count} projects • Data from Bunny Intel 🐰
        </p>
      </div>
    </motion.div>
  );
}

// ─── Filter Button ───────────────────────────────────────────────────────────

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ label, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${active 
          ? 'bg-mega-green text-white' 
          : 'bg-mega-gray-100 text-mega-gray-600 hover:bg-mega-gray-200'
        }
      `}
    >
      {label}
    </button>
  );
}
