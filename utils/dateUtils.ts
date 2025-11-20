import { CycleEntry } from '../types';

// Helper to get local "today" as YYYY-MM-DD string
export const getLocalTodayStr = (): string => {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

// Helper to construct a date object from YYYY-MM-DD string without timezone shift
// (Treats the string as local midnight, but creates a Date object where we can trust getFullYear/Month/Date)
const getDateFromStr = (dateStr: string): Date => {
  const parts = dateStr.split('-');
  // Note: Month is 0-indexed in JS Date
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = getDateFromStr(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDayOfWeek = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = getDateFromStr(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
  });
};

export const getDurationInDays = (startStr: string, endStr?: string): number => {
  if (!startStr) return 0;

  // Convert strings to UTC timestamps for difference calculation
  const start = new Date(startStr);
  
  let end: Date;
  if (endStr) {
    end = new Date(endStr);
  } else {
    // Default to local "Today" converted to YYYY-MM-DD
    end = new Date(getLocalTodayStr());
  }
  
  // Reset times to UTC midnight to avoid partial day diffs
  const utcStart = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const utcEnd = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());

  const diffTime = utcEnd - utcStart;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Return inclusive count (start date is Day 1)
  // Max(1, ...) ensures we don't show negative or 0 if dates are wonky
  return Math.max(1, days + 1);
};

export const getCycleLength = (currentStart: string, previousStart: string): number => {
  const current = new Date(currentStart);
  const prev = new Date(previousStart);
  
  const utcCurrent = Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate());
  const utcPrev = Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate());
  
  const diffTime = Math.abs(utcCurrent - utcPrev);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const sortEntries = (entries: CycleEntry[]): CycleEntry[] => {
  return [...entries].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};

// Helper to generate dates between start and end (or today)
export const getDatesInRange = (start: string, end?: string): string[] => {
  if (!start) return [];
  
  const targetEndStr = end || getLocalTodayStr();
  
  // Prevent loop if start is after end
  if (new Date(start) > new Date(targetEndStr)) {
      return [start];
  }

  const dates: string[] = [];
  const endDate = new Date(targetEndStr);
  
  // Use local date construction to iterate safely
  const currentIterator = getDateFromStr(start); 
  const finalDate = getDateFromStr(targetEndStr);
  
  let safetyCount = 0;
  const MAX_DAYS = 60;

  while (currentIterator <= finalDate && safetyCount < MAX_DAYS) {
    // Convert back to YYYY-MM-DD string
    const year = currentIterator.getFullYear();
    const month = String(currentIterator.getMonth() + 1).padStart(2, '0');
    const day = String(currentIterator.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    
    currentIterator.setDate(currentIterator.getDate() + 1);
    safetyCount++;
  }
  
  return dates;
};

export const calculateStats = (entries: CycleEntry[]) => {
  if (entries.length === 0) return null;

  const sorted = sortEntries(entries);
  const recent = sorted[0];
  const previous = sorted[1];

  const isOngoing = !recent.endDate;
  
  // For stats, if currently ongoing, we show current duration so far
  const recentDuration = getDurationInDays(recent.startDate, recent.endDate);
  
  let cycleVariation = 0;
  let lastCycleLength = 0;
  
  if (previous) {
    lastCycleLength = getCycleLength(recent.startDate, previous.startDate);
    
    // Calculate variation if we have a 3rd entry to compare the previous cycle to
    const prePrevious = sorted[2];
    if (prePrevious) {
        const prevCycleLength = getCycleLength(previous.startDate, prePrevious.startDate);
        cycleVariation = lastCycleLength - prevCycleLength;
    }
  }

  // Averages - Filter out ongoing cycles for duration average to avoid skewing
  const completedEntries = sorted.filter(e => e.endDate);
  const totalDuration = completedEntries.reduce((acc, curr) => acc + getDurationInDays(curr.startDate, curr.endDate), 0);
  const avgDuration = completedEntries.length > 0 ? Math.round(totalDuration / completedEntries.length) : 0;

  // Average Cycle Length (needs at least 2 entries)
  let avgCycleLength = 0;
  if (sorted.length > 1) {
    // Time from first recorded period to last recorded period / (count - 1)
    // Use UTC timestamps for robust calc
    const firstStart = new Date(sorted[sorted.length - 1].startDate);
    const lastStart = new Date(sorted[0].startDate);
    
    const utcFirst = Date.UTC(firstStart.getUTCFullYear(), firstStart.getUTCMonth(), firstStart.getUTCDate());
    const utcLast = Date.UTC(lastStart.getUTCFullYear(), lastStart.getUTCMonth(), lastStart.getUTCDate());
    
    const daysDiff = (utcLast - utcFirst) / (1000 * 60 * 60 * 24);
    avgCycleLength = Math.round(daysDiff / (sorted.length - 1));
  }

  return {
    averageDuration: avgDuration,
    averageCycleLength: avgCycleLength,
    lastCycleLength,
    lastDuration: recentDuration,
    cycleVariation,
    isRegular: Math.abs(cycleVariation) < 3,
    isOngoing
  };
};