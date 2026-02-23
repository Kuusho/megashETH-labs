"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heatmap } from "./Heatmap";
import { cn, formatAddress, calculateStreak } from "@/lib/utils";
import {
  Trophy,
  Flame,
  TrendingUp,
  Calendar,
  Swords,
  Share2,
  Check,
  Copy,
  Image as ImageIcon,
} from "lucide-react";

interface User {
  address: string;
  username?: string;
  avatar?: string;
  data: Map<string, number>;
}

interface HeatmapComparisonProps {
  userA: User;
  userB: User;
  colorScheme?: "violet" | "fire" | "ocean" | "forest";
}

interface ComparisonMetric {
  label: string;
  valueA: number | string;
  valueB: number | string;
  winner: "a" | "b" | "tie";
  icon: typeof Trophy;
  format?: (value: number | string) => string;
}

export function HeatmapComparison({
  userA,
  userB,
  colorScheme = "violet",
}: HeatmapComparisonProps) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "image-copied">("idle");

  const statsA = calculateUserStats(userA.data);
  const statsB = calculateUserStats(userB.data);

  const metrics: ComparisonMetric[] = [
    {
      label: "Total Transactions",
      valueA: statsA.totalTxs,
      valueB: statsB.totalTxs,
      winner: getWinner(statsA.totalTxs, statsB.totalTxs),
      icon: TrendingUp,
    },
    {
      label: "Current Streak",
      valueA: statsA.currentStreak,
      valueB: statsB.currentStreak,
      winner: getWinner(statsA.currentStreak, statsB.currentStreak),
      icon: Flame,
      format: (v) => `${v} days`,
    },
    {
      label: "Longest Streak",
      valueA: statsA.longestStreak,
      valueB: statsB.longestStreak,
      winner: getWinner(statsA.longestStreak, statsB.longestStreak),
      icon: Trophy,
      format: (v) => `${v} days`,
    },
    {
      label: "Active Days",
      valueA: statsA.activeDays,
      valueB: statsB.activeDays,
      winner: getWinner(statsA.activeDays, statsB.activeDays),
      icon: Calendar,
    },
  ];

  const winsA = metrics.filter((m) => m.winner === "a").length;
  const winsB = metrics.filter((m) => m.winner === "b").length;

  const buildOgUrl = () => {
    const params = new URLSearchParams({
      userA: userA.username || formatAddress(userA.address),
      userB: userB.username || formatAddress(userB.address),
      winsA: winsA.toString(),
      winsB: winsB.toString(),
      streakA: statsA.currentStreak.toString(),
      streakB: statsB.currentStreak.toString(),
      txA: statsA.totalTxs.toString(),
      txB: statsB.totalTxs.toString(),
    });
    return `/api/og?${params.toString()}`;
  };

  const handleShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${buildOgUrl()}`);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleShareImage = async () => {
    try {
      const response = await fetch(buildOgUrl());
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setShareState("image-copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (_err) {
      handleShareUrl();
    }
  };

  return (
    <div className="space-y-6">
      {/* Head to head score */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Swords className="w-4 h-4" style={{ color: '#8f6593' }} />
          <h2 className="text-xl font-bold" style={{ color: '#f5f8de' }}>
            Head to Head
          </h2>
        </div>

        <div className="flex items-center justify-center gap-10">
          <div className="text-center">
            <UserAvatar user={userA} size="lg" />
            <p className="mt-2 text-sm font-medium" style={{ color: '#f5f8de' }}>
              {userA.username || formatAddress(userA.address)}
            </p>
            <p className="text-3xl font-bold font-mono mt-1" style={{ color: '#84e296' }}>
              {winsA}
            </p>
            <p className="text-xs" style={{ color: '#8f6593' }}>wins</p>
          </div>

          <div className="text-2xl font-bold" style={{ color: '#8f6593' }}>vs</div>

          <div className="text-center">
            <UserAvatar user={userB} size="lg" />
            <p className="mt-2 text-sm font-medium" style={{ color: '#f5f8de' }}>
              {userB.username || formatAddress(userB.address)}
            </p>
            <p className="text-3xl font-bold font-mono mt-1" style={{ color: '#84e296' }}>
              {winsB}
            </p>
            <p className="text-xs" style={{ color: '#8f6593' }}>wins</p>
          </div>
        </div>
      </motion.div>

      {/* Side-by-side heatmaps */}
      <div className="grid md:grid-cols-2 gap-4">
        {[{ user: userA, stats: statsA }, { user: userB, stats: statsB }].map(
          ({ user, stats }, i) => (
            <motion.div
              key={user.address}
              initial={{ opacity: 0, x: i === 0 ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar user={user} size="sm" />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f5f8de' }}>
                    {user.username || formatAddress(user.address)}
                  </p>
                  <p className="text-xs font-mono" style={{ color: '#8f6593' }}>
                    {stats.totalTxs.toLocaleString()} transactions
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <Heatmap data={user.data} colorScheme={colorScheme} showLabels={false} />
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* Stats breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#8f6593' }}>
          Stats Breakdown
        </h3>
        <div className="space-y-5">
          {metrics.map((metric, index) => (
            <ComparisonBar
              key={metric.label}
              metric={metric}
              userA={userA}
              userB={userB}
              delay={0.3 + index * 0.05}
            />
          ))}
        </div>
      </motion.div>

      {/* Share buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <button onClick={handleShareImage} className="btn-primary">
          {shareState === "image-copied" ? (
            <><Check className="w-3.5 h-3.5" /> Image Copied!</>
          ) : (
            <><ImageIcon className="w-3.5 h-3.5" /> Copy as Image</>
          )}
        </button>
        <button onClick={handleShareUrl} className="btn-secondary">
          {shareState === "copied" ? (
            <><Check className="w-3.5 h-3.5" /> Link Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy Link</>
          )}
        </button>
        <button className="btn-ghost">
          <Swords className="w-3.5 h-3.5" />
          Challenge {userB.username || formatAddress(userB.address, 3)}
        </button>
      </motion.div>
    </div>
  );
}

function UserAvatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username ?? "User"}
        className={cn("rounded-full object-cover", sizeClasses[size])}
      />
    );
  }

  const colorPairs = [
    { bg: 'rgba(132, 226, 150, 0.2)', text: '#84e296' },
    { bg: 'rgba(174, 164, 191, 0.2)', text: '#aea4bf' },
    { bg: 'rgba(143, 101, 147, 0.2)', text: '#8f6593' },
    { bg: 'rgba(232, 195, 122, 0.2)', text: '#e8c37a' },
  ];
  const pair = colorPairs[parseInt(user.address.slice(-1), 16) % colorPairs.length];

  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-bold font-mono", sizeClasses[size])}
      style={{ backgroundColor: pair.bg, color: pair.text }}
    >
      {user.address.slice(2, 4).toUpperCase()}
    </div>
  );
}

function ComparisonBar({
  metric,
  userA,
  userB,
  delay,
}: {
  metric: ComparisonMetric;
  userA: User;
  userB: User;
  delay: number;
}) {
  const Icon = metric.icon;
  const format = metric.format ?? ((v: number | string) => v.toLocaleString());
  const numA = typeof metric.valueA === "number" ? metric.valueA : 0;
  const numB = typeof metric.valueB === "number" ? metric.valueB : 0;
  const total = numA + numB || 1;
  const percentA = (numA / total) * 100;
  const percentB = (numB / total) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color: '#8f6593' }} />
        <span className="text-xs font-medium" style={{ color: '#aea4bf' }}>
          {metric.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* A value */}
        <div className="w-20 text-right">
          <span
            className="text-sm font-semibold font-mono"
            style={{ color: metric.winner === "a" ? '#84e296' : '#8f6593' }}
          >
            {format(metric.valueA)}
          </span>
        </div>

        {/* Bar */}
        <div
          className="flex-1 flex h-5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(174, 164, 191, 0.1)' }}
        >
          <motion.div
            style={{ backgroundColor: metric.winner === "a" ? '#84e296' : '#8f6593' }}
            initial={{ width: 0 }}
            animate={{ width: `${percentA}%` }}
            transition={{ delay: delay + 0.1, duration: 0.5, ease: "easeOut" }}
            className="h-full"
          />
          <motion.div
            style={{ backgroundColor: metric.winner === "b" ? '#84e296' : '#8f6593', opacity: 0.5 }}
            initial={{ width: 0 }}
            animate={{ width: `${percentB}%` }}
            transition={{ delay: delay + 0.1, duration: 0.5, ease: "easeOut" }}
            className="h-full"
          />
        </div>

        {/* B value */}
        <div className="w-20">
          <span
            className="text-sm font-semibold font-mono"
            style={{ color: metric.winner === "b" ? '#84e296' : '#8f6593' }}
          >
            {format(metric.valueB)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function calculateUserStats(data: Map<string, number>) {
  const { current, longest } = calculateStreak(data);
  const totalTxs = Array.from(data.values()).reduce((sum, count) => sum + count, 0);
  return { currentStreak: current, longestStreak: longest, totalTxs, activeDays: data.size };
}

function getWinner(a: number, b: number): "a" | "b" | "tie" {
  if (a > b) return "a";
  if (b > a) return "b";
  return "tie";
}
