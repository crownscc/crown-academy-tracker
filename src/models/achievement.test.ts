import {
  createAchievement,
  getTierMultiplier,
  calculateAchievementScore,
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

    // NOTE: negative pointsRequired case is NOT tested
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

  // NOTE: isAchievementEarned and updateProgress are NOT tested
});
