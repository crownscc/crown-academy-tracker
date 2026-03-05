export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  pointsRequired: number;
  iconUrl: string;
}

export interface StudentAchievement {
  studentId: string;
  achievementId: string;
  earnedAt: Date;
  progress: number; // 0-100
}

export function createAchievement(
  id: string,
  title: string,
  description: string,
  tier: AchievementTier,
  pointsRequired: number,
  iconUrl: string,
): Achievement {
  if (!id || !title) {
    throw new Error('Achievement id and title are required');
  }
  if (pointsRequired < 0) {
    throw new Error('Points required cannot be negative');
  }
  return { id, title, description, tier, pointsRequired, iconUrl };
}

export function getTierMultiplier(tier: AchievementTier): number {
  switch (tier) {
    case 'bronze':
      return 1;
    case 'silver':
      return 2;
    case 'gold':
      return 3;
    case 'platinum':
      return 5;
    default:
      return 1;
  }
}

export function calculateAchievementScore(achievement: Achievement): number {
  return achievement.pointsRequired * getTierMultiplier(achievement.tier);
}

export function isAchievementEarned(studentAchievement: StudentAchievement): boolean {
  return studentAchievement.progress >= 100;
}

export function updateProgress(
  studentAchievement: StudentAchievement,
  newProgress: number,
): StudentAchievement {
  if (newProgress < 0) {
    throw new Error('Progress cannot be negative');
  }
  const clampedProgress = Math.min(newProgress, 100);
  return {
    ...studentAchievement,
    progress: clampedProgress,
    earnedAt: clampedProgress >= 100 ? new Date() : studentAchievement.earnedAt,
  };
}
