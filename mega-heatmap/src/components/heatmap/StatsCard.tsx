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
  trend?: { value: number; isPositive: boolean };
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn("stat-card")}
      style={
        highlight
          ? {
            border: '1px solid rgba(132, 226, 150, 0.25)',
            backgroundColor: 'rgba(132, 226, 150, 0.04)',
          }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1">{value}</p>
          {subtext && (
            <p className="text-xs mt-1" style={{ color: '#8f6593' }}>{subtext}</p>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl"
          style={{
            backgroundColor: highlight
              ? 'rgba(132, 226, 150, 0.12)'
              : 'rgba(174, 164, 191, 0.1)',
            color: highlight ? '#84e296' : '#8f6593',
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span
            className="text-xs font-medium"
            style={{ color: trend.isPositive ? '#84e296' : 'var(--color-error)' }}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs" style={{ color: '#8f6593' }}>vs last week</span>
        </div>
      )}
    </motion.div>
  );
}

export function StreakCard({ current, longest, delay = 0 }: { current: number; longest: number; delay?: number }) {
  return (
    <StatsCard
      label="Current Streak"
      value={`${current} days`}
      subtext={current === longest && current > 0 ? 'Personal best!' : `Longest: ${longest} days`}
      icon={Flame}
      highlight={current > 0}
      delay={delay}
    />
  );
}

export function TotalTxCard({ count, delay = 0 }: { count: number; delay?: number }) {
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

export function ActiveDaysCard({ days, total, delay = 0 }: { days: number; total: number; delay?: number }) {
  return (
    <StatsCard
      label="Active Days"
      value={`${days}/${total}`}
      subtext={`${total > 0 ? Math.round((days / total) * 100) : 0}% consistency`}
      icon={Calendar}
      delay={delay}
    />
  );
}

export function RankCard({ rank, total, delay = 0 }: { rank: number; total: number; delay?: number }) {
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
