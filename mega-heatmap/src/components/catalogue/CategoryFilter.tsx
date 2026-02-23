"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryCounts, type Category } from "@/data/catalogue";
import {
  Landmark, ArrowLeftRight, Banknote, Rocket, Layers, LineChart,
  TrendingUp, Dice5, Wifi, Server, Gamepad2, Users, Brain, LayoutGrid,
} from "lucide-react";

const ICONS: Record<string, typeof Landmark> = {
  Landmark, ArrowLeftRight, Banknote, Rocket, Layers, LineChart,
  TrendingUp, Dice5, Wifi, Server, Gamepad2, Users, Brain,
};

interface CategoryFilterProps {
  selected: Category | "all";
  onChange: (category: Category | "all") => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const counts = getCategoryCounts();
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap gap-2">
      <CategoryButton
        id="all"
        name="All"
        icon={LayoutGrid}
        count={totalCount}
        color="var(--color-accent)"
        isSelected={selected === "all"}
        onClick={() => onChange("all")}
      />
      {CATEGORIES.map((category) => {
        const Icon = ICONS[category.icon] || Landmark;
        return (
          <CategoryButton
            key={category.id}
            id={category.id}
            name={category.name}
            icon={Icon}
            count={counts[category.id]}
            color={category.color}
            isSelected={selected === category.id}
            onClick={() => onChange(category.id)}
          />
        );
      })}
    </div>
  );
}

interface CategoryButtonProps {
  id: string;
  name: string;
  icon: typeof Landmark;
  count: number;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryButton({ id, name, icon: Icon, count, color, isSelected, onClick }: CategoryButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150"
      style={
        isSelected
          ? {
            backgroundColor: `${color}12`,
            color: color,
            borderColor: `${color}35`,
          }
          : {
            backgroundColor: "rgba(174, 164, 191, 0.06)",
            color: "var(--color-muted)",
            borderColor: "rgba(174, 164, 191, 0.15)",
          }
      }
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{name}</span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
        style={{
          backgroundColor: isSelected
            ? "rgba(255,255,255,0.15)"
            : "rgba(174, 164, 191, 0.1)",
          color: isSelected ? color : "var(--color-dim)",
        }}
      >
        {count}
      </span>
    </motion.button>
  );
}

// Compact sidebar variant
export function CategoryFilterSidebar({ selected, onChange }: CategoryFilterProps) {
  const counts = getCategoryCounts();
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <nav className="space-y-1">
      <SidebarItem
        name="All Projects"
        count={totalCount}
        isSelected={selected === "all"}
        onClick={() => onChange("all")}
      />
      <div className="pt-4 pb-1">
        <h3

          className="px-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-dim)" }}
        >
          Categories
        </h3>
      </div>
      {CATEGORIES.map((category) => (
        <SidebarItem
          key={category.id}
          name={category.name}
          count={counts[category.id]}
          color={category.color}
          isSelected={selected === category.id}
          onClick={() => onChange(category.id)}
        />
      ))}
    </nav>
  );
}

interface SidebarItemProps {
  name: string;
  count: number;
  color?: string;
  isSelected: boolean;
  onClick: () => void;
}

function SidebarItem({ name, count, color, isSelected, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors duration-150"
      style={{
        backgroundColor: isSelected ? "rgba(132, 226, 150, 0.08)" : "transparent",
        color: isSelected ? "var(--color-accent)" : "var(--color-muted)",
      }}
    >
      <div className="flex items-center gap-2">
        {color && (
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        )}
        <span className={isSelected ? "font-medium" : ""}>{name}</span>
      </div>
      <span className="text-xs font-mono" style={{ color: isSelected ? "var(--color-accent)" : "var(--color-dim)" }}>
        {count}
      </span>
    </button>
  );
}
