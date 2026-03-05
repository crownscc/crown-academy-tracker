import { createStudent, isValidEmail, deactivateStudent } from './student';

describe('Student Model', () => {
  describe('createStudent', () => {
    it('should create a student with valid inputs', () => {
      const student = createStudent('s1', 'Alice Johnson', 'alice@example.com');
      expect(student.id).toBe('s1');
      expect(student.name).toBe('Alice Johnson');
      expect(student.email).toBe('alice@example.com');
      expect(student.isActive).toBe(true);
    });

    it('should trim name and lowercase email', () => {
      const student = createStudent('s2', '  Bob  ', 'BOB@Example.COM');
      expect(student.name).toBe('Bob');
      expect(student.email).toBe('bob@example.com');
    });

    it('should throw if id is empty', () => {
      expect(() => createStudent('', 'Alice', 'alice@example.com')).toThrow(
        'Student id, name, and email are required',
      );
    });

    it('should throw for invalid email', () => {
      expect(() => createStudent('s1', 'Alice', 'not-an-email')).toThrow(
        'Invalid email format',
      );
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('first.last@domain.org')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@missing.com')).toBe(false);
    });
  });

  describe('deactivateStudent', () => {
    it('should deactivate an active student', () => {
      const student = createStudent('s1', 'Alice', 'alice@example.com');
      const deactivated = deactivateStudent(student);
      expect(deactivated.isActive).toBe(false);
    });

    it('should throw if student is already inactive', () => {
      const student = createStudent('s1', 'Alice', 'alice@example.com');
      const deactivated = deactivateStudent(student);
      expect(() => deactivateStudent(deactivated)).toThrow('Student is already inactive');
    });
  });

  // NOTE: updateStudentName and updateStudentEmail are NOT tested
});
