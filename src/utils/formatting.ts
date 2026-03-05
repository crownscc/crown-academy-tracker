import { Grade } from '../models/student';
import { AchievementTier } from '../models/achievement';
import { CourseLevel } from '../models/course';

export function formatStudentName(firstName: string, lastName: string): string {
  return `${capitalize(firstName)} ${capitalize(lastName)}`;
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatGradeDisplay(grade: Grade): string {
  const gradeLabels: Record<Grade, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Satisfactory',
    D: 'Needs Improvement',
    F: 'Failing',
  };
  return `${grade} (${gradeLabels[grade]})`;
}

export function formatTierDisplay(tier: AchievementTier): string {
  const tierEmoji: Record<AchievementTier, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };
  return `${tierEmoji[tier]} ${capitalize(tier)}`;
}

export function formatCourseLevelDisplay(level: CourseLevel): string {
  const levelLabels: Record<CourseLevel, string> = {
    beginner: 'Beginner Level',
    intermediate: 'Intermediate Level',
    advanced: 'Advanced Level',
  };
  return levelLabels[level];
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `1 ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}
