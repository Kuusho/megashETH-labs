"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, TrendingUp, Calendar, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  highlight?: boolean;
  delay?: number;
}

export function StatsCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  highlight = false,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "stat-card",
        highlight && "ring-2 ring-mega-green/20 bg-gradient-to-br from-white to-mega-green/5"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-mega-gray-400 mt-1">{subtext}</p>
          )}
        </div>
        <div
          className={cn(
            "p-2.5 rounded-xl",
            highlight ? "bg-mega-green/10 text-mega-green" : "bg-mega-gray-100 text-mega-gray-500"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-mega-green" : "text-red-500"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-mega-gray-400">vs last week</span>
        </div>
      )}
    </motion.div>
  );
}

// Pre-configured stat card variants
export function StreakCard({
  current,
  longest,
  delay = 0,
}: {
  current: number;
  longest: number;
  delay?: number;
}) {
  const isActive = current > 0;
  const isRecord = current === longest && current > 0;

  return (
    <StatsCard
      label="Current Streak"
      value={`${current} days`}
      subtext={isRecord ? "Personal best!" : `Longest: ${longest} days`}
      icon={Flame}
      highlight={isActive}
      delay={delay}
    />
  );
}

export function TotalTxCard({
  count,
  delay = 0,
}: {
  count: number;
  delay?: number;
}) {
  return (
    <StatsCard
      label="Total Transactions"
      value={count.toLocaleString()}
      subtext="All time"
      icon={TrendingUp}
      delay={delay}
    />
  );
}

export function ActiveDaysCard({
  days,
  total,
  delay = 0,
}: {
  days: number;
  total: number;
  delay?: number;
}) {
  const percentage = total > 0 ? Math.round((days / total) * 100) : 0;

  return (
    <StatsCard
      label="Active Days"
      value={`${days}/${total}`}
      subtext={`${percentage}% consistency`}
      icon={Calendar}
      delay={delay}
    />
  );
}

export function RankCard({
  rank,
  total,
  delay = 0,
}: {
  rank: number;
  total: number;
  delay?: number;
}) {
  const percentile = total > 0 ? Math.round(((total - rank) / total) * 100) : 0;

  return (
    <StatsCard
      label="Global Rank"
      value={`#${rank.toLocaleString()}`}
      subtext={`Top ${100 - percentile}%`}
      icon={Award}
      highlight={rank <= 100}
      delay={delay}
    />
  );
}
