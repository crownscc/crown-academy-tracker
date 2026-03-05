import {
  createCourse,
  closeCourse,
  isCourseFull,
  addStudentToCourse,
  Course,
} from './course';

describe('Course Model', () => {
  const makeCourse = (overrides: Partial<Course> = {}): Course => ({
    id: 'c1',
    title: 'Test Course',
    description: 'A test',
    level: 'beginner',
    category: 'mathematics',
    maxStudents: 30,
    currentStudents: 0,
    isOpen: true,
    createdAt: new Date(),
    ...overrides,
  });

  describe('createCourse', () => {
    it('should create a course with valid inputs', () => {
      const course = createCourse('c1', 'Math 101', 'Intro to math', 'beginner', 'mathematics', 30);
      expect(course.id).toBe('c1');
      expect(course.title).toBe('Math 101');
      expect(course.isOpen).toBe(true);
      expect(course.currentStudents).toBe(0);
    });

    it('should throw if id or title is empty', () => {
      expect(() =>
        createCourse('', 'Title', 'Desc', 'beginner', 'science', 30),
      ).toThrow('Course id and title are required');
    });

    it('should throw if maxStudents is less than 1', () => {
      expect(() =>
        createCourse('c1', 'Title', 'Desc', 'beginner', 'science', 0),
      ).toThrow('Max students must be at least 1');
    });

    // NOTE: maxStudents > 500 case is NOT tested
  });

  describe('closeCourse', () => {
    it('should close an open course', () => {
      const course = makeCourse();
      const closed = closeCourse(course);
      expect(closed.isOpen).toBe(false);
    });

    it('should throw if course is already closed', () => {
      const course = makeCourse({ isOpen: false });
      expect(() => closeCourse(course)).toThrow('Course is already closed');
    });
  });

  describe('isCourseFull', () => {
    it('should return true when current equals max', () => {
      const course = makeCourse({ currentStudents: 30, maxStudents: 30 });
      expect(isCourseFull(course)).toBe(true);
    });

    it('should return false when under capacity', () => {
      const course = makeCourse({ currentStudents: 10, maxStudents: 30 });
      expect(isCourseFull(course)).toBe(false);
    });
  });

  describe('addStudentToCourse', () => {
    it('should increment student count', () => {
      const course = makeCourse();
      const updated = addStudentToCourse(course);
      expect(updated.currentStudents).toBe(1);
    });

    it('should throw if course is full', () => {
      const course = makeCourse({ currentStudents: 30, maxStudents: 30 });
      expect(() => addStudentToCourse(course)).toThrow('Course is full');
    });

    // NOTE: addStudentToCourse when course is closed is NOT tested
  });

  // NOTE: openCourse, removeStudentFromCourse, createLesson are NOT tested
});
