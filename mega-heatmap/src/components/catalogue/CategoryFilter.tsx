"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryCounts, type Category, type CategoryInfo } from "@/data/catalogue";
import {
  Landmark,
  ArrowLeftRight,
  Banknote,
  Rocket,
  Layers,
  LineChart,
  TrendingUp,
  Dice5,
  Wifi,
  Server,
  Gamepad2,
  Users,
  Brain,
  LayoutGrid,
} from "lucide-react";

const ICONS: Record<string, typeof Landmark> = {
  Landmark,
  ArrowLeftRight,
  Banknote,
  Rocket,
  Layers,
  LineChart,
  TrendingUp,
  Dice5,
  Wifi,
  Server,
  Gamepad2,
  Users,
  Brain,
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
      {/* All button */}
      <CategoryButton
        id="all"
        name="All"
        icon={LayoutGrid}
        count={totalCount}
        color="#00D395"
        isSelected={selected === "all"}
        onClick={() => onChange("all")}
      />

      {/* Category buttons */}
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

function CategoryButton({
  id,
  name,
  icon: Icon,
  count,
  color,
  isSelected,
  onClick,
}: CategoryButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
        "border transition-all duration-200",
        isSelected
          ? "border-transparent shadow-md"
          : "border-mega-gray-200 bg-white hover:border-mega-gray-300"
      )}
      style={
        isSelected
          ? {
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}30`,
            }
          : {}
      }
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4" />
      <span>{name}</span>
      <span
        className={cn(
          "text-xs px-1.5 py-0.5 rounded-full",
          isSelected ? "bg-white/50" : "bg-mega-gray-100 text-mega-gray-500"
        )}
      >
        {count}
      </span>
    </motion.button>
  );
}

// Compact sidebar version
export function CategoryFilterSidebar({
  selected,
  onChange,
}: CategoryFilterProps) {
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

      <div className="pt-4 pb-2">
        <h3 className="px-3 text-xs font-semibold text-mega-gray-400 uppercase tracking-wider">
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

function SidebarItem({
  name,
  count,
  color,
  isSelected,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm",
        "transition-all duration-150",
        isSelected
          ? "bg-mega-green/10 text-mega-green font-medium"
          : "text-mega-gray-600 hover:bg-mega-gray-100"
      )}
    >
      <div className="flex items-center gap-2">
        {color && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
        <span>{name}</span>
      </div>
      <span
        className={cn(
          "text-xs",
          isSelected ? "text-mega-green" : "text-mega-gray-400"
        )}
      >
        {count}
      </span>
    </button>
  );
}
