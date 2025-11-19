export type FlowIntensity = 'Light' | 'Medium' | 'Heavy' | 'Spotting';

export interface DailyLog {
  date: string;
  flowIntensity: FlowIntensity;
}

export interface CycleEntry {
  id: string;
  startDate: string; // ISO Date String
  endDate?: string;   // ISO Date String (Optional)
  days: DailyLog[];
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  themeColor: string;
  entries: CycleEntry[];
}

export interface AppData {
  users: UserProfile[];
  activeUserId: string | null;
  version: number;
}

export interface CycleStats {
  averageDuration: number;
  averageCycleLength: number;
  lastCycleLength: number;
  lastDuration: number;
  cycleVariation: number; // Difference in days from previous
  isRegular: boolean;
  isOngoing: boolean;
}

export const DEFAULT_THEME_COLOR = 'rose';