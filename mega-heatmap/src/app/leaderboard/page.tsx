"use client";

import { motion } from "framer-motion";
import { Leaderboard } from "@/components/leaderboard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LeaderboardPage() {
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
            className="inline-flex items-center text-sm mb-4 transition-colors hover:text-[#f5f8de]"
            style={{ color: "#8f6593" }}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Heatmap
          </Link>

          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#f5f8de" }}>
            MegaETH Leaderboard
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#8f6593" }}>
            Top builders ranked by onchain activity score
          </p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Leaderboard />
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm mb-4" style={{ color: "#8f6593" }}>
            Not on the leaderboard yet?
          </p>
          <Link href="/heatmap" className="btn-primary">
            Check Your Score
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
