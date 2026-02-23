"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, Star } from "lucide-react";
import { CATEGORIES } from "@/data/catalogue";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Deployment {
  id: string;
  project: string;
  category: string | null;
  tvl_usd: number | null;
  tvl_formatted: string | null;
  contract_address: string | null;
  verified: boolean;
  tx_count: number | null;
  score: number | null;
  classification: string | null;
  twitter: string | null;
  deployed_at: string;
  description: string | null;
  featured: boolean;
}

interface DeploymentsData {
  count: number;
  categories: string[];
  deployments: Deployment[];
  updated_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_REFRESH_MS = 5 * 60 * 1000;

// Build a colour map from catalogue.ts category definitions
const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.color])
);

const CLASSIFICATION_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  ALPHA: {
    bg: "rgba(132, 226, 150, 0.12)",
    color: "var(--color-accent)",
    label: "ALPHA",
  },
  ROUTINE: {
    bg: "rgba(59, 130, 246, 0.12)",
    color: "#60A5FA",
    label: "ROUTINE",
  },
  WARNING: {
    bg: "rgba(232, 195, 122, 0.12)",
    color: "var(--color-warning)",
    label: "WARNING",
  },
  RISK: {
    bg: "rgba(255, 123, 123, 0.12)",
    color: "var(--color-error)",
    label: "RISK",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryPill({
  label,
  color,
}: {
  label: string;
  color: string | undefined;
}) {
  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
      style={{
        backgroundColor: color ? `${color}20` : "rgba(174, 164, 191, 0.1)",
        color: color ?? "var(--color-dim)",
        border: `1px solid ${color ? `${color}40` : "rgba(174, 164, 191, 0.15)"}`,
      }}
    >
      {label}
    </span>
  );
}

function ClassificationBadge({ value }: { value: string | null }) {
  if (!value) return null;
  const style =
    CLASSIFICATION_STYLES[value.toUpperCase()] ?? CLASSIFICATION_STYLES.ROUTINE;
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

function ProjectLiveCard({
  d,
  index,
}: {
  d: Deployment;
  index: number;
}) {
  const catColor = d.category ? CATEGORY_COLOR[d.category.toLowerCase()] : undefined;
  const catLabel = d.category
    ? (CATEGORIES.find((c) => c.id === d.category?.toLowerCase())?.name ?? d.category)
    : "Uncategorised";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-xl border p-5 flex flex-col gap-3 transition-colors duration-150"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "rgba(174, 164, 191, 0.12)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "rgba(132, 226, 150, 0.22)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.borderColor =
          "rgba(174, 164, 191, 0.12)")
      }
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "var(--color-text)" }}
          >
            {d.project.replace(/^@/, "")}
          </span>
          {d.verified && (
            <CheckCircle
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: "var(--color-accent)" }}
            />
          )}
          {d.featured && (
            <Star
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: "var(--color-warning)" }}
            />
          )}
        </div>
        <CategoryPill label={catLabel} color={catColor} />
      </div>

      {/* Description */}
      <p
        className="text-xs leading-relaxed flex-1"
        style={{ color: d.description ? "var(--color-muted)" : "var(--color-dim)" }}
      >
        {d.description ?? "No description available."}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <ClassificationBadge value={d.classification} />
          {d.tvl_formatted && (
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: "var(--color-accent)" }}
            >
              {d.tvl_formatted} TVL
            </span>
          )}
        </div>
        {d.twitter && (
          <span
            className="text-[11px] font-mono truncate"
            style={{ color: "var(--color-dim)" }}
          >
            {d.twitter}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5 space-y-3 animate-pulse"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "rgba(174, 164, 191, 0.08)",
      }}
    >
      <div className="flex justify-between">
        <div
          className="h-4 w-28 rounded"
          style={{ backgroundColor: "rgba(174, 164, 191, 0.1)" }}
        />
        <div
          className="h-4 w-16 rounded"
          style={{ backgroundColor: "rgba(174, 164, 191, 0.08)" }}
        />
      </div>
      <div
        className="h-3 w-full rounded"
        style={{ backgroundColor: "rgba(174, 164, 191, 0.07)" }}
      />
      <div
        className="h-3 w-4/5 rounded"
        style={{ backgroundColor: "rgba(174, 164, 191, 0.06)" }}
      />
      <div className="flex justify-between pt-1">
        <div
          className="h-3 w-20 rounded"
          style={{ backgroundColor: "rgba(174, 164, 191, 0.08)" }}
        />
        <div
          className="h-3 w-16 rounded"
          style={{ backgroundColor: "rgba(174, 164, 191, 0.06)" }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeploymentsPage() {
  const [data, setData] = useState<DeploymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchData = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const url =
        category !== "all"
          ? `/api/dashboard/deployments?category=${encodeURIComponent(category)}&limit=100`
          : "/api/dashboard/deployments?limit=100";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (err) {
      console.error("Failed to fetch deployments:", err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedCategory);
    const interval = setInterval(
      () => fetchData(selectedCategory),
      AUTO_REFRESH_MS
    );
    return () => clearInterval(interval);
  }, [selectedCategory, fetchData]);

  const isInitialLoad = loading && !data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            Project Catalogue
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {data ? `${data.count} projects tracked on MegaETH` : "MegaETH ecosystem projects"}
          </p>
        </div>
        <button
          onClick={() => fetchData(selectedCategory)}
          className="p-2 rounded-lg transition-colors hover:bg-[rgba(174,164,191,0.08)] flex-shrink-0"
          title="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            style={{ color: "var(--color-dim)" }}
          />
        </button>
      </motion.div>

      {/* Category filter */}
      {(data || isInitialLoad) && (
        <div className="flex flex-wrap gap-2">
          <FilterTab
            label="All"
            active={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
          />
          {(data?.categories ?? []).map((cat) => {
            const catInfo = CATEGORIES.find((c) => c.id === cat.toLowerCase());
            return (
              <FilterTab
                key={cat}
                label={catInfo?.name ?? cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                color={catInfo?.color}
              />
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="card p-6 text-center"
          style={{ borderColor: "rgba(255, 123, 123, 0.2)" }}
        >
          <p className="text-sm mb-3" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
          <button
            onClick={() => fetchData(selectedCategory)}
            className="btn-secondary text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {isInitialLoad ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.deployments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.deployments.map((d, i) => (
            <ProjectLiveCard key={d.id} d={d} index={i} />
          ))}
        </div>
      ) : data && data.deployments.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm" style={{ color: "var(--color-dim)" }}>
            No projects found in this category.
          </p>
        </div>
      ) : null}

      {/* Footer */}
      {data && (
        <p className="text-center text-xs font-mono" style={{ color: "var(--color-dim)" }}>
          Updated {new Date(data.updated_at).toLocaleString()} · auto-refreshes every 5 min
        </p>
      )}
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
      style={
        active
          ? {
              backgroundColor: color ?? "var(--color-accent)",
              color: "var(--color-bg)",
              border: "1px solid transparent",
            }
          : {
              backgroundColor: "rgba(174, 164, 191, 0.07)",
              color: "var(--color-muted)",
              border: "1px solid rgba(174, 164, 191, 0.14)",
            }
      }
    >
      {label}
    </button>
  );
}
