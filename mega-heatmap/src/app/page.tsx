"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Grid3X3, Zap, TrendingUp, Users } from "lucide-react";

const features = [
  {
    name: "Transaction Heatmap",
    description:
      "GitHub-style contribution graph for your MegaETH activity. Track streaks, compete on leaderboards, and prove your on-chain presence.",
    href: "/heatmap",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    stats: "Track 365 days",
  },
  {
    name: "Ecosystem Catalogue",
    description:
      "Discover 37+ projects building on MegaETH. From DeFi to gaming, explore the fastest-growing L2 ecosystem.",
    href: "/catalogue",
    icon: Grid3X3,
    color: "from-mega-green to-emerald-600",
    stats: "37+ Projects",
  },
];

const stats = [
  { label: "Sub-ms Latency", value: "<1ms", icon: Zap },
  { label: "TPS Capacity", value: "100K+", icon: TrendingUp },
  { label: "Ecosystem Projects", value: "37+", icon: Users },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-mega-green/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mega-green/10 border border-mega-green/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mega-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mega-green" />
              </span>
              <span className="text-sm font-medium text-mega-green">
                Built for MegaETH Launch
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-mega-gray-900 tracking-tight">
              Tools for the
              <br />
              <span className="text-gradient-mega">MegaETH</span> Ecosystem
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-mega-gray-600 max-w-2xl mx-auto">
              Track your on-chain activity, discover ecosystem projects, and
              experience real-time blockchain like never before.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/heatmap" className="btn-primary text-base px-6 py-3">
                View Your Heatmap
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/catalogue" className="btn-secondary text-base px-6 py-3">
                Explore Catalogue
              </Link>
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
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-mega-green/10 text-mega-green mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-mega-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-mega-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-mega-gray-900">
              Day One Tools
            </h2>
            <p className="mt-4 text-lg text-mega-gray-600">
              Launching with MegaETH to showcase real-time performance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={feature.href} className="block group">
                  <div className="glass-card p-8 h-full hover:shadow-mega transition-all duration-300">
                    {/* Icon */}
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6`}
                    >
                      <feature.icon className="w-7 h-7" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-mega-gray-900 mb-3">
                      {feature.name}
                    </h3>
                    <p className="text-mega-gray-600 mb-6">{feature.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-mega-gray-400">
                        {feature.stats}
                      </span>
                      <span className="flex items-center text-mega-green font-medium group-hover:translate-x-1 transition-transform">
                        Explore
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-mega-gray-900 px-8 py-16 sm:px-16 sm:py-24"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-mega-green/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-mega-green/10 rounded-full blur-3xl" />

            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to explore MegaETH?
              </h2>
              <p className="text-lg text-mega-gray-400 max-w-xl mx-auto mb-8">
                Connect your wallet to see your transaction heatmap and start
                tracking your on-chain activity.
              </p>
              <Link
                href="/heatmap"
                className="inline-flex items-center px-8 py-4 rounded-xl bg-mega-green text-white font-semibold hover:bg-mega-green-600 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
