"use client";

interface HeatmapLegendProps {
  colors: Record<0 | 1 | 2 | 3 | 4, string>;
}

export function HeatmapLegend({ colors }: HeatmapLegendProps) {
  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: '#878283' }}>
      <span>Less</span>
      <div className="flex gap-1">
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className="w-3 h-3 rounded-[2px]"
            style={{ backgroundColor: colors[level] }}
            title={getLevelLabel(level)}
          />
        ))}
      </div>
      <span>More</span>
    </div>
  );
}

function getLevelLabel(level: 0 | 1 | 2 | 3 | 4): string {
  switch (level) {
    case 0:
      return "No transactions";
    case 1:
      return "1-2 transactions";
    case 2:
      return "3-5 transactions";
    case 3:
      return "6-10 transactions";
    case 4:
      return "11+ transactions";
  }
}
