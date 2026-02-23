"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { HeatmapComparison } from "@/components/heatmap/HeatmapComparison";

function generateDemoData(seed: string): Map<string, number> {
  const data = new Map<string, number>();
  const today = new Date();
  const seedNum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const rand = Math.sin(seedNum + i) * 10000;
    const normalizedRand = rand - Math.floor(rand);
    if (normalizedRand > 0.3) {
      data.set(dateStr, Math.floor(normalizedRand * 20) + 1);
    }
  }

  return data;
}

const DEMO_USERS: Record<string, string> = {
  "0x1234567890abcdef1234567890abcdef12345678": "bread",
  "0xabcdef1234567890abcdef1234567890abcdef12": "cryptomom",
  "0x9876543210fedcba9876543210fedcba98765432": "adeolu",
};

export default function ComparePage() {
  const params = useParams();
  const addresses = (params.addresses as string[]) || [];

  if (addresses.length !== 2) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold mb-3" style={{ color: "#f5f8de" }}>
            Compare Two Heatmaps
          </h1>
          <p className="text-sm mb-8" style={{ color: "#aea4bf" }}>
            Enter two wallet addresses to compare their MegaETH activity
          </p>
          <CompareSearch />
        </div>
      </div>
    );
  }

  const [addressA, addressB] = addresses;

  const userA = useMemo(() => ({
    address: addressA,
    username: DEMO_USERS[addressA.toLowerCase()],
    data: generateDemoData(addressA),
  }), [addressA]);

  const userB = useMemo(() => ({
    address: addressB,
    username: DEMO_USERS[addressB.toLowerCase()],
    data: generateDemoData(addressB),
  }), [addressB]);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/heatmap"
            className="inline-flex items-center text-sm transition-colors hover:text-[#f5f8de]"
            style={{ color: "#8f6593" }}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Heatmap
          </Link>
        </motion.div>

        <HeatmapComparison userA={userA} userB={userB} />
      </div>
    </div>
  );
}

function CompareSearch() {
  return (
    <div className="card p-8 max-w-lg mx-auto text-left">
      <div className="space-y-4">
        {["First Address", "Second Address"].map((label, i) => (
          <div key={label}>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#aea4bf" }}>
              {label}
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input font-mono"
            />
          </div>
        ))}

        <div
          className="text-center text-sm font-semibold py-1"
          style={{ color: "#8f6593" }}
        >
          vs
        </div>

        <button className="w-full btn-primary mt-2">
          <Search className="w-4 h-4" />
          Compare Heatmaps
        </button>
      </div>
    </div>
  );
}
