"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Rocket, Construction, Search, BarChart3, Tag } from "lucide-react";

const features = [
  { icon: Search, label: "Real-time indexing" },
  { icon: BarChart3, label: "Deployment analytics" },
  { icon: Tag, label: "Contract tagging" },
];

export default function DeploymentsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Status badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-8 text-xs font-mono"
            style={{
              backgroundColor: "rgba(232, 195, 122, 0.06)",
              borderColor: "rgba(232, 195, 122, 0.25)",
              color: "#e8c37a",
            }}
          >
            <Construction className="w-3.5 h-3.5" />
            under construction
          </div>

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{
              backgroundColor: "rgba(132, 226, 150, 0.08)",
              border: "1px solid rgba(132, 226, 150, 0.2)",
            }}
          >
            <Rocket className="w-8 h-8" style={{ color: "#84e296" }} />
          </div>

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "#f5f8de" }}
          >
            Deployment Tracker
          </h1>

          {/* Description */}
          <p className="text-base leading-relaxed mb-2" style={{ color: "#aea4bf" }}>
            Every contract deployment on MegaETH, catalogued and analyzed.
          </p>
          <p className="text-sm mb-10" style={{ color: "#8f6593" }}>
            Currently indexing 36+ projects. Dashboard dropping soon.
          </p>

          {/* Coming soon cards */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="card p-4"
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "#84e296" }} />
                  <div className="text-xs font-medium" style={{ color: "#aea4bf" }}>
                    {feature.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Back button */}
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Footer */}
          <p className="mt-10 text-xs font-mono" style={{ color: "#8f6593" }}>
            Want updates? Follow{" "}
            <a
              href="https://twitter.com/korewapandesu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#84e296] transition-colors"
              style={{ color: "#aea4bf" }}
            >
              @korewapandesu
            </a>{" "}
            on Twitter
          </p>
        </motion.div>
      </div>
    </div>
  );
}
