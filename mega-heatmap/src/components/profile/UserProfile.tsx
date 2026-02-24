'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { RefreshCw, Award, Zap, Calendar, Flame, Link2, Plus } from 'lucide-react';
import { MultiplierBadge } from './MultiplierBadge';

// ─── Profile Types ─────────────────────────────────────────────────────────────

interface ProfileWalletInfo {
  address: string;
  isPrimary: boolean;
  addedAt: number;
  score: number;
}

interface UserProfileData {
  profile: {
    id: string;
    primaryAddress: string;
    displayName: string | null;
    createdAt: number;
  };
  wallets: ProfileWalletInfo[];
  combinedScore: number;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function UserProfile({ onOpenProfileModal }: { onOpenProfileModal?: () => void }) {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [activityRes, profileRes] = await Promise.all([
        fetch(`/api/user/${address}`),
        fetch(`/api/profile?address=${address}`),
      ]);

      if (!activityRes.ok) {
        if (activityRes.status === 404) {
          setError('No onchain activity found for this address on MegaETH.');
          setData(null);
          return;
        }
        throw new Error(`HTTP ${activityRes.status}`);
      }
      setData(await activityRes.json());

      if (profileRes.ok) {
        setProfileData(await profileRes.json());
      } else {
        setProfileData(null);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) fetchUserData();
    else { setData(null); setError(null); setProfileData(null); }
  }, [address, isConnected, fetchUserData]);

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Connect your wallet to see your MegaETH activity.
        </p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--color-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading your activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <p className="text-sm mb-4" style={{ color: 'var(--color-error)' }}>{error}</p>
        <button onClick={fetchUserData} className="btn-secondary text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </motion.div>
    );
  }

  if (!data) return null;

  const metrics = [
    { label: 'Transactions', value: data.metrics.total_txs.toLocaleString(), icon: Zap },
    { label: 'Gas Spent', value: `${data.metrics.gas_spent_eth.toFixed(4)} ETH`, icon: Flame },
    { label: 'Contracts Deployed', value: data.metrics.contracts_deployed, icon: Award },
    { label: 'Days Active', value: `${data.metrics.days_active} / 14`, icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(174, 164, 191, 0.12)' }}
      >
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Your MegaETH Activity</h2>
        <button
          onClick={fetchUserData}
          className="p-1.5 rounded-md transition-colors hover:bg-[rgba(174,164,191,0.08)]"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" style={{ color: 'var(--color-dim)' }} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Warning */}
        {data.warning && (
          <div className="alert-warning text-sm">{data.warning}</div>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="card-elevated p-4 rounded-lg"
            >
              <Icon className="w-4 h-4 mb-3" style={{ color: 'var(--color-accent)' }} />
              <div className="text-xl font-bold font-mono tabular-nums mb-0.5" style={{ color: 'var(--color-text)' }}>
                {value}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-dim)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Score */}
        <div
          className="p-6 rounded-lg text-center"
          style={{
            backgroundColor: 'rgba(132, 226, 150, 0.06)',
            border: '1px solid rgba(132, 226, 150, 0.15)',
          }}
        >
          <div className="text-5xl font-bold font-mono tabular-nums mb-2" style={{ color: 'var(--color-accent)' }}>
            {data.score.megaeth_native_score.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--color-dim)' }}>
            MegaETH Native Score
          </div>
          {data.score.rank && (
            <div className="flex items-center justify-center gap-6 text-sm">
              <div>
                <span style={{ color: 'var(--color-muted)' }}>Rank </span>
                <span className="font-mono font-semibold" style={{ color: 'var(--color-text)' }}>
                  #{data.score.rank.toLocaleString()}
                </span>
                <span style={{ color: 'var(--color-dim)' }}> / {data.score.total_users.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-muted)' }}>Top </span>
                <span className="font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>
                  {(100 - data.score.percentile).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Multiplier badges */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--color-dim)' }}
          >
            Active Multipliers
          </h3>
          <div className="flex flex-wrap gap-2">
            <MultiplierBadge
              active={data.multipliers.og_bonus}
              label="OG User"
              description="First tx before or on mainnet launch"
              multiplier="1.5x"
              emoji="★"
            />
            <MultiplierBadge
              active={data.multipliers.builder_bonus}
              label="Builder"
              description="Deployed at least 1 contract"
              multiplier="1.2x"
              emoji="◈"
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

        {/* Linked Wallets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
              style={{ color: 'var(--color-dim)' }}
            >
              <Link2 className="w-3 h-3" />
              Linked Wallets
            </h3>
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors"
                style={{
                  color: 'var(--color-accent)',
                  backgroundColor: 'rgba(132, 226, 150, 0.08)',
                  border: '1px solid rgba(132, 226, 150, 0.2)',
                }}
              >
                <Plus className="w-3 h-3" />
                {profileData ? 'Add wallet' : 'Create profile'}
              </button>
            )}
          </div>

          {profileData && profileData.wallets.length > 0 ? (
            <div className="space-y-2">
              {profileData.wallets.map(w => (
                <div
                  key={w.address}
                  className="flex items-center justify-between px-3 py-2 rounded-md"
                  style={{
                    backgroundColor: 'rgba(174, 164, 191, 0.04)',
                    border: '1px solid rgba(174, 164, 191, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                      {w.address.slice(0, 8)}...{w.address.slice(-6)}
                    </span>
                    {w.isPrimary && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: 'rgba(132, 226, 150, 0.1)', color: 'var(--color-accent)' }}
                      >
                        primary
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs shrink-0 ml-3" style={{ color: 'var(--color-dim)' }}>
                    {w.score.toLocaleString()} pts
                  </span>
                </div>
              ))}

              {/* Combined score row */}
              {profileData.wallets.length > 1 && (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-md mt-1"
                  style={{
                    backgroundColor: 'rgba(132, 226, 150, 0.06)',
                    border: '1px solid rgba(132, 226, 150, 0.15)',
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                    Combined score
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                    {profileData.combinedScore.toLocaleString()} pts
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--color-dim)' }}>
              {profileData
                ? 'No additional wallets linked.'
                : 'Create a profile to link multiple wallets and combine your score.'}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{ borderColor: 'rgba(174, 164, 191, 0.1)' }}
      >
        <p className="text-xs" style={{ color: 'var(--color-dim)' }}>
          Points update daily. Keep building.
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--color-dim)' }}>
          Updated {new Date(data.last_updated).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
