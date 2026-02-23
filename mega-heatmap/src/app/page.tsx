"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Users, Sparkles, Rabbit } from "lucide-react";
import { BunnyMascot, GlowCarrot } from "@/components/BunnyMascot";

const features = [
  {
    name: "Transaction Heatmap",
    description:
      "github-style activity graph for your megaeth onchain presence. track streaks, compete, flex your contributions. bunny-approved 🐰",
    href: "/heatmap",
    icon: "🔥",
    gradient: "from-carrot-400 to-bunny-pink-400",
    stats: "365 days tracked",
    funFact: "fire beats, no cap",
  },
  {
    name: "Points Dashboard",
    description:
      "megaeth native score system. earn points for txs, streaks, and ecosystem participation. real-time leaderboards, multipliers, the whole thing.",
    href: "/dashboard",
    icon: "📊",
    gradient: "from-bunny-blue-400 to-bunny-green-400",
    stats: "live scoring",
    funFact: "grind szn",
  },
  {
    name: "Top Contributors",
    description:
      "global leaderboard of megaeth power users. current streak leaders, highest tx counts, most active wallets. who's really locked in?",
    href: "/leaderboard",
    icon: "🏆",
    gradient: "from-bunny-purple-400 to-bunny-yellow-400",
    stats: "live rankings",
    funFact: "real ones only",
  },
  {
    name: "Deployment Tracker",
    description:
      "every contract deployment on megaeth, catalogued and analyzed. from defi protocols to memecoins. intel for builders and degens alike.",
    href: "/deployments",
    icon: "🚀",
    gradient: "from-bunny-pink-400 to-carrot-400",
    stats: "36+ tracked",
    funFact: "alpha central",
  },
];

const stats = [
  { label: "Sub-ms Latency", value: "<1ms", icon: Zap, color: "#ffe66d" },
  { label: "TPS Capacity", value: "100K+", icon: TrendingUp, color: "#4ecdc4" },
  { label: "Ecosystem Growth", value: "📈", icon: Users, color: "#ff85d4" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
          style={{ backgroundColor: '#ff6b35' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: '#ff85d4' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: '#4ecdc4' }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Floating bunny */}
            <motion.div
              className="flex justify-center mb-8"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              <BunnyMascot size="lg" animated interactive />
            </motion.div>

            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 133, 212, 0.1))',
                borderColor: '#ff6b35',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: '#06ffa5' }} />
                <span className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: '#06ffa5' }} />
              </span>
              <span className="text-sm font-bold" style={{ color: '#ff6b35' }}>
                bunny speed gud • megaeth mainnet live
              </span>
              <GlowCarrot />
            </motion.div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span style={{ color: '#dfdadb' }}>onchain intel for the</span>
              <br />
              <span className="text-gradient-rainbow animate-shimmer">
                real-time blockchain
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: '#a8a3a4' }}>
              track your activity, discover alpha, compete on leaderboards.
              <br />
              <span className="text-gradient-bunny font-semibold">powered by bunny intel.</span>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/heatmap" className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                  <span>view your heatmap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>explore dashboard</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}40, ${stat.color}20)`,
                    border: `2px solid ${stat.color}60`,
                  }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                </motion.div>
                <div className="text-3xl font-bold mb-1" style={{ color: '#dfdadb' }}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold" style={{ color: '#878283' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: '#dfdadb' }}>
              tools for <span className="text-gradient-carrot">builders</span> & <span className="text-gradient-bunny">degens</span>
            </h2>
            <p className="text-lg" style={{ color: '#878283' }}>
              day one infrastructure for the megaeth ecosystem
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={feature.href} className="block group h-full">
                  <motion.div
                    className="card p-8 h-full relative overflow-hidden"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Gradient overlay on hover */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(90deg, var(--tw-gradient-stops))`,
                      }}
                    />

                    {/* Icon */}
                    <motion.div
                      className="text-5xl mb-4"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {feature.icon}
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3" style={{ color: '#dfdadb' }}>
                      {feature.name}
                    </h3>
                    <p className="mb-4 leading-relaxed" style={{ color: '#a8a3a4' }}>
                      {feature.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono font-semibold" style={{ color: '#ff6b35' }}>
                          {feature.stats}
                        </span>
                        <span className="text-xs italic" style={{ color: '#666162' }}>
                          "{feature.funFact}"
                        </span>
                      </div>
                      <motion.div
                        className="flex items-center gap-1 font-bold"
                        style={{ color: '#ff85d4' }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        explore
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl px-8 py-16 sm:px-16 sm:py-24"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 133, 212, 0.1) 50%, rgba(78, 205, 196, 0.1) 100%)',
              border: '2px solid',
              borderColor: '#ff6b35',
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: '#ff85d4' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: '#4ecdc4' }} />

            <div className="relative text-center">
              <motion.div
                className="flex justify-center mb-6"
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <span className="text-6xl filter drop-shadow-lg">
                  🐰✨
                </span>
              </motion.div>

              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#dfdadb' }}>
                ready to hop in?
              </h2>
              <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: '#a8a3a4' }}>
                connect your wallet and start tracking your megaeth activity.
                <br />
                <span className="font-bold text-gradient-bunny">bunny speed gud. drug-induced blocktimes.</span>
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/heatmap"
                  className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
                >
                  <Rabbit className="w-5 h-5" />
                  get started
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer note */}
      <div className="relative pb-12 text-center">
        <p className="text-sm font-mono" style={{ color: '#666162' }}>
          built with 🥕 by pan • bunny intel • methalio
        </p>
      </div>
    </div>
  );
}
