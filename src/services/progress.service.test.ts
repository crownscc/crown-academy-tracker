import { ProgressService } from './progress.service';
import { Achievement, createAchievement } from '../models/achievement';

describe('ProgressService', () => {
  let service: ProgressService;
  let bronzeAchievement: Achievement;
  let goldAchievement: Achievement;

  beforeEach(() => {
    service = new ProgressService();
    bronzeAchievement = createAchievement('a1', 'First Steps', 'Complete first lesson', 'bronze', 100, '/icon.png');
    goldAchievement = createAchievement('a2', 'Gold Star', 'Master a subject', 'gold', 200, '/icon2.png');
    service.registerAchievement(bronzeAchievement);
    service.registerAchievement(goldAchievement);
  });

  describe('registerAchievement', () => {
    it('should register an achievement that can be used later', () => {
      const achievement = createAchievement('a3', 'New', 'Desc', 'silver', 50, '/icon.png');
      service.registerAchievement(achievement);
      // Can award progress to it without error
      const result = service.awardProgress('s1', 'a3', 10);
      expect(result.progress).toBe(10);
    });
  });

  describe('awardProgress', () => {
    it('should create a new student achievement with given progress', () => {
      const result = service.awardProgress('s1', 'a1', 25);
      expect(result.studentId).toBe('s1');
      expect(result.achievementId).toBe('a1');
      expect(result.progress).toBe(25);
      expect(result.earnedAt).toBeUndefined();
    });

    it('should increment progress on subsequent calls', () => {
      service.awardProgress('s1', 'a1', 25);
      const result = service.awardProgress('s1', 'a1', 30);
      expect(result.progress).toBe(55);
      expect(result.earnedAt).toBeUndefined();
    });

    it('should set earnedAt when progress reaches 100', () => {
      const result = service.awardProgress('s1', 'a1', 100);
      expect(result.progress).toBe(100);
      expect(result.earnedAt).toBeInstanceOf(Date);
    });

    it('should clamp progress at 100', () => {
      const result = service.awardProgress('s1', 'a1', 150);
      expect(result.progress).toBe(100);
    });

    it('should throw for unknown achievement', () => {
      expect(() => service.awardProgress('s1', 'unknown', 10)).toThrow('Achievement not found');
    });

    it('should not set earnedAt before reaching 100', () => {
      service.awardProgress('s1', 'a1', 50);
      const result = service.awardProgress('s1', 'a1', 30);
      expect(result.progress).toBe(80);
      expect(result.earnedAt).toBeUndefined();
    });
  });

  describe('getStudentPoints', () => {
    it('should return 0 for student with no achievements', () => {
      expect(service.getStudentPoints('s1')).toBe(0);
    });

    it('should return 0 for in-progress achievements', () => {
      service.awardProgress('s1', 'a1', 50);
      expect(service.getStudentPoints('s1')).toBe(0);
    });

    it('should return points for earned achievements only', () => {
      service.awardProgress('s1', 'a1', 100); // bronze 100pts * 1 = 100
      service.awardProgress('s1', 'a2', 50);  // not earned
      expect(service.getStudentPoints('s1')).toBe(100);
    });

    it('should sum points across multiple earned achievements', () => {
      service.awardProgress('s1', 'a1', 100); // bronze 100pts * 1 = 100
      service.awardProgress('s1', 'a2', 100); // gold 200pts * 3 = 600
      expect(service.getStudentPoints('s1')).toBe(700);
    });
  });

  describe('determineTier', () => {
    it('should return bronze for points < 200', () => {
      expect(service.determineTier(0)).toBe('bronze');
      expect(service.determineTier(199)).toBe('bronze');
    });

    it('should return silver for points 200-499', () => {
      expect(service.determineTier(200)).toBe('silver');
      expect(service.determineTier(499)).toBe('silver');
    });

    it('should return gold for points 500-999', () => {
      expect(service.determineTier(500)).toBe('gold');
      expect(service.determineTier(999)).toBe('gold');
    });

    it('should return platinum for points >= 1000', () => {
      expect(service.determineTier(1000)).toBe('platinum');
      expect(service.determineTier(5000)).toBe('platinum');
    });
  });

  describe('generateProgressReport', () => {
    it('should aggregate all progress data', () => {
      service.awardProgress('s1', 'a1', 100);
      service.awardProgress('s1', 'a2', 50);

      const enrollments = [
        { studentId: 's1', courseId: 'c1', enrolledAt: new Date(), completedAt: new Date(), grade: 'A' as const },
        { studentId: 's1', courseId: 'c2', enrolledAt: new Date() },
      ];

      const report = service.generateProgressReport('s1', enrollments, 4.0);
      expect(report.studentId).toBe('s1');
      expect(report.totalPoints).toBe(100);
      expect(report.completedCourses).toBe(1);
      expect(report.activeCourses).toBe(1);
      expect(report.achievementsEarned).toBe(1);
      expect(report.achievementsInProgress).toBe(1);
      expect(report.tier).toBe('bronze');
      expect(report.gpa).toBe(4.0);
    });

    it('should handle empty data', () => {
      const report = service.generateProgressReport('s1', [], null);
      expect(report.totalPoints).toBe(0);
      expect(report.completedCourses).toBe(0);
      expect(report.activeCourses).toBe(0);
      expect(report.achievementsEarned).toBe(0);
      expect(report.achievementsInProgress).toBe(0);
      expect(report.gpa).toBeNull();
    });
  });

  describe('generateLeaderboard', () => {
    it('should sort students by points descending', () => {
      service.awardProgress('s1', 'a1', 100); // 100 pts
      service.awardProgress('s2', 'a2', 100); // 600 pts

      const leaderboard = service.generateLeaderboard([
        { id: 's1', name: 'Alice' },
        { id: 's2', name: 'Bob' },
      ]);

      expect(leaderboard[0].studentId).toBe('s2');
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[1].studentId).toBe('s1');
      expect(leaderboard[1].rank).toBe(2);
    });

    it('should handle ties with shared ranks', () => {
      service.awardProgress('s1', 'a1', 100);
      service.awardProgress('s2', 'a1', 100);

      const leaderboard = service.generateLeaderboard([
        { id: 's1', name: 'Alice' },
        { id: 's2', name: 'Bob' },
      ]);

      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[1].rank).toBe(1);
    });

    it('should handle empty input', () => {
      const leaderboard = service.generateLeaderboard([]);
      expect(leaderboard).toHaveLength(0);
    });

    it('should handle single student', () => {
      const leaderboard = service.generateLeaderboard([{ id: 's1', name: 'Alice' }]);
      expect(leaderboard).toHaveLength(1);
      expect(leaderboard[0].rank).toBe(1);
    });

    it('should assign correct tiers based on points', () => {
      service.awardProgress('s1', 'a1', 100); // 100 pts = bronze
      const leaderboard = service.generateLeaderboard([{ id: 's1', name: 'Alice' }]);
      expect(leaderboard[0].tier).toBe('bronze');
    });
  });

  describe('calculateGradePoints', () => {
    it('should return correct point values for each grade', () => {
      expect(service.calculateGradePoints('A')).toBe(4.0);
      expect(service.calculateGradePoints('B')).toBe(3.0);
      expect(service.calculateGradePoints('C')).toBe(2.0);
      expect(service.calculateGradePoints('D')).toBe(1.0);
      expect(service.calculateGradePoints('F')).toBe(0.0);
    });
  });

  describe('getStudentAchievements', () => {
    it('should return empty array for unknown student', () => {
      expect(service.getStudentAchievements('unknown')).toEqual([]);
    });

    it('should return all achievements for a student', () => {
      service.awardProgress('s1', 'a1', 50);
      service.awardProgress('s1', 'a2', 30);
      expect(service.getStudentAchievements('s1')).toHaveLength(2);
    });
  });

  describe('getEarnedAchievements', () => {
    it('should return only earned achievements', () => {
      service.awardProgress('s1', 'a1', 100);
      service.awardProgress('s1', 'a2', 50);
      const earned = service.getEarnedAchievements('s1');
      expect(earned).toHaveLength(1);
      expect(earned[0].achievementId).toBe('a1');
    });
  });

  describe('getInProgressAchievements', () => {
    it('should return only in-progress achievements', () => {
      service.awardProgress('s1', 'a1', 100);
      service.awardProgress('s1', 'a2', 50);
      const inProgress = service.getInProgressAchievements('s1');
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].achievementId).toBe('a2');
    });
  });
});
