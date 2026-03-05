export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory =
  | 'mathematics'
  | 'science'
  | 'language'
  | 'arts'
  | 'technology';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  category: CourseCategory;
  maxStudents: number;
  currentStudents: number;
  isOpen: boolean;
  createdAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  durationMinutes: number;
}

export function createCourse(
  id: string,
  title: string,
  description: string,
  level: CourseLevel,
  category: CourseCategory,
  maxStudents: number,
): Course {
  if (!id || !title) {
    throw new Error('Course id and title are required');
  }
  if (maxStudents < 1) {
    throw new Error('Max students must be at least 1');
  }
  if (maxStudents > 500) {
    throw new Error('Max students cannot exceed 500');
  }
  return {
    id,
    title: title.trim(),
    description: description.trim(),
    level,
    category,
    maxStudents,
    currentStudents: 0,
    isOpen: true,
    createdAt: new Date(),
  };
}

export function closeCourse(course: Course): Course {
  if (!course.isOpen) {
    throw new Error('Course is already closed');
  }
  return { ...course, isOpen: false };
}

export function openCourse(course: Course): Course {
  if (course.isOpen) {
    throw new Error('Course is already open');
  }
  return { ...course, isOpen: true };
}

export function isCourseFull(course: Course): boolean {
  return course.currentStudents >= course.maxStudents;
}

export function addStudentToCourse(course: Course): Course {
  if (!course.isOpen) {
    throw new Error('Cannot add student to a closed course');
  }
  if (isCourseFull(course)) {
    throw new Error('Course is full');
  }
  return { ...course, currentStudents: course.currentStudents + 1 };
}

export function removeStudentFromCourse(course: Course): Course {
  if (course.currentStudents <= 0) {
    throw new Error('No students to remove');
  }
  return { ...course, currentStudents: course.currentStudents - 1 };
}

export function createLesson(
  id: string,
  courseId: string,
  title: string,
  content: string,
  order: number,
  durationMinutes: number,
): Lesson {
  if (!id || !courseId || !title) {
    throw new Error('Lesson id, courseId, and title are required');
  }
  if (order < 1) {
    throw new Error('Lesson order must be at least 1');
  }
  if (durationMinutes < 1) {
    throw new Error('Lesson duration must be at least 1 minute');
  }
  return {
    id,
    courseId,
    title: title.trim(),
    content: content.trim(),
    order,
    durationMinutes,
  };
}
