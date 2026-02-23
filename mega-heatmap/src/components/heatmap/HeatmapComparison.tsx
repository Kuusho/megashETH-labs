"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heatmap } from "./Heatmap";
import { cn, formatAddress, calculateStreak } from "@/lib/utils";
import { Trophy, Flame, TrendingUp, Calendar, Swords, Share2, Check, Copy, Image as ImageIcon } from "lucide-react";

interface User {
  address: string;
  username?: string;
  avatar?: string;
  data: Map<string, number>;
}

interface HeatmapComparisonProps {
  userA: User;
  userB: User;
  colorScheme?: "fire" | "rainbow" | "carrot" | "ocean" | "forest";
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
  colorScheme = "rainbow",
}: HeatmapComparisonProps) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "image-copied">("idle");

  // Calculate stats for both users
  const statsA = calculateUserStats(userA.data);
  const statsB = calculateUserStats(userB.data);

  // Build comparison metrics
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

  // Count wins
  const winsA = metrics.filter((m) => m.winner === "a").length;
  const winsB = metrics.filter((m) => m.winner === "b").length;

  // Build OG image URL
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

  // Copy URL to clipboard
  const handleShareUrl = async () => {
    const ogUrl = `${window.location.origin}${buildOgUrl()}`;
    try {
      await navigator.clipboard.writeText(ogUrl);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Copy image directly to clipboard (for easy pasting into Twitter/Warpcast)
  const handleShareImage = async () => {
    try {
      const ogUrl = buildOgUrl();
      const response = await fetch(ogUrl);
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
      // Fallback to URL copy
      handleShareUrl();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header - Who's winning overall */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <Swords className="w-6 h-6 text-mega-gray-400" />
          <h2 className="text-2xl font-bold text-mega-gray-900">Head to Head</h2>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <UserAvatar user={userA} size="lg" />
            <p className="mt-2 font-semibold text-mega-gray-900">
              {userA.username || formatAddress(userA.address)}
            </p>
            <p className="text-3xl font-bold text-mega-green mt-1">{winsA}</p>
            <p className="text-xs text-mega-gray-500">wins</p>
          </div>

          <div className="text-4xl font-bold text-mega-gray-300">vs</div>

          <div className="text-center">
            <UserAvatar user={userB} size="lg" />
            <p className="mt-2 font-semibold text-mega-gray-900">
              {userB.username || formatAddress(userB.address)}
            </p>
            <p className="text-3xl font-bold text-mega-green mt-1">{winsB}</p>
            <p className="text-xs text-mega-gray-500">wins</p>
          </div>
        </div>
      </motion.div>

      {/* Side-by-side heatmaps */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar user={userA} size="sm" />
            <div>
              <p className="font-semibold text-mega-gray-900">
                {userA.username || formatAddress(userA.address)}
              </p>
              <p className="text-xs text-mega-gray-500">
                {statsA.totalTxs.toLocaleString()} transactions
              </p>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <Heatmap data={userA.data} colorScheme={colorScheme} showLabels={false} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar user={userB} size="sm" />
            <div>
              <p className="font-semibold text-mega-gray-900">
                {userB.username || formatAddress(userB.address)}
              </p>
              <p className="text-xs text-mega-gray-500">
                {statsB.totalTxs.toLocaleString()} transactions
              </p>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <Heatmap data={userB.data} colorScheme={colorScheme} showLabels={false} />
          </div>
        </motion.div>
      </div>

      {/* Detailed metrics comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-mega-gray-900 mb-6">
          Stats Breakdown
        </h3>

        <div className="space-y-6">
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

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex justify-center gap-3">
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
        <button className="btn-ghost flex items-center gap-2">
          <Swords className="w-4 h-4" />
          Challenge {userB.username || formatAddress(userB.address, 3)}
        </button>
      </motion.div>
    </div>
  );
}

function UserAvatar({
  user,
  size = "md",
}: {
  user: User;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username || "User"}
        className={cn("rounded-full object-cover", sizeClasses[size])}
      />
    );
  }

  // Generate avatar from address
  const colors = [
    "from-mega-green to-emerald-500",
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-yellow-500",
  ];
  const colorIndex = parseInt(user.address.slice(-1), 16) % colors.length;

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white",
        colors[colorIndex],
        sizeClasses[size]
      )}
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
  const format = metric.format || ((v: number | string) => v.toLocaleString());

  const numA = typeof metric.valueA === "number" ? metric.valueA : 0;
  const numB = typeof metric.valueB === "number" ? metric.valueB : 0;
  const total = numA + numB || 1;

  const percentA = (numA / total) * 100;
  const percentB = (numB / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-mega-gray-400" />
          <span className="text-sm font-medium text-mega-gray-700">
            {metric.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* User A value */}
        <div className="w-24 text-right">
          <span
            className={cn(
              "text-sm font-semibold",
              metric.winner === "a" ? "text-mega-green" : "text-mega-gray-600"
            )}
          >
            {format(metric.valueA)}
          </span>
          {metric.winner === "a" && (
            <Trophy className="inline-block ml-1 w-3 h-3 text-mega-green" />
          )}
        </div>

        {/* Bar visualization */}
        <div className="flex-1 flex h-6 bg-mega-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full",
              metric.winner === "a" ? "bg-mega-green" : "bg-mega-gray-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentA}%` }}
            transition={{ delay: delay + 0.1, duration: 0.5, ease: "easeOut" }}
          />
          <motion.div
            className={cn(
              "h-full",
              metric.winner === "b" ? "bg-mega-green" : "bg-mega-gray-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentB}%` }}
            transition={{ delay: delay + 0.1, duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* User B value */}
        <div className="w-24">
          <span
            className={cn(
              "text-sm font-semibold",
              metric.winner === "b" ? "text-mega-green" : "text-mega-gray-600"
            )}
          >
            {format(metric.valueB)}
          </span>
          {metric.winner === "b" && (
            <Trophy className="inline-block ml-1 w-3 h-3 text-mega-green" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function calculateUserStats(data: Map<string, number>) {
  const { current, longest } = calculateStreak(data);
  const totalTxs = Array.from(data.values()).reduce((sum, count) => sum + count, 0);
  const activeDays = data.size;

  return {
    currentStreak: current,
    longestStreak: longest,
    totalTxs,
    activeDays,
  };
}

function getWinner(a: number, b: number): "a" | "b" | "tie" {
  if (a > b) return "a";
  if (b > a) return "b";
  return "tie";
}
