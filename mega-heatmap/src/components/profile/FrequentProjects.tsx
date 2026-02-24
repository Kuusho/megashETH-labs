'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FrequentProject {
  project: string;
  twitter: string;
  category: string | null;
  categoryColor: string;
  description: string | null;
  tvl_formatted: string | null;
  classification: string | null;
  interaction_count: number;
  last_interacted_at: number;
  featured: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeDate(epochSeconds: number): string {
  if (!epochSeconds) return '—';
  const diff = Date.now() - epochSeconds * 1000;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  ALPHA: 'rgba(132, 226, 150, 0.15)',
  ROUTINE: 'rgba(84, 174, 255, 0.15)',
  WARNING: 'rgba(245, 158, 11, 0.15)',
  RISK: 'rgba(239, 68, 68, 0.15)',
};
const CLASSIFICATION_TEXT: Record<string, string> = {
  ALPHA: '#84e296',
  ROUTINE: '#54AEFF',
  WARNING: '#F59E0B',
  RISK: '#EF4444',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function FrequentProjects({ address }: { address: string }) {
  const [projects, setProjects] = useState<FrequentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(false);

    fetch(`/api/user/${address}/projects`)
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => setProjects(data.projects ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 }}
      className="card p-6 mb-8"
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold" style={{ color: '#dfdadb' }}>
          Your Favourite Projects
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#878283' }}>
          from your recent transactions
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg p-4 animate-pulse"
              style={{ backgroundColor: 'rgba(174, 164, 191, 0.05)', border: '1px solid rgba(174, 164, 191, 0.08)', height: 110 }}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <p className="text-sm py-4" style={{ color: 'var(--color-dim)' }}>
          Could not load project data right now.
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--color-dim)' }}>
            No recognised projects yet — keep building on Mega!
          </p>
        </div>
      )}

      {/* Project cards */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {projects.map((p, i) => (
            <motion.div
              key={p.twitter || p.project}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg p-4 flex flex-col gap-2"
              style={{
                backgroundColor: 'rgba(174, 164, 191, 0.04)',
                border: '1px solid rgba(174, 164, 191, 0.1)',
              }}
            >
              {/* Project name row */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="font-semibold text-sm truncate"
                  style={{ color: '#dfdadb' }}
                  title={p.project}
                >
                  {p.project}
                </span>
                {p.featured && (
                  <span
                    className="shrink-0 text-xs"
                    title="Verified ecosystem project"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    ✓
                  </span>
                )}
              </div>

              {/* Category pill */}
              {p.category && (
                <span
                  className="self-start px-2 py-0.5 rounded-full text-xs font-medium truncate max-w-full"
                  style={{
                    backgroundColor: `${p.categoryColor}20`,
                    color: p.categoryColor,
                    border: `1px solid ${p.categoryColor}30`,
                  }}
                >
                  {p.category}
                </span>
              )}

              {/* Classification badge */}
              {p.classification && (
                <span
                  className="self-start px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: CLASSIFICATION_COLORS[p.classification] ?? 'rgba(174,164,191,0.08)',
                    color: CLASSIFICATION_TEXT[p.classification] ?? 'var(--color-muted)',
                  }}
                >
                  {p.classification}
                </span>
              )}

              {/* Bottom row: txs chip + last date */}
              <div className="flex items-center justify-between mt-auto pt-1">
                <span
                  className="px-2 py-0.5 rounded font-mono text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(132, 226, 150, 0.08)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {p.interaction_count} txs
                </span>
                <span className="text-xs" style={{ color: '#878283' }}>
                  {formatRelativeDate(p.last_interacted_at)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
