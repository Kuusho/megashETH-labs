"use client";

import { motion } from "framer-motion";
import { EcosystemStats, DeploymentList } from "@/components/dashboard";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/heatmap"
            className="inline-flex items-center text-sm mb-4 transition-colors hover:text-[var(--color-text)]"
            style={{ color: "var(--color-dim)" }}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Heatmap
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
                MegaETH Dashboard
              </h1>
              <p className="mt-2 text-sm" style={{ color: "var(--color-dim)" }}>
                Real-time ecosystem metrics powered by Bunny Intel
              </p>
            </div>
            <a
              href="https://megaeth.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              Visit MegaETH
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>

        {/* Ecosystem Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <EcosystemStats />
        </motion.div>

        {/* Deployment List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <DeploymentList />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8 text-center"
        >
          <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Want premium intel?
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
            Bunny Intel API provides real-time deployment alerts, alpha signals, and more.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/leaderboard" className="btn-secondary">
              View Leaderboard
            </Link>
            <a
              href="https://t.me/MegaDeploymentBot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Join Telegram Bot
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
