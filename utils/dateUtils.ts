import { CycleEntry } from '../types';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDayOfWeek = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
  });
};

export const getDurationInDays = (start: string, end?: string): number => {
  const startDate = new Date(start);
  // If no end date, calculate duration until today (inclusive)
  const endDate = end ? new Date(end) : new Date();
  
  // If start date is in the future relative to "today" (and no end date), duration is 1 (the start day)
  if (!end && startDate > endDate) return 1;

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
};

export const getCycleLength = (currentStart: string, previousStart: string): number => {
  const current = new Date(currentStart);
  const prev = new Date(previousStart);
  const diffTime = Math.abs(current.getTime() - prev.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const sortEntries = (entries: CycleEntry[]): CycleEntry[] => {
  return [...entries].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};

// Helper to generate dates between start and end (or today)
export const getDatesInRange = (start: string, end?: string): string[] => {
  if (!start) return [];
  const s = new Date(start);
  
  let eDate: Date;
  if (end) {
    eDate = new Date(end);
  } else {
    // Default to local "Today" YYYY-MM-DD to match input[type=date] logic
    // This ensures that if it is late at night, we don't accidentally jump to tomorrow (UTC)
    const localYMD = new Date().toLocaleDateString('en-CA'); 
    eDate = new Date(localYMD);
  }
  
  // If start is strictly after end, just return start (1 day) to avoid crashes
  if (s > eDate) {
     return [start];
  }

  const dates = [];
  const MAX_DAYS = 60; 
  let safetyCount = 0;

  // Clone to avoid modifying original date
  const currentIterator = new Date(s);

  while (currentIterator <= eDate && safetyCount < MAX_DAYS) {
    dates.push(currentIterator.toISOString().split('T')[0]);
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
    const firstStart = new Date(sorted[sorted.length - 1].startDate).getTime();
    const lastStart = new Date(sorted[0].startDate).getTime();
    const daysDiff = (lastStart - firstStart) / (1000 * 60 * 60 * 24);
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