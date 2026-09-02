import { RankType } from '../types';

export interface RankInfo {
  rank: RankType;
  currentXP: number;
  minXP: number;
  maxXP: number;
  progressPercent: number;
  xpToNext: number;
  isMaxRank: boolean;
  colorHex: string;
  badgeClass: string;
}

export const RANK_THRESHOLDS: Record<RankType, { min: number; max: number; next?: RankType; colorHex: string; badgeClass: string }> = {
  BRONZE: { min: 0, max: 499, next: 'SILVER', colorHex: '#CD7F32', badgeClass: 'badge-bronze' },
  SILVER: { min: 500, max: 999, next: 'GOLD', colorHex: '#C0C0C0', badgeClass: 'badge-silver' },
  GOLD: { min: 1000, max: 1999, next: 'PLATINUM', colorHex: '#FFD700', badgeClass: 'badge-gold' },
  PLATINUM: { min: 2000, max: 3499, next: 'DIAMOND', colorHex: '#E5E4E2', badgeClass: 'badge-platinum' },
  DIAMOND: { min: 3500, max: Infinity, colorHex: '#00F0FF', badgeClass: 'badge-diamond' },
};

export function calculateRank(xp: number): RankType {
  if (xp >= 3500) return 'DIAMOND';
  if (xp >= 2000) return 'PLATINUM';
  if (xp >= 1000) return 'GOLD';
  if (xp >= 500) return 'SILVER';
  return 'BRONZE';
}

export function getRankDetails(xp: number): RankInfo {
  const rank = calculateRank(xp);
  const info = RANK_THRESHOLDS[rank];

  if (rank === 'DIAMOND') {
    return {
      rank,
      currentXP: xp,
      minXP: 3500,
      maxXP: 3500,
      progressPercent: 100,
      xpToNext: 0,
      isMaxRank: true,
      colorHex: info.colorHex,
      badgeClass: info.badgeClass,
    };
  }

  const rangeSpan = (info.max + 1) - info.min;
  const currentInRank = xp - info.min;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInRank / rangeSpan) * 100)));
  const xpToNext = (info.max + 1) - xp;

  return {
    rank,
    currentXP: xp,
    minXP: info.min,
    maxXP: info.max,
    progressPercent,
    xpToNext,
    isMaxRank: false,
    colorHex: info.colorHex,
    badgeClass: info.badgeClass,
  };
}

export function checkStreakMilestone(currentStreak: number, previousStreak: number): { reached: boolean; milestone: number; xpReward: number } | null {
  const milestones = [
    { days: 30, xp: 200 },
    { days: 14, xp: 100 },
    { days: 7, xp: 50 },
    { days: 3, xp: 20 },
  ];

  for (const m of milestones) {
    if (currentStreak >= m.days && previousStreak < m.days) {
      return { reached: true, milestone: m.days, xpReward: m.xp };
    }
  }

  return null;
}
