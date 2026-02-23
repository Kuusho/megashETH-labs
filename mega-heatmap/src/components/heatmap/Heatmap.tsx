"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, subDays, eachDayOfInterval, getDay, startOfWeek } from "date-fns";
import { cn, getHeatmapLevel } from "@/lib/utils";
import { HeatmapTooltip } from "./HeatmapTooltip";
import { HeatmapLegend } from "./HeatmapLegend";

interface HeatmapProps {
  data: Map<string, number>;
  year?: number;
  colorScheme?: "violet" | "fire" | "ocean" | "forest";
  showLabels?: boolean;
  onDayClick?: (date: string, count: number) => void;
}

const COLOR_SCHEMES = {
  // Palette-native: midnight violet → lavender → spring green
  violet: {
    0: "#3b252c",
    1: "#5e3c4a",
    2: "#8f6593",
    3: "#aea4bf",
    4: "#84e296",
  },
  fire: {
    0: "#2d1b22",
    1: "#4a1a0a",
    2: "#8c250a",
    3: "#d43d0f",
    4: "#eb4511",
  },
  ocean: {
    0: "#2d1b22",
    1: "#0A3069",
    2: "#0969DA",
    3: "#54AEFF",
    4: "#80CCFF",
  },
  forest: {
    0: "#2d1b22",
    1: "#0E4429",
    2: "#006D32",
    3: "#26A641",
    4: "#39D353",
  },
};

const CELL_SIZE = 12;
const CELL_GAP = 3;
const MONTH_LABEL_HEIGHT = 20;
const DAY_LABEL_WIDTH = 32;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Heatmap({
  data,
  colorScheme = "violet",
  showLabels = true,
  onDayClick,
}: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const colors = COLOR_SCHEMES[colorScheme];

  // Generate all days for the last 365 days
  const { weeks, monthPositions } = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 364);
    const adjustedStart = startOfWeek(startDate);
    const allDays = eachDayOfInterval({ start: adjustedStart, end: today });

    // Group into weeks
    const weeksArray: Date[][] = [];
    let currentWeek: Date[] = [];

    for (const day of allDays) {
      currentWeek.push(day);
      if (getDay(day) === 6) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }

    // Month positions
    const monthPos: { month: string; x: number }[] = [];
    let lastMonth = -1;

    weeksArray.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = firstDay.getMonth();
        if (month !== lastMonth) {
          monthPos.push({
            month: MONTHS[month],
            x: weekIndex * (CELL_SIZE + CELL_GAP),
          });
          lastMonth = month;
        }
      }
    });

    return { weeks: weeksArray, monthPositions: monthPos };
  }, []);

  const gridWidth = weeks.length * (CELL_SIZE + CELL_GAP);
  const gridHeight = 7 * (CELL_SIZE + CELL_GAP);
  const totalWidth = showLabels ? DAY_LABEL_WIDTH + gridWidth : gridWidth;
  const totalHeight = showLabels ? MONTH_LABEL_HEIGHT + gridHeight : gridHeight;

  return (
    <div className="relative">
      <svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="overflow-visible"
      >
        {/* Month labels */}
        {showLabels && (
          <g transform={`translate(${DAY_LABEL_WIDTH}, 0)`}>
            {monthPositions.map(({ month, x }, i) => (
              <text
                key={`month-${i}`}
                x={x}
                y={12}
                fill="#878283"
                fontSize="10"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {month}
              </text>
            ))}
          </g>
        )}

        {/* Day labels */}
        {showLabels && (
          <g transform={`translate(0, ${MONTH_LABEL_HEIGHT})`}>
            {[1, 3, 5].map((dayIndex) => (
              <text
                key={`day-${dayIndex}`}
                x={0}
                y={dayIndex * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                fill="#878283"
                fontSize="10"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {DAYS[dayIndex].slice(0, 3)}
              </text>
            ))}
          </g>
        )}

        {/* Heatmap grid */}
        <g
          transform={`translate(${showLabels ? DAY_LABEL_WIDTH : 0}, ${showLabels ? MONTH_LABEL_HEIGHT : 0})`}
        >
          {weeks.map((week, weekIndex) => (
            <g key={`week-${weekIndex}`}>
              {week.map((day) => {
                if (!day) return null;

                const dateStr = format(day, "yyyy-MM-dd");
                const count = data.get(dateStr) || 0;
                const level = getHeatmapLevel(count);
                const color = colors[level];

                const x = weekIndex * (CELL_SIZE + CELL_GAP);
                const y = getDay(day) * (CELL_SIZE + CELL_GAP);

                return (
                  <motion.rect
                    key={dateStr}
                    x={x}
                    y={y}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    rx={2}
                    fill={color}
                    className="cursor-pointer"
                    style={{ transition: 'all 0.15s ease' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: weekIndex * 0.002,
                      duration: 0.2,
                    }}
                    whileHover={{ scale: 1.15 }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredDay({
                        date: dateStr,
                        count,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => onDayClick?.(dateStr, count)}
                  />
                );
              })}
            </g>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredDay && (
        <HeatmapTooltip
          date={hoveredDay.date}
          count={hoveredDay.count}
          x={hoveredDay.x}
          y={hoveredDay.y}
        />
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end">
        <HeatmapLegend colors={colors} />
      </div>
    </div>
  );
}
