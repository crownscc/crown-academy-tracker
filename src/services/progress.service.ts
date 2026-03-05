import {
  Achievement,
  StudentAchievement,
  AchievementTier,
  calculateAchievementScore,
  isAchievementEarned,
  updateProgress,
} from '../models/achievement';
import { Enrollment, Grade } from '../models/student';

export interface ProgressReport {
  studentId: string;
  totalPoints: number;
  completedCourses: number;
  activeCourses: number;
  achievementsEarned: number;
  achievementsInProgress: number;
  tier: AchievementTier;
  gpa: number | null;
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  totalPoints: number;
  tier: AchievementTier;
  rank: number;
}

export class ProgressService {
  private studentAchievements: Map<string, StudentAchievement[]> = new Map();
  private achievements: Map<string, Achievement> = new Map();

  registerAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
  }

  awardProgress(studentId: string, achievementId: string, progress: number): StudentAchievement {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const studentAchievements = this.studentAchievements.get(studentId) || [];
    let existing = studentAchievements.find((sa) => sa.achievementId === achievementId);

    if (!existing) {
      existing = {
        studentId,
        achievementId,
        earnedAt: new Date(),
        progress: 0,
      };
      studentAchievements.push(existing);
      this.studentAchievements.set(studentId, studentAchievements);
    }

    const updated = updateProgress(existing, existing.progress + progress);

    const index = studentAchievements.findIndex((sa) => sa.achievementId === achievementId);
    studentAchievements[index] = updated;

    return updated;
  }

  getStudentPoints(studentId: string): number {
    const studentAchievements = this.studentAchievements.get(studentId) || [];
    let totalPoints = 0;

    for (const sa of studentAchievements) {
      if (isAchievementEarned(sa)) {
        const achievement = this.achievements.get(sa.achievementId);
        if (achievement) {
          totalPoints += calculateAchievementScore(achievement);
        }
      }
    }

    return totalPoints;
  }

  determineTier(points: number): AchievementTier {
    if (points >= 1000) return 'platinum';
    if (points >= 500) return 'gold';
    if (points >= 200) return 'silver';
    return 'bronze';
  }

  generateProgressReport(
    studentId: string,
    enrollments: Enrollment[],
    gpa: number | null,
  ): ProgressReport {
    const studentAchievements = this.studentAchievements.get(studentId) || [];
    const totalPoints = this.getStudentPoints(studentId);

    const completedCourses = enrollments.filter((e) => e.completedAt).length;
    const activeCourses = enrollments.filter((e) => !e.completedAt).length;
    const achievementsEarned = studentAchievements.filter(isAchievementEarned).length;
    const achievementsInProgress = studentAchievements.filter(
      (sa) => !isAchievementEarned(sa),
    ).length;

    return {
      studentId,
      totalPoints,
      completedCourses,
      activeCourses,
      achievementsEarned,
      achievementsInProgress,
      tier: this.determineTier(totalPoints),
      gpa,
    };
  }

  generateLeaderboard(
    studentData: Array<{ id: string; name: string }>,
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = studentData.map((s) => {
      const points = this.getStudentPoints(s.id);
      return {
        studentId: s.id,
        studentName: s.name,
        totalPoints: points,
        tier: this.determineTier(points),
        rank: 0,
      };
    });

    entries.sort((a, b) => b.totalPoints - a.totalPoints);

    let currentRank = 1;
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].totalPoints < entries[i - 1].totalPoints) {
        currentRank = i + 1;
      }
      entries[i].rank = currentRank;
    }

    return entries;
  }

  calculateGradePoints(grade: Grade): number {
    const gradeValues: Record<Grade, number> = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    };
    return gradeValues[grade];
  }

  getStudentAchievements(studentId: string): StudentAchievement[] {
    return this.studentAchievements.get(studentId) || [];
  }

  getEarnedAchievements(studentId: string): StudentAchievement[] {
    return this.getStudentAchievements(studentId).filter(isAchievementEarned);
  }

  getInProgressAchievements(studentId: string): StudentAchievement[] {
    return this.getStudentAchievements(studentId).filter((sa) => !isAchievementEarned(sa));
  }
}
