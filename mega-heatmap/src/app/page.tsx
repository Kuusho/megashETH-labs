"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Sparkles,
  Flame,
  LayoutDashboard,
  Trophy,
  Rocket,
} from "lucide-react";

const features = [
  {
    name: "Transaction Heatmap",
    description:
      "GitHub-style activity graph for your MegaETH onchain presence. Track streaks, compete, and visualize your contributions over time.",
    href: "/heatmap",
    icon: Flame,
    stats: "365 days tracked",
  },
  {
    name: "Points Dashboard",
    description:
      "MegaETH native score system. Earn points for transactions, streaks, and ecosystem participation with real-time leaderboards and multipliers.",
    href: "/dashboard",
    icon: LayoutDashboard,
    stats: "Live scoring",
  },
  {
    name: "Top Contributors",
    description:
      "Global leaderboard of MegaETH power users. Current streak leaders, highest transaction counts, most active wallets.",
    href: "/leaderboard",
    icon: Trophy,
    stats: "Live rankings",
  },
  {
    name: "Deployment Tracker",
    description:
      "Every contract deployment on MegaETH, catalogued and analyzed. From DeFi protocols to experiments — intel for builders.",
    href: "/deployments",
    icon: Rocket,
    stats: "36+ tracked",
  },
];

const stats = [
  { label: "Sub-ms Latency", value: "<1ms", icon: Zap },
  { label: "TPS Capacity", value: "100K+", icon: TrendingUp },
  { label: "Active Wallets", value: "Live", icon: Users },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-24 pb-28 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Live badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 text-xs font-mono"
              style={{
                backgroundColor: "rgba(132, 226, 150, 0.06)",
                borderColor: "rgba(132, 226, 150, 0.22)",
                color: "#84e296",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#84e296] opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#84e296]" />
              </span>
              megaeth mainnet live
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span style={{ color: "#f5f8de" }}>Onchain intel for</span>
              <br />
              <span style={{ color: "#84e296" }}>the real-time chain</span>
            </h1>

            {/* Subheading */}
            <p
              className="text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ color: "#aea4bf" }}
            >
              Track your activity, discover alpha, and compete on the
              leaderboard.{" "}
              <span style={{ color: "#f5f8de" }} className="font-semibold">
                Powered by Bunny Intel.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/heatmap"
                  className="btn-primary px-7 py-2.5 flex items-center gap-2"
                >
                  View your heatmap
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/dashboard"
                  className="btn-secondary px-7 py-2.5 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore dashboard
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-3xl font-bold font-mono mb-1 tabular-nums"
                  style={{ color: "#f5f8de" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "#8f6593" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section
        className="relative py-20 border-t"
        style={{ borderColor: "rgba(174, 164, 191, 0.1)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: "#f5f8de" }}
            >
              Tools for builders & degens
            </h2>
            <p className="text-base" style={{ color: "#8f6593" }}>
              Day one infrastructure for the MegaETH ecosystem
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                >
                  <Link href={feature.href} className="block group h-full">
                    <motion.div
                      className="card p-6 h-full flex flex-col"
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    >
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 flex-shrink-0"
                        style={{
                          backgroundColor: "rgba(132, 226, 150, 0.1)",
                          border: "1px solid rgba(132, 226, 150, 0.18)",
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "#84e296" }} />
                      </div>

                      <h3
                        className="text-lg font-bold mb-2"
                        style={{ color: "#f5f8de" }}
                      >
                        {feature.name}
                      </h3>
                      <p
                        className="text-sm leading-relaxed mb-4 flex-1"
                        style={{ color: "#aea4bf" }}
                      >
                        {feature.description}
                      </p>

                      {/* Card footer */}
                      <div
                        className="flex items-center justify-between pt-4 border-t mt-auto"
                        style={{ borderColor: "rgba(174, 164, 191, 0.1)" }}
                      >
                        <span
                          className="text-xs font-mono font-medium"
                          style={{ color: "#84e296" }}
                        >
                          {feature.stats}
                        </span>
                        <motion.span
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: "#8f6593" }}
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          Explore
                          <ArrowRight className="w-3 h-3" />
                        </motion.span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl px-10 py-16 sm:px-16 sm:py-20 text-center"
            style={{
              backgroundColor: "rgba(132, 226, 150, 0.04)",
              border: "1px solid rgba(132, 226, 150, 0.14)",
            }}
          >
            <div className="absolute inset-0 bg-grid opacity-60" />
            <div className="relative">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "#f5f8de" }}
              >
                Ready to start tracking?
              </h2>
              <p
                className="text-base max-w-lg mx-auto mb-8"
                style={{ color: "#aea4bf" }}
              >
                Connect your wallet and start tracking your MegaETH activity.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/heatmap"
                  className="btn-primary px-8 py-3 inline-flex items-center gap-2"
                >
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer note */}
      <div className="pb-10 text-center">
        <p className="text-xs font-mono" style={{ color: "#8f6593" }}>
          built by pan · bunny intel · megaeth
        </p>
      </div>
    </div>
  );
}
