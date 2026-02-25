'use client';

import { useState, useEffect, useCallback, useRef, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useDisconnect } from 'wagmi';
import {
  X, RefreshCw, Zap, Flame, Calendar, Award,
  Plus, Pencil, Check, Trophy, LogOut, Camera,
} from 'lucide-react';
import { Heatmap } from '@/components/heatmap';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { MultiplierBadge } from './MultiplierBadge';
import { openAddWalletModal } from './ProfileGate';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserStats {
  metrics: {
    total_txs: number;
    gas_spent_eth: number;
    contracts_deployed: number;
    days_active: number;
  };
  score: {
    megaeth_native_score: number;
    rank: number | null;
    total_users: number;
    percentile: number;
  };
  multipliers: {
    ogBonus: boolean;
    builderBonus: boolean;
    powerUserBonus: boolean;
    megaDomainBonus: boolean;
    farcasterBonus: boolean;
    protardioBonus: boolean;
    nativeNftBonus: boolean;
  };
  last_updated: string;
}

interface ProfileApiResponse {
  profile: {
    id: string;
    primaryAddress: string;
    displayName: string | null;
    twitter: string | null;
    avatarUrl: string | null;
    createdAt: number;
  };
  wallets: Array<{ address: string; isPrimary: boolean; score: number }>;
  combinedScore: number;
}

interface FrequentProject {
  project: string;
  twitter: string;
  category: string | null;
  categoryColor: string;
  classification: string | null;
  interaction_count: number;
  last_interacted_at: number;
  featured: boolean;
}

const CLASSIFICATION_TEXT: Record<string, string> = {
  ALPHA: '#84e296',
  ROUTINE: '#54AEFF',
  WARNING: '#F59E0B',
  RISK: '#EF4444',
};

// ─── Image compression helper ─────────────────────────────────────────────────

function compressImage(file: File, maxSize = 256, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── ProfilePanel ─────────────────────────────────────────────────────────────

export function ProfilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);
  const [projects, setProjects] = useState<FrequentProject[]>([]);
  const [loading, setLoading] = useState(false);

  // Inline edit
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Avatar upload
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  const { dailyActivity, stats: txStats, isLoading: heatmapLoading } = useTransactionHistory({
    address: address as string,
    enabled: open && !!address,
  });

  const fetchData = useCallback(async () => {
    if (!address || !open) return;
    setLoading(true);
    try {
      const [statsRes, profileRes, projectsRes] = await Promise.all([
        fetch(`/api/user/${address}`),
        fetch(`/api/profile?address=${address}`),
        fetch(`/api/user/${address}/projects`),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (profileRes.ok) setProfileData(await profileRes.json());
      if (projectsRes.ok) {
        const d = await projectsRes.json();
        setProjects(d.projects ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [address, open]);

  useEffect(() => {
    if (open && address) fetchData();
  }, [open, address, fetchData]);

  useEffect(() => {
    const handler = () => { if (address) fetchData(); };
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, [address, fetchData]);

  const startEdit = () => {
    setEditName(profileData?.profile.displayName ?? '');
    setEditTwitter(profileData?.profile.twitter ?? '');
    setSaveError(null);
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSaveError(null); };

  const saveEdit = async () => {
    if (!address || !editName.trim()) { setSaveError('Display name required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, displayName: editName.trim(), twitter: editTwitter.trim() || '' }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      setProfileData(prev =>
        prev ? { ...prev, profile: { ...prev.profile, ...updated.profile } } : prev
      );
      window.dispatchEvent(new Event('profile-updated'));
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !address) return;
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';

    setAvatarUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, avatarUrl: dataUrl }),
      });
      if (!res.ok) throw new Error('Upload failed');
      const updated = await res.json();
      setProfileData(prev =>
        prev ? { ...prev, profile: { ...prev.profile, avatarUrl: updated.profile.avatarUrl } } : prev
      );
      window.dispatchEvent(new Event('profile-updated'));
    } catch {
      // silently ignore for now
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const profile = profileData?.profile;
  const avatarUrl = profile?.avatarUrl ?? null;
  const displayScore =
    profileData && profileData.wallets.length > 1
      ? profileData.combinedScore
      : stats?.score.megaeth_native_score ?? 0;

  const twitterLabel = profile?.twitter
    ? profile.twitter.startsWith('@') ? profile.twitter : `@${profile.twitter}`
    : null;

  const truncAddr = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : '';
  const initial = profile?.displayName?.slice(0, 1).toUpperCase() ?? address?.slice(2, 3).toUpperCase() ?? '?';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(10, 9, 9, 0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="profile-panel-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 bottom-0 z-[61] flex flex-col w-full sm:w-[460px]"
            style={{
              backgroundColor: 'var(--color-bg)',
              borderLeft: '1px solid rgba(174, 164, 191, 0.1)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.45)',
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b shrink-0"
              style={{ borderColor: 'rgba(174, 164, 191, 0.1)' }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar with upload overlay */}
                <div
                  className="relative shrink-0 cursor-pointer"
                  onMouseEnter={() => setAvatarHovered(true)}
                  onMouseLeave={() => setAvatarHovered(false)}
                  onClick={() => !avatarUploading && fileInputRef.current?.click()}
                  title="Change profile picture"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden transition-all duration-150"
                    style={{
                      backgroundColor: 'rgba(132, 226, 150, 0.12)',
                      border: `1.5px solid ${avatarHovered ? 'rgba(132,226,150,0.6)' : 'rgba(132, 226, 150, 0.3)'}`,
                      color: 'var(--color-accent)',
                    }}
                  >
                    {avatarUploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  {/* Camera overlay on hover */}
                  <AnimatePresence>
                    {avatarHovered && !avatarUploading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-0 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                      >
                        <Camera className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />

                {/* Identity — normal or edit mode */}
                {editing ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      placeholder="Display name"
                      className="px-2 py-1 rounded text-sm font-semibold outline-none w-32"
                      style={{
                        backgroundColor: 'rgba(174,164,191,0.08)',
                        border: '1px solid rgba(174,164,191,0.2)',
                        color: 'var(--color-text)',
                      }}
                      autoFocus
                    />
                    <input
                      value={editTwitter}
                      onChange={e => setEditTwitter(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      placeholder="@twitter"
                      className="px-2 py-1 rounded text-xs outline-none w-24"
                      style={{
                        backgroundColor: 'rgba(174,164,191,0.08)',
                        border: '1px solid rgba(174,164,191,0.2)',
                        color: 'var(--color-muted)',
                      }}
                    />
                    {saveError && (
                      <span className="text-xs w-full" style={{ color: 'var(--color-error)' }}>{saveError}</span>
                    )}
                    <button onClick={saveEdit} disabled={saving} style={{ color: 'var(--color-accent)' }}>
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={cancelEdit} style={{ color: 'var(--color-dim)' }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                        {profile?.displayName ?? truncAddr}
                      </span>
                      {profile && (
                        <button
                          onClick={startEdit}
                          className="opacity-40 hover:opacity-100 transition-opacity shrink-0"
                          style={{ color: 'var(--color-dim)' }}
                          title="Edit profile"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-dim)' }}>
                      {twitterLabel ?? truncAddr}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors hover:bg-[rgba(174,164,191,0.08)] shrink-0 ml-2"
                style={{ color: 'var(--color-dim)' }}
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {loading && !stats ? (
                <div className="flex items-center justify-center py-16 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--color-accent)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Loading profile...</span>
                </div>
              ) : (
                <div className="p-5 space-y-5">

                  {/* Address chip */}
                  <div
                    className="px-3 py-2 rounded-md font-mono text-xs break-all"
                    style={{
                      backgroundColor: 'rgba(174,164,191,0.04)',
                      border: '1px solid rgba(174,164,191,0.08)',
                      color: 'var(--color-muted)',
                    }}
                  >
                    {address}
                  </div>

                  {/* ─── Heatmap ─────────────────────────────── */}
                  <PanelSection title="Activity">
                    {heatmapLoading ? (
                      <div className="h-20 flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'var(--color-dim)' }} />
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                          <Heatmap data={dailyActivity} colorScheme="violet" showLabels={false} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <MiniStat label="Current Streak" value={`${txStats.currentStreak}d`} accent={txStats.currentStreak > 0} />
                          <MiniStat label="Longest Streak" value={`${txStats.longestStreak}d`} />
                          <MiniStat label="Total Txs" value={txStats.totalTransactions.toLocaleString()} />
                          <MiniStat label="Active Days" value={`${txStats.activeDays}`} />
                        </div>
                      </>
                    )}
                  </PanelSection>

                  {/* ─── Score & Rank ────────────────────────── */}
                  {stats && (
                    <PanelSection title="Score & Rank">
                      <div
                        className="rounded-lg p-4 text-center"
                        style={{
                          backgroundColor: 'rgba(132,226,150,0.06)',
                          border: '1px solid rgba(132,226,150,0.15)',
                        }}
                      >
                        <div
                          className="text-4xl font-bold font-mono tabular-nums mb-1"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {displayScore.toLocaleString()}
                        </div>
                        <div
                          className="text-xs uppercase tracking-wider mb-3"
                          style={{ color: 'var(--color-dim)' }}
                        >
                          {profileData && profileData.wallets.length > 1 ? 'Combined Score' : 'MegaETH Points'}
                        </div>
                        {stats.score.rank && (
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <Trophy className="w-3 h-3" style={{ color: 'var(--color-accent)' }} />
                              <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                                #{stats.score.rank.toLocaleString()}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--color-dim)' }}>
                                / {stats.score.total_users.toLocaleString()}
                              </span>
                            </div>
                            <div
                              className="px-2 py-0.5 rounded text-xs font-semibold"
                              style={{ backgroundColor: 'rgba(132,226,150,0.12)', color: 'var(--color-accent)' }}
                            >
                              Top {(100 - stats.score.percentile).toFixed(1)}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Multipliers */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <MultiplierBadge
                          active={stats.multipliers.ogBonus}
                          label="OG User"
                          description="First tx on mainnet launch"
                          multiplier="1.5x"
                          emoji="★"
                        />
                        <MultiplierBadge
                          active={stats.multipliers.builderBonus}
                          label="Builder"
                          description="Deployed ≥1 contract"
                          multiplier="1.2x"
                          emoji="◈"
                        />
                        <MultiplierBadge
                          active={stats.multipliers.powerUserBonus}
                          label="Power User"
                          description="Avg >50 tx/day"
                          multiplier="1.3x"
                          emoji="⚡"
                        />
                        <MultiplierBadge
                          active={stats.multipliers.megaDomainBonus}
                          label=".mega"
                          description="Owns a .mega domain name"
                          multiplier="1.15x"
                          emoji="◎"
                        />
                        <MultiplierBadge
                          active={stats.multipliers.farcasterBonus}
                          label="Farcaster"
                          description="Linked Farcaster account"
                          multiplier="1.1x"
                          emoji="⬡"
                        />
                        <MultiplierBadge
                          active={stats.multipliers.protardioBonus}
                          label="Protardio"
                          description="Holds Protardio NFT"
                          multiplier="1.2x"
                          emoji="◉"
                        />
                        <MultiplierBadge
                          active={!stats.multipliers.protardioBonus && stats.multipliers.nativeNftBonus}
                          label="Native NFT"
                          description="Holds a MegaETH native NFT"
                          multiplier="1.1x"
                          emoji="◆"
                        />
                      </div>
                    </PanelSection>
                  )}

                  {/* ─── On-chain Activity ───────────────────── */}
                  {stats && (
                    <PanelSection title="On-chain Activity">
                      <div className="grid grid-cols-2 gap-2">
                        <MetricCard icon={Zap} label="Transactions" value={stats.metrics.total_txs.toLocaleString()} />
                        <MetricCard icon={Flame} label="Gas Spent" value={`${stats.metrics.gas_spent_eth.toFixed(3)} ETH`} />
                        <MetricCard icon={Award} label="Contracts" value={stats.metrics.contracts_deployed.toString()} />
                        <MetricCard icon={Calendar} label="Days Active" value={`${stats.metrics.days_active} / 14`} />
                      </div>
                    </PanelSection>
                  )}

                  {/* ─── Frequent Projects ───────────────────── */}
                  {projects.length > 0 && (
                    <PanelSection title="Frequent Projects">
                      <div className="grid grid-cols-2 gap-2">
                        {projects.slice(0, 6).map(p => (
                          <div
                            key={p.twitter || p.project}
                            className="rounded-lg p-3 flex flex-col gap-1.5"
                            style={{
                              backgroundColor: 'rgba(174,164,191,0.04)',
                              border: '1px solid rgba(174,164,191,0.08)',
                            }}
                          >
                            <div className="flex items-center gap-1 min-w-0">
                              <span
                                className="text-xs font-semibold truncate"
                                style={{ color: 'var(--color-text)' }}
                                title={p.project}
                              >
                                {p.project}
                              </span>
                              {p.featured && (
                                <span className="text-xs shrink-0" style={{ color: 'var(--color-accent)' }}>✓</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: 'rgba(132,226,150,0.08)',
                                  color: 'var(--color-accent)',
                                }}
                              >
                                {p.interaction_count}x
                              </span>
                              {p.classification && (
                                <span
                                  className="text-xs"
                                  style={{ color: CLASSIFICATION_TEXT[p.classification] ?? 'var(--color-dim)' }}
                                >
                                  {p.classification}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </PanelSection>
                  )}

                  {/* ─── Linked Wallets ──────────────────────── */}
                  {profileData && (
                    <PanelSection
                      title="Linked Wallets"
                      action={
                        <button
                          onClick={openAddWalletModal}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors"
                          style={{
                            color: 'var(--color-accent)',
                            backgroundColor: 'rgba(132,226,150,0.08)',
                            border: '1px solid rgba(132,226,150,0.2)',
                          }}
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      }
                    >
                      <div className="space-y-1.5">
                        {profileData.wallets.map(w => (
                          <div
                            key={w.address}
                            className="flex items-center justify-between px-3 py-2 rounded-md"
                            style={{
                              backgroundColor: 'rgba(174,164,191,0.04)',
                              border: '1px solid rgba(174,164,191,0.08)',
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                                {w.address.slice(0, 8)}...{w.address.slice(-6)}
                              </span>
                              {w.isPrimary && (
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded shrink-0"
                                  style={{ backgroundColor: 'rgba(132,226,150,0.1)', color: 'var(--color-accent)' }}
                                >
                                  primary
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs shrink-0 ml-2" style={{ color: 'var(--color-dim)' }}>
                              {w.score.toLocaleString()} pts
                            </span>
                          </div>
                        ))}
                        {profileData.wallets.length > 1 && (
                          <div
                            className="flex items-center justify-between px-3 py-2 rounded-md"
                            style={{
                              backgroundColor: 'rgba(132,226,150,0.06)',
                              border: '1px solid rgba(132,226,150,0.15)',
                            }}
                          >
                            <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>Combined</span>
                            <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                              {profileData.combinedScore.toLocaleString()} pts
                            </span>
                          </div>
                        )}
                      </div>
                    </PanelSection>
                  )}

                  {/* Footer */}
                  {stats && (
                    <p className="text-xs text-center" style={{ color: 'var(--color-dim)' }}>
                      Data updated {new Date(stats.last_updated).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Disconnect footer */}
            <div
              className="shrink-0 px-5 py-3 border-t"
              style={{ borderColor: 'rgba(174,164,191,0.08)' }}
            >
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-colors"
                style={{
                  color: 'var(--color-dim)',
                  border: '1px solid rgba(174,164,191,0.1)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-error)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-dim)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(174,164,191,0.1)';
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect Wallet
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PanelSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--color-dim)' }}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="px-3 py-2.5 rounded-md"
      style={{
        backgroundColor: accent ? 'rgba(132,226,150,0.06)' : 'rgba(174,164,191,0.04)',
        border: `1px solid ${accent ? 'rgba(132,226,150,0.2)' : 'rgba(174,164,191,0.08)'}`,
      }}
    >
      <div className="text-xs mb-0.5" style={{ color: 'var(--color-dim)' }}>{label}</div>
      <div
        className="text-sm font-bold font-mono tabular-nums"
        style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text)' }}
      >
        {value}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
}) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        backgroundColor: 'rgba(174,164,191,0.04)',
        border: '1px solid rgba(174,164,191,0.08)',
      }}
    >
      <Icon className="w-3.5 h-3.5 mb-2" style={{ color: 'var(--color-accent)' }} />
      <div className="text-sm font-bold font-mono tabular-nums" style={{ color: 'var(--color-text)' }}>
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--color-dim)' }}>{label}</div>
    </div>
  );
}
