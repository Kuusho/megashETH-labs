"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { HeatmapComparison } from "@/components/heatmap/HeatmapComparison";

// Demo data generator
function generateDemoData(seed: string): Map<string, number> {
  const data = new Map<string, number>();
  const today = new Date();
  const seedNum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Seeded random based on address
    const rand = Math.sin(seedNum + i) * 10000;
    const normalizedRand = rand - Math.floor(rand);

    if (normalizedRand > 0.3) {
      const count = Math.floor(normalizedRand * 20) + 1;
      data.set(dateStr, count);
    }
  }

  return data;
}

// Demo usernames
const DEMO_USERS: Record<string, string> = {
  "0x1234567890abcdef1234567890abcdef12345678": "bread",
  "0xabcdef1234567890abcdef1234567890abcdef12": "cryptomom",
  "0x9876543210fedcba9876543210fedcba98765432": "adeolu",
};

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();

  const addresses = (params.addresses as string[]) || [];

  // Validate we have exactly 2 addresses
  if (addresses.length !== 2) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-mega-gray-900 mb-4">
            Compare Two Heatmaps
          </h1>
          <p className="text-mega-gray-600 mb-8">
            Enter two wallet addresses to compare their MegaETH activity
          </p>
          <CompareSearch />
        </div>
      </div>
    );
  }

  const [addressA, addressB] = addresses;

  // Generate demo data
  const userA = useMemo(
    () => ({
      address: addressA,
      username: DEMO_USERS[addressA.toLowerCase()],
      data: generateDemoData(addressA),
    }),
    [addressA]
  );

  const userB = useMemo(
    () => ({
      address: addressB,
      username: DEMO_USERS[addressB.toLowerCase()],
      data: generateDemoData(addressB),
    }),
    [addressB]
  );

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/heatmap"
            className="inline-flex items-center text-sm text-mega-gray-600 hover:text-mega-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Heatmap
          </Link>
        </motion.div>

        {/* Comparison */}
        <HeatmapComparison userA={userA} userB={userB} />
      </div>
    </div>
  );
}

function CompareSearch() {
  return (
    <div className="glass-card p-8 max-w-lg mx-auto">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-mega-gray-700 mb-2">
            First Address
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-lg border border-mega-gray-200 focus:border-mega-green focus:ring-2 focus:ring-mega-green/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="text-center text-mega-gray-400 font-medium">vs</div>

        <div>
          <label className="block text-sm font-medium text-mega-gray-700 mb-2">
            Second Address
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-3 rounded-lg border border-mega-gray-200 focus:border-mega-green focus:ring-2 focus:ring-mega-green/20 outline-none transition-all"
            />
          </div>
        </div>

        <button className="w-full btn-primary mt-4">
          <Search className="w-4 h-4 mr-2" />
          Compare Heatmaps
        </button>
      </div>
    </div>
  );
}
