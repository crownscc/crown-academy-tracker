import {
  createAchievement,
  getTierMultiplier,
  calculateAchievementScore,
  isAchievementEarned,
  updateProgress,
  StudentAchievement,
} from './achievement';

describe('Achievement Model', () => {
  describe('createAchievement', () => {
    it('should create an achievement with valid inputs', () => {
      const achievement = createAchievement(
        'a1',
        'First Course',
        'Complete your first course',
        'bronze',
        100,
        '/icons/first.png',
      );
      expect(achievement.id).toBe('a1');
      expect(achievement.tier).toBe('bronze');
    });

    it('should throw if id or title is empty', () => {
      expect(() =>
        createAchievement('', 'Title', 'Desc', 'bronze', 100, '/icon.png'),
      ).toThrow('Achievement id and title are required');
    });

    it('should throw if pointsRequired is negative', () => {
      expect(() =>
        createAchievement('a1', 'Title', 'Desc', 'bronze', -10, '/icon.png'),
      ).toThrow('Points required cannot be negative');
    });
  });

  describe('getTierMultiplier', () => {
    it('should return correct multipliers', () => {
      expect(getTierMultiplier('bronze')).toBe(1);
      expect(getTierMultiplier('silver')).toBe(2);
      expect(getTierMultiplier('gold')).toBe(3);
      expect(getTierMultiplier('platinum')).toBe(5);
    });
  });

  describe('calculateAchievementScore', () => {
    it('should multiply points by tier multiplier', () => {
      const achievement = createAchievement(
        'a1',
        'Gold Star',
        'Earn a gold star',
        'gold',
        100,
        '/icon.png',
      );
      expect(calculateAchievementScore(achievement)).toBe(300);
    });
  });

  describe('isAchievementEarned', () => {
    const makeStudentAchievement = (progress: number): StudentAchievement => ({
      studentId: 's1',
      achievementId: 'a1',
      progress,
    });

    it('should return false when progress is below 100', () => {
      expect(isAchievementEarned(makeStudentAchievement(0))).toBe(false);
      expect(isAchievementEarned(makeStudentAchievement(99))).toBe(false);
    });

    it('should return true when progress is 100 or above', () => {
      expect(isAchievementEarned(makeStudentAchievement(100))).toBe(true);
    });
  });

  describe('updateProgress', () => {
    const baseSA: StudentAchievement = {
      studentId: 's1',
      achievementId: 'a1',
      progress: 0,
    };

    it('should update progress to new value', () => {
      const updated = updateProgress(baseSA, 50);
      expect(updated.progress).toBe(50);
    });

    it('should clamp progress at 100', () => {
      const updated = updateProgress(baseSA, 150);
      expect(updated.progress).toBe(100);
    });

    it('should set earnedAt when reaching 100', () => {
      const updated = updateProgress(baseSA, 100);
      expect(updated.earnedAt).toBeInstanceOf(Date);
    });

    it('should not set earnedAt below 100', () => {
      const updated = updateProgress(baseSA, 50);
      expect(updated.earnedAt).toBeUndefined();
    });

    it('should throw for negative progress', () => {
      expect(() => updateProgress(baseSA, -5)).toThrow('Progress cannot be negative');
    });

    it('should not mutate the original object', () => {
      const updated = updateProgress(baseSA, 50);
      expect(baseSA.progress).toBe(0);
      expect(updated.progress).toBe(50);
    });
  });
});
