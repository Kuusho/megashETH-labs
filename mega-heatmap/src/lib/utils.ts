import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Format address to shortened version
 */
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get heatmap intensity level (0-4) based on transaction count
 */
export function getHeatmapLevel(txCount: number): 0 | 1 | 2 | 3 | 4 {
  if (txCount === 0) return 0;
  if (txCount <= 2) return 1;
  if (txCount <= 5) return 2;
  if (txCount <= 10) return 3;
  return 4;
}

/**
 * Get days in a year for heatmap
 */
export function getDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

/**
 * Group days by week for heatmap grid
 */
export function groupByWeek(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Pad the first week if it doesn't start on Sunday
  const firstDay = days[0];
  const startPadding = firstDay.getDay();
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push(null as unknown as Date);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Don't forget the last partial week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Calculate streak from activity data
 */
export function calculateStreak(
  activityMap: Map<string, number>,
  referenceDate: Date = new Date()
): { current: number; longest: number } {
  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  // Sort dates descending
  const dates = Array.from(activityMap.keys()).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate current streak (from today backwards)
  const today = referenceDate.toISOString().split("T")[0];
  let checkDate = new Date(referenceDate);

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const hasActivity = activityMap.has(dateStr) && activityMap.get(dateStr)! > 0;

    if (hasActivity) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr === today) {
      // Today hasn't been completed yet, continue checking
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak ever
  let prevDate: Date | null = null;
  for (const dateStr of dates.reverse()) {
    const count = activityMap.get(dateStr) || 0;
    if (count === 0) continue;

    const date = new Date(dateStr);

    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const dayDiff =
        (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
    }

    prevDate = date;
  }
  longest = Math.max(longest, tempStreak);

  return { current, longest };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
