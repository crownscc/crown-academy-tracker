import {
  isNonEmptyString,
  isPositiveNumber,
  isValidId,
  isInRange,
  sanitizeString,
  truncate,
  parseDate,
  isValidPercentage,
  formatGPA,
  generateId,
} from './validators';

describe('Validators', () => {
  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
    });

    it('should return false for empty or whitespace strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(5)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
    });

    it('should return false for zero, negative, or non-numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber('5')).toBe(false);
    });
  });

  describe('isValidId', () => {
    it('should return true for valid IDs', () => {
      expect(isValidId('abc-123')).toBe(true);
      expect(isValidId('user_42')).toBe(true);
    });

    it('should return false for invalid IDs', () => {
      expect(isValidId('')).toBe(false);
      expect(isValidId('has spaces')).toBe(false);
      expect(isValidId(123)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should return true for values in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    it('should return false for values out of range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should encode angle brackets, ampersands, and quotes', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      );
      expect(sanitizeString('a & b')).toBe('a &amp; b');
      expect(sanitizeString("it's")).toBe('it&#x27;s');
    });

    it('should not double-encode existing entities', () => {
      expect(sanitizeString('&amp;')).toBe('&amp;amp;');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });
  });

  describe('truncate', () => {
    it('should return string as-is if shorter than max', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should return string as-is if equal to max', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });

    it('should truncate and add ellipsis if longer than max', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });
  });

  describe('parseDate', () => {
    it('should parse a valid ISO date string', () => {
      const result = parseDate('2024-01-15T00:00:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result!.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('should return null for invalid date string', () => {
      expect(parseDate('not-a-date')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseDate('')).toBeNull();
    });
  });

  describe('isValidPercentage', () => {
    it('should return true for valid percentages', () => {
      expect(isValidPercentage(0)).toBe(true);
      expect(isValidPercentage(50)).toBe(true);
      expect(isValidPercentage(100)).toBe(true);
    });

    it('should return false for out-of-range values', () => {
      expect(isValidPercentage(-1)).toBe(false);
      expect(isValidPercentage(101)).toBe(false);
    });

    it('should return false for non-finite values', () => {
      expect(isValidPercentage(NaN)).toBe(false);
      expect(isValidPercentage(Infinity)).toBe(false);
    });
  });

  describe('formatGPA', () => {
    it('should format valid GPA values', () => {
      expect(formatGPA(0)).toBe('0.00');
      expect(formatGPA(2.5)).toBe('2.50');
      expect(formatGPA(4)).toBe('4.00');
    });

    it('should throw for out-of-range GPA', () => {
      expect(() => formatGPA(-1)).toThrow('GPA must be between 0 and 4');
      expect(() => formatGPA(5)).toThrow('GPA must be between 0 and 4');
    });

    it('should throw for non-finite GPA', () => {
      expect(() => formatGPA(NaN)).toThrow('GPA must be between 0 and 4');
    });
  });

  describe('generateId', () => {
    it('should generate an ID with the given prefix', () => {
      const id = generateId('user');
      expect(id).toMatch(/^user_/);
    });

    it('should contain timestamp and random segments', () => {
      const id = generateId('test');
      const parts = id.split('_');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('test');
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 10 }, () => generateId('x')));
      expect(ids.size).toBe(10);
    });
  });
});
