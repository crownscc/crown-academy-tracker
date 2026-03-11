import {
  capitalize,
  formatStudentName,
  formatGradeDisplay,
  formatTierDisplay,
  formatCourseLevelDisplay,
  formatPercentage,
  formatDuration,
  pluralize,
  formatDate,
  formatDateTime,
} from './formatting';

describe('Formatting Utils', () => {
  describe('capitalize', () => {
    it('should capitalize the first letter and lowercase the rest', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
    });

    it('should return empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('should handle already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });

  describe('formatStudentName', () => {
    it('should capitalize first and last name', () => {
      expect(formatStudentName('alice', 'johnson')).toBe('Alice Johnson');
    });

    it('should handle mixed case', () => {
      expect(formatStudentName('ALICE', 'JOHNSON')).toBe('Alice Johnson');
    });
  });

  describe('formatGradeDisplay', () => {
    it('should return grade with label', () => {
      expect(formatGradeDisplay('A')).toBe('A (Excellent)');
      expect(formatGradeDisplay('B')).toBe('B (Good)');
      expect(formatGradeDisplay('C')).toBe('C (Satisfactory)');
      expect(formatGradeDisplay('D')).toBe('D (Needs Improvement)');
      expect(formatGradeDisplay('F')).toBe('F (Failing)');
    });
  });

  describe('formatTierDisplay', () => {
    it('should return tier with emoji', () => {
      expect(formatTierDisplay('bronze')).toContain('Bronze');
      expect(formatTierDisplay('silver')).toContain('Silver');
      expect(formatTierDisplay('gold')).toContain('Gold');
      expect(formatTierDisplay('platinum')).toContain('Platinum');
    });
  });

  describe('formatCourseLevelDisplay', () => {
    it('should return level labels', () => {
      expect(formatCourseLevelDisplay('beginner')).toBe('Beginner Level');
      expect(formatCourseLevelDisplay('intermediate')).toBe('Intermediate Level');
      expect(formatCourseLevelDisplay('advanced')).toBe('Advanced Level');
    });
  });

  describe('formatPercentage', () => {
    it('should format integer percentages', () => {
      expect(formatPercentage(50)).toBe('50%');
      expect(formatPercentage(0)).toBe('0%');
      expect(formatPercentage(100)).toBe('100%');
    });

    it('should round decimal percentages to 2 places', () => {
      expect(formatPercentage(99.999)).toBe('100%');
      expect(formatPercentage(33.33)).toBe('33.33%');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes under 60', () => {
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(1)).toBe('1m');
    });

    it('should format exactly 60 minutes', () => {
      expect(formatDuration(60)).toBe('1h');
    });

    it('should format hours with remainder', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(125)).toBe('2h 5m');
    });

    it('should format exact hours over 60', () => {
      expect(formatDuration(120)).toBe('2h');
    });
  });

  describe('pluralize', () => {
    it('should return singular for count 1', () => {
      expect(pluralize(1, 'course')).toBe('1 course');
    });

    it('should return plural with default s for count != 1', () => {
      expect(pluralize(0, 'course')).toBe('0 courses');
      expect(pluralize(2, 'course')).toBe('2 courses');
      expect(pluralize(5, 'student')).toBe('5 students');
    });

    it('should use custom plural form when provided', () => {
      expect(pluralize(2, 'quiz', 'quizzes')).toBe('2 quizzes');
      expect(pluralize(0, 'category', 'categories')).toBe('0 categories');
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-06-15');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time with UTC label', () => {
      const date = new Date('2024-06-15T14:30:00.000Z');
      expect(formatDateTime(date)).toBe('2024-06-15 14:30:00 UTC');
    });
  });
});
