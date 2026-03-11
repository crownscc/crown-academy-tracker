import {
  createCourse,
  closeCourse,
  openCourse,
  isCourseFull,
  addStudentToCourse,
  removeStudentFromCourse,
  createLesson,
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

    it('should throw if maxStudents exceeds 500', () => {
      expect(() =>
        createCourse('c1', 'Title', 'Desc', 'beginner', 'science', 501),
      ).toThrow('Max students cannot exceed 500');
    });
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

    it('should throw if course is closed', () => {
      const course = makeCourse({ isOpen: false });
      expect(() => addStudentToCourse(course)).toThrow('Cannot add student to a closed course');
    });
  });

  describe('openCourse', () => {
    it('should open a closed course', () => {
      const course = makeCourse({ isOpen: false });
      const opened = openCourse(course);
      expect(opened.isOpen).toBe(true);
    });

    it('should throw if course is already open', () => {
      const course = makeCourse();
      expect(() => openCourse(course)).toThrow('Course is already open');
    });
  });

  describe('removeStudentFromCourse', () => {
    it('should decrement student count', () => {
      const course = makeCourse({ currentStudents: 5 });
      const updated = removeStudentFromCourse(course);
      expect(updated.currentStudents).toBe(4);
    });

    it('should throw if no students to remove', () => {
      const course = makeCourse({ currentStudents: 0 });
      expect(() => removeStudentFromCourse(course)).toThrow('No students to remove');
    });
  });

  describe('createLesson', () => {
    it('should create a lesson with valid inputs', () => {
      const lesson = createLesson('l1', 'c1', 'Intro', 'Content here', 1, 30);
      expect(lesson.id).toBe('l1');
      expect(lesson.courseId).toBe('c1');
      expect(lesson.title).toBe('Intro');
      expect(lesson.content).toBe('Content here');
      expect(lesson.order).toBe(1);
      expect(lesson.durationMinutes).toBe(30);
    });

    it('should throw if id, courseId, or title is missing', () => {
      expect(() => createLesson('', 'c1', 'T', 'C', 1, 30)).toThrow('Lesson id, courseId, and title are required');
      expect(() => createLesson('l1', '', 'T', 'C', 1, 30)).toThrow('Lesson id, courseId, and title are required');
      expect(() => createLesson('l1', 'c1', '', 'C', 1, 30)).toThrow('Lesson id, courseId, and title are required');
    });

    it('should throw if order is less than 1', () => {
      expect(() => createLesson('l1', 'c1', 'T', 'C', 0, 30)).toThrow('Lesson order must be at least 1');
    });

    it('should throw if duration is less than 1', () => {
      expect(() => createLesson('l1', 'c1', 'T', 'C', 1, 0)).toThrow('Lesson duration must be at least 1 minute');
    });

    it('should trim title and content', () => {
      const lesson = createLesson('l1', 'c1', '  Intro  ', '  Content  ', 1, 30);
      expect(lesson.title).toBe('Intro');
      expect(lesson.content).toBe('Content');
    });
  });
});
