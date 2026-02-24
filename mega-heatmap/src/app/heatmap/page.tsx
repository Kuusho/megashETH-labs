"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Heatmap } from "@/components/heatmap";
import { AddressSearch } from "@/components/AddressSearch";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { cn, calculateStreak, formatAddress } from "@/lib/utils";
import { ACTIVE_CHAIN } from "@/lib/chains";
import type { ResolvedUser } from "@/lib/neynar";
import { Check, Copy, Image as ImageIcon } from "lucide-react";
import { UserProfile, ProfileSetupModal, FrequentProjects, useProfileModal } from "@/components/profile";

// Demo data generator (fallback when not connected or no data)
function generateDemoData(seed: string = "default"): Map<string, number> {
  const data = new Map<string, number>();
  const today = new Date();
  const seedNum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const rand = Math.sin(seedNum + i) * 10000;
    const normalizedRand = rand - Math.floor(rand);

    if (normalizedRand > 0.3) {
      const count = Math.floor(normalizedRand * 15) + 1;
      data.set(dateStr, count);
    }
  }

  return data;
}

const COLOR_SCHEMES = [
  { id: "violet", name: "Violet", color: "var(--color-dim)" },
  { id: "fire", name: "Fire", color: "#eb4511" },
  { id: "ocean", name: "Ocean", color: "#54AEFF" },
  { id: "forest", name: "Forest", color: "#39D353" },
] as const;

type LookupMode = "connect" | "lookup";

export default function HeatmapPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const profileModal = useProfileModal();
  const [colorScheme, setColorScheme] = useState<"violet" | "fire" | "ocean" | "forest">("violet");
  const [lookupMode, setLookupMode] = useState<LookupMode>("connect");

  // Lookup state
  const [lookupAddress, setLookupAddress] = useState<string | null>(null);
  const [lookupUser, setLookupUser] = useState<ResolvedUser | null>(null);

  // Comparison state
  const [compareUserA, setCompareUserA] = useState<{ address: string; user?: ResolvedUser } | null>(null);
  const [compareUserB, setCompareUserB] = useState<{ address: string; user?: ResolvedUser } | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied" | "image-copied">("idle");

  // Determine active address based on mode
  const activeAddress = lookupMode === "lookup" ? lookupAddress : connectedAddress;
  const hasActiveAddress = Boolean(activeAddress);

  // Fetch real data for active address
  const {
    dailyActivity: realData,
    stats: realStats,
    isLoading,
    isError,
  } = useTransactionHistory({
    address: activeAddress as string,
    enabled: hasActiveAddress,
  });

  // Fetch comparison data
  const {
    dailyActivity: compareDataA,
    stats: compareStatsA,
    isLoading: isLoadingA,
  } = useTransactionHistory({
    address: compareUserA?.address as string,
    enabled: Boolean(compareUserA?.address),
  });

  const {
    dailyActivity: compareDataB,
    stats: compareStatsB,
    isLoading: isLoadingB,
  } = useTransactionHistory({
    address: compareUserB?.address as string,
    enabled: Boolean(compareUserB?.address),
  });

  // Fallback to demo data
  const demoData = useMemo(() => generateDemoData("mydata"), []);
  const demoStats = useMemo(() => {
    const { current, longest } = calculateStreak(demoData);
    const totalTxs = Array.from(demoData.values()).reduce((sum, count) => sum + count, 0);
    return { currentStreak: current, longestStreak: longest, totalTransactions: totalTxs, activeDays: demoData.size };
  }, [demoData]);

  // Use real data if available, otherwise demo
  const displayData = hasActiveAddress && realData.size > 0 ? realData : demoData;
  const displayStats = hasActiveAddress && realData.size > 0 ? realStats : demoStats;
  const isUsingDemoData = !hasActiveAddress || realData.size === 0;

  // Handle address lookup
  const handleAddressResolved = useCallback((address: string, user?: ResolvedUser) => {
    setLookupAddress(address);
    setLookupUser(user || null);
  }, []);

  // Handle comparison lookups
  const handleCompareA = useCallback((address: string, user?: ResolvedUser) => {
    setCompareUserA({ address, user });
  }, []);

  const handleCompareB = useCallback((address: string, user?: ResolvedUser) => {
    setCompareUserB({ address, user });
  }, []);

  // Build OG image URL for comparison
  const buildOgUrl = useCallback(() => {
    if (!compareUserA || !compareUserB) return null;

    const winsA = [
      compareStatsA.totalTransactions > compareStatsB.totalTransactions,
      compareStatsA.currentStreak > compareStatsB.currentStreak,
      compareStatsA.longestStreak > compareStatsB.longestStreak,
      compareStatsA.activeDays > compareStatsB.activeDays,
    ].filter(Boolean).length;

    const winsB = [
      compareStatsB.totalTransactions > compareStatsA.totalTransactions,
      compareStatsB.currentStreak > compareStatsA.currentStreak,
      compareStatsB.longestStreak > compareStatsA.longestStreak,
      compareStatsB.activeDays > compareStatsA.activeDays,
    ].filter(Boolean).length;

    const params = new URLSearchParams({
      userA: compareUserA.user?.username || formatAddress(compareUserA.address),
      userB: compareUserB.user?.username || formatAddress(compareUserB.address),
      winsA: winsA.toString(),
      winsB: winsB.toString(),
      streakA: compareStatsA.currentStreak.toString(),
      streakB: compareStatsB.currentStreak.toString(),
      txA: compareStatsA.totalTransactions.toString(),
      txB: compareStatsB.totalTransactions.toString(),
    });
    return `/api/og?${params.toString()}`;
  }, [compareUserA, compareUserB, compareStatsA, compareStatsB]);

  // Copy URL to clipboard
  const handleShareUrl = async () => {
    const ogPath = buildOgUrl();
    if (!ogPath) return;

    const ogUrl = `${window.location.origin}${ogPath}`;
    try {
      await navigator.clipboard.writeText(ogUrl);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Copy image directly to clipboard
  const handleShareImage = async () => {
    const ogPath = buildOgUrl();
    if (!ogPath) return;

    try {
      const response = await fetch(ogPath);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setShareState("image-copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
      handleShareUrl();
    }
  };

  // Get display name for header
  const getDisplayName = () => {
    if (lookupMode === "lookup" && lookupUser) {
      return `@${lookupUser.username}`;
    }
    if (lookupMode === "lookup" && lookupAddress) {
      return `${lookupAddress.slice(0, 6)}...${lookupAddress.slice(-4)}`;
    }
    if (isConnected && connectedAddress) {
      return `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen py-12">
      {/* Profile setup modal — auto-triggered on first connect */}
      <ProfileSetupModal
        open={profileModal.open}
        onClose={() => profileModal.setOpen(false)}
        profileId={profileModal.profileId}
        onProfileCreated={profileModal.onProfileCreated}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#dfdadb' }}>
                Transaction Heatmap
              </h1>
              <p className="mt-2" style={{ color: '#878283' }}>
                {hasActiveAddress ? (
                  <>
                    Activity for <span style={{ color: '#eb4511' }}>{getDisplayName()}</span> on{" "}
                    <span style={{ color: '#eb4511' }}>{ACTIVE_CHAIN === 'base' ? 'Base' : 'MegaETH'}</span>
                  </>
                ) : (
                  "Connect wallet or lookup any address"
                )}
              </p>
            </div>
            {isUsingDemoData && (
              <span
                className="px-3 py-1 rounded-sm text-xs font-medium"
                style={{ backgroundColor: 'rgba(235, 69, 17, 0.1)', color: '#eb4511' }}
              >
                Demo Data
              </span>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-sm w-fit" style={{ backgroundColor: '#111011' }}>
            <button
              onClick={() => setLookupMode("connect")}
              className={cn(
                "px-4 py-2 rounded-sm text-sm font-medium transition-all",
              )}
              style={{
                backgroundColor: lookupMode === "connect" ? '#1a1617' : 'transparent',
                color: lookupMode === "connect" ? '#dfdadb' : '#878283',
              }}
            >
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M12 12h.01" />
                </svg>
                Connect Wallet
              </span>
            </button>
            <button
              onClick={() => setLookupMode("lookup")}
              className={cn(
                "px-4 py-2 rounded-sm text-sm font-medium transition-all",
              )}
              style={{
                backgroundColor: lookupMode === "lookup" ? '#1a1617' : 'transparent',
                color: lookupMode === "lookup" ? '#dfdadb' : '#878283',
              }}
            >
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                Lookup Address
              </span>
            </button>
          </div>

          {/* Connect/Lookup Input */}
          <AnimatePresence mode="wait">
            {lookupMode === "connect" ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                {!isConnected && (
                  <div className="p-4 rounded-sm flex items-center justify-between" style={{ backgroundColor: '#111011' }}>
                    <p className="text-sm" style={{ color: '#878283' }}>
                      Connect your wallet to view your on-chain activity
                    </p>
                    <ConnectButton />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="lookup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4"
              >
                <AddressSearch
                  onAddressResolved={handleAddressResolved}
                  placeholder="Paste address, @username, or FID"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            label="Current Streak"
            value={`${displayStats.currentStreak}`}
            suffix="days"
            highlight={displayStats.currentStreak > 0}
            loading={isLoading}
          />
          <StatCard
            label="Longest Streak"
            value={`${displayStats.longestStreak}`}
            suffix="days"
            loading={isLoading}
          />
          <StatCard
            label="Total Transactions"
            value={displayStats.totalTransactions.toLocaleString()}
            loading={isLoading}
          />
          <StatCard
            label="Active Days"
            value={`${displayStats.activeDays}`}
            suffix="/ 365"
            loading={isLoading}
          />
        </motion.div>

        {/* Main Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#dfdadb' }}>
                Activity · Last 365 Days
              </h2>
              <p className="text-sm" style={{ color: '#878283' }}>
                {displayStats.totalTransactions.toLocaleString()} contributions
              </p>
            </div>

            {/* Color scheme picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-dim)' }}>palette</span>
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(174,164,191,0.06)', border: '1px solid rgba(174,164,191,0.12)' }}>
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    onClick={() => setColorScheme(scheme.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    )}
                    style={{
                      backgroundColor: colorScheme === scheme.id ? `${scheme.color}18` : 'transparent',
                      color: colorScheme === scheme.id ? scheme.color : 'var(--color-dim)',
                      border: colorScheme === scheme.id ? `1px solid ${scheme.color}40` : '1px solid transparent',
                    }}
                    title={scheme.name}
                  >
                    {scheme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
            {isLoading ? (
              <div className="h-32 flex items-center justify-center" style={{ color: '#878283' }}>
                Loading transaction history...
              </div>
            ) : (
              <Heatmap data={displayData} colorScheme={colorScheme} />
            )}
          </div>
        </motion.div>

        {/* Frequent Projects — for connected wallet */}
        {isConnected && connectedAddress && (
          <FrequentProjects address={connectedAddress} />
        )}

        {/* User Profile & Points Section */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <UserProfile onOpenProfileModal={() => profileModal.setOpen(true)} />
          </motion.div>
        )}

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: '#dfdadb' }}>
              Compare Heatmaps
            </h2>
            <span
              className="px-2 py-1 rounded-sm text-xs"
              style={{ backgroundColor: 'rgba(235, 69, 17, 0.1)', color: '#eb4511' }}
            >
              Live lookup
            </span>
          </div>

          {/* Comparison search inputs */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#878283' }}>User A</p>
              <AddressSearch
                onAddressResolved={handleCompareA}
                placeholder="Address, @username, or FID"
              />
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#878283' }}>User B</p>
              <AddressSearch
                onAddressResolved={handleCompareB}
                placeholder="Address, @username, or FID"
              />
            </div>
          </div>

          {/* Head to head header - only show when both users are set */}
          {(compareUserA || compareUserB) && (
            <>
              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center">
                  {compareUserA ? (
                    <>
                      {compareUserA.user?.pfpUrl ? (
                        <img
                          src={compareUserA.user.pfpUrl}
                          alt={compareUserA.user.username}
                          className="w-12 h-12 rounded-full object-cover mb-2 mx-auto"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 mx-auto"
                          style={{ background: 'linear-gradient(135deg, #eb4511 0%, #ff9000 100%)', color: '#0a0909' }}
                        >
                          {(compareUserA.user?.username || compareUserA.address.slice(2, 4)).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium" style={{ color: '#dfdadb' }}>
                        {compareUserA.user ? `@${compareUserA.user.username}` : `${compareUserA.address.slice(0, 6)}...`}
                      </p>
                      <p className="text-xs font-mono" style={{ color: '#878283' }}>
                        {compareUserA.address.slice(0, 6)}...{compareUserA.address.slice(-4)}
                      </p>
                    </>
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto" style={{ backgroundColor: '#1a1617' }}>
                      <span style={{ color: '#454041' }}>?</span>
                    </div>
                  )}
                </div>

                <div className="text-3xl font-bold" style={{ color: '#454041' }}>vs</div>

                <div className="text-center">
                  {compareUserB ? (
                    <>
                      {compareUserB.user?.pfpUrl ? (
                        <img
                          src={compareUserB.user.pfpUrl}
                          alt={compareUserB.user.username}
                          className="w-12 h-12 rounded-full object-cover mb-2 mx-auto"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 mx-auto"
                          style={{ background: 'linear-gradient(135deg, #b02e0c 0%, #8c250a 100%)', color: '#dfdadb' }}
                        >
                          {(compareUserB.user?.username || compareUserB.address.slice(2, 4)).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium" style={{ color: '#dfdadb' }}>
                        {compareUserB.user ? `@${compareUserB.user.username}` : `${compareUserB.address.slice(0, 6)}...`}
                      </p>
                      <p className="text-xs font-mono" style={{ color: '#878283' }}>
                        {compareUserB.address.slice(0, 6)}...{compareUserB.address.slice(-4)}
                      </p>
                    </>
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto" style={{ backgroundColor: '#1a1617' }}>
                      <span style={{ color: '#454041' }}>?</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Side by side heatmaps */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 rounded-sm" style={{ backgroundColor: '#0a0909' }}>
                  <p className="text-sm font-medium mb-3" style={{ color: '#878283' }}>
                    {compareUserA?.user ? `@${compareUserA.user.username}` : compareUserA?.address.slice(0, 10) || 'User A'}
                  </p>
                  <div className="overflow-x-auto scrollbar-hide">
                    {isLoadingA ? (
                      <div className="h-24 flex items-center justify-center" style={{ color: '#454041' }}>
                        Loading...
                      </div>
                    ) : compareDataA.size > 0 ? (
                      <Heatmap data={compareDataA} colorScheme={colorScheme} showLabels={false} />
                    ) : (
                      <div className="h-24 flex items-center justify-center" style={{ color: '#454041' }}>
                        No data
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-sm" style={{ backgroundColor: '#0a0909' }}>
                  <p className="text-sm font-medium mb-3" style={{ color: '#878283' }}>
                    {compareUserB?.user ? `@${compareUserB.user.username}` : compareUserB?.address.slice(0, 10) || 'User B'}
                  </p>
                  <div className="overflow-x-auto scrollbar-hide">
                    {isLoadingB ? (
                      <div className="h-24 flex items-center justify-center" style={{ color: '#454041' }}>
                        Loading...
                      </div>
                    ) : compareDataB.size > 0 ? (
                      <Heatmap data={compareDataB} colorScheme={colorScheme} showLabels={false} />
                    ) : (
                      <div className="h-24 flex items-center justify-center" style={{ color: '#454041' }}>
                        No data
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison bars - only when both have data */}
              {compareDataA.size > 0 && compareDataB.size > 0 && (
                <div className="space-y-6">
                  <ComparisonMetric
                    label="Total Transactions"
                    valueA={compareStatsA.totalTransactions}
                    valueB={compareStatsB.totalTransactions}
                  />
                  <ComparisonMetric
                    label="Current Streak"
                    valueA={compareStatsA.currentStreak}
                    valueB={compareStatsB.currentStreak}
                    suffix="days"
                  />
                  <ComparisonMetric
                    label="Active Days"
                    valueA={compareStatsA.activeDays}
                    valueB={compareStatsB.activeDays}
                  />

                  {/* Share buttons */}
                  <div className="flex justify-center gap-3 pt-6 border-t" style={{ borderColor: '#292526' }}>
                    <button
                      onClick={handleShareImage}
                      className="btn-primary flex items-center gap-2"
                    >
                      {shareState === "image-copied" ? (
                        <>
                          <Check className="w-4 h-4" />
                          Image Copied!
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          Copy as Image
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleShareUrl}
                      className="btn-secondary flex items-center gap-2"
                    >
                      {shareState === "copied" ? (
                        <>
                          <Check className="w-4 h-4" />
                          Link Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!compareUserA && !compareUserB && (
            <div className="text-center py-12" style={{ color: '#454041' }}>
              <p className="text-sm">Enter addresses above to compare heatmaps</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  highlight,
  loading,
}: {
  label: string;
  value: string;
  suffix?: string;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className="stat-card"
      style={{
        borderColor: highlight ? 'rgba(235, 69, 17, 0.3)' : undefined,
        backgroundColor: highlight ? 'rgba(235, 69, 17, 0.05)' : undefined,
      }}
    >
      <p className="stat-label">{label}</p>
      {loading ? (
        <div className="h-10 flex items-center">
          <div className="w-16 h-6 rounded-sm animate-pulse" style={{ backgroundColor: '#1a1617' }} />
        </div>
      ) : (
        <p className="stat-value">
          {value}
          {suffix && <span className="text-lg ml-1" style={{ color: '#878283' }}>{suffix}</span>}
        </p>
      )}
    </div>
  );
}

function ComparisonMetric({
  label,
  valueA,
  valueB,
  suffix,
}: {
  label: string;
  valueA: number;
  valueB: number;
  suffix?: string;
}) {
  const total = valueA + valueB || 1;
  const percentA = (valueA / total) * 100;
  const percentB = (valueB / total) * 100;
  const winner = valueA > valueB ? "a" : valueB > valueA ? "b" : "tie";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm" style={{ color: '#878283' }}>{label}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-24 text-right">
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: winner === "a" ? '#eb4511' : '#878283' }}
          >
            {valueA.toLocaleString()}{suffix && ` ${suffix}`}
          </span>
        </div>

        <div className="flex-1 flex h-6 rounded-sm overflow-hidden" style={{ backgroundColor: '#1a1617' }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: winner === "a" ? '#eb4511' : '#454041' }}
            initial={{ width: 0 }}
            animate={{ width: `${percentA}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="h-full"
            style={{ backgroundColor: winner === "b" ? '#b02e0c' : '#454041' }}
            initial={{ width: 0 }}
            animate={{ width: `${percentB}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <div className="w-24">
          <span
            className="text-sm font-semibold tabular-nums"
            style={{ color: winner === "b" ? '#b02e0c' : '#878283' }}
          >
            {valueB.toLocaleString()}{suffix && ` ${suffix}`}
          </span>
        </div>
      </div>
    </div>
  );
}
