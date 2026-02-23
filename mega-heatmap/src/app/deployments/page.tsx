"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Rocket, Construction } from "lucide-react";
import { BunnyMascot } from "@/components/BunnyMascot";

export default function DeploymentsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Bunny mascot */}
          <motion.div
            className="flex justify-center mb-8"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <BunnyMascot size="lg" animated interactive />
          </motion.div>

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 133, 212, 0.1))',
              borderColor: '#ffe66d',
            }}
            animate={{
              borderColor: ['#ffe66d', '#ff85d4', '#4ecdc4', '#ffe66d'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Construction className="w-4 h-4" style={{ color: '#ffe66d' }} />
            <span className="text-sm font-bold" style={{ color: '#ffe66d' }}>
              under construction
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-gradient-rainbow animate-shimmer">
              Deployment Tracker
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg mb-4" style={{ color: '#a8a3a4' }}>
            every contract deployment on megaeth, catalogued and analyzed.
          </p>
          <p className="text-base mb-8" style={{ color: '#666162' }}>
            currently indexing 36+ projects. dashboard dropping soon. 🚀
          </p>

          {/* Fun ASCII art */}
          <motion.div
            className="mb-12 p-6 rounded-lg inline-block"
            style={{
              backgroundColor: 'rgba(255, 107, 53, 0.05)',
              border: '2px dashed #ff6b35',
            }}
            whileHover={{ scale: 1.05 }}
          >
            <pre
              className="text-[10px] leading-[1.2] font-mono"
              style={{
                color: '#ff85d4',
                textShadow: '0 0 10px rgba(255, 133, 212, 0.3)',
              }}
            >
{`     🚀
    /|\\
   / | \\
  /  |  \\
 /   |   \\
/____|____\\
|  BUNNY  |
|  INTEL  |
|__________|
    | |
    | |
   /   \\`}
            </pre>
          </motion.div>

          {/* Features coming */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { emoji: "🔍", label: "real-time indexing" },
              { emoji: "📈", label: "deployment analytics" },
              { emoji: "🏷️", label: "contract tagging" },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 107, 53, 0.05)',
                  border: '2px solid rgba(255, 107, 53, 0.2)',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                whileHover={{
                  borderColor: '#ff6b35',
                  scale: 1.05,
                }}
              >
                <div className="text-3xl mb-2">{feature.emoji}</div>
                <div className="text-sm font-semibold" style={{ color: '#a8a3a4' }}>
                  {feature.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Back button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              back to home
            </Link>
          </motion.div>

          {/* Footer note */}
          <p className="mt-12 text-sm font-mono" style={{ color: '#666162' }}>
            want updates? follow <span className="text-gradient-bunny font-bold">@korewapandesu</span> on twitter
          </p>
        </motion.div>
      </div>
    </div>
  );
}
