import { EnrollmentService } from './enrollment.service';
import { Student } from '../models/student';
import { Course } from '../models/course';

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let student: Student;
  let course: Course;

  beforeEach(() => {
    service = new EnrollmentService();
    student = {
      id: 's1',
      name: 'Alice',
      email: 'alice@example.com',
      enrolledAt: new Date(),
      isActive: true,
    };
    course = {
      id: 'c1',
      title: 'Math 101',
      description: 'Intro',
      level: 'beginner',
      category: 'mathematics',
      maxStudents: 30,
      currentStudents: 0,
      isOpen: true,
      createdAt: new Date(),
    };
  });

  describe('enroll', () => {
    it('should enroll a student in a course', () => {
      const result = service.enroll(student, course);
      expect(result.enrollment.studentId).toBe('s1');
      expect(result.enrollment.courseId).toBe('c1');
      expect(result.updatedCourse.currentStudents).toBe(1);
    });

    it('should throw if student is inactive', () => {
      student.isActive = false;
      expect(() => service.enroll(student, course)).toThrow('Cannot enroll inactive student');
    });

    it('should throw if course is closed', () => {
      course.isOpen = false;
      expect(() => service.enroll(student, course)).toThrow('Cannot enroll in a closed course');
    });

    it('should throw for duplicate active enrollment', () => {
      service.enroll(student, course);
      expect(() => service.enroll(student, { ...course, currentStudents: 1 })).toThrow(
        'Student is already enrolled in this course',
      );
    });

    it('should throw if course is full', () => {
      course.currentStudents = 30;
      expect(() => service.enroll(student, course)).toThrow('Course is full');
    });

    it('should allow re-enrollment after completion without losing completed record', () => {
      const { updatedCourse } = service.enroll(student, course);
      service.completeEnrollment('s1', 'c1', 'A');
      // Re-enroll after completion
      service.enroll(student, { ...updatedCourse, currentStudents: 0 });
      // Should have both completed and active enrollments
      expect(service.getStudentEnrollments('s1')).toHaveLength(2);
      expect(service.getCompletedEnrollments('s1')).toHaveLength(1);
      expect(service.getActiveEnrollments('s1')).toHaveLength(1);
    });
  });

  describe('getStudentEnrollments', () => {
    it('should return enrollments for a student', () => {
      service.enroll(student, course);
      const enrollments = service.getStudentEnrollments('s1');
      expect(enrollments).toHaveLength(1);
    });

    it('should return empty array for unknown student', () => {
      expect(service.getStudentEnrollments('unknown')).toHaveLength(0);
    });
  });

  describe('unenroll', () => {
    it('should remove an active enrollment', () => {
      const { updatedCourse } = service.enroll(student, course);
      const result = service.unenroll('s1', 'c1', updatedCourse);
      expect(result.currentStudents).toBe(0);
      expect(service.getStudentEnrollments('s1')).toHaveLength(0);
    });

    it('should throw if enrollment not found', () => {
      expect(() => service.unenroll('s1', 'c1', course)).toThrow('Enrollment not found');
    });

    it('should throw if enrollment is completed', () => {
      const { updatedCourse } = service.enroll(student, course);
      service.completeEnrollment('s1', 'c1', 'A');
      expect(() => service.unenroll('s1', 'c1', updatedCourse)).toThrow('Enrollment not found');
    });
  });

  describe('completeEnrollment', () => {
    it('should complete an enrollment with a grade', () => {
      service.enroll(student, course);
      const completed = service.completeEnrollment('s1', 'c1', 'A');
      expect(completed.grade).toBe('A');
      expect(completed.completedAt).toBeInstanceOf(Date);
    });

    it('should throw if enrollment not found', () => {
      expect(() => service.completeEnrollment('s1', 'c1', 'A')).toThrow('Enrollment not found');
    });

    it('should throw if enrollment is already completed', () => {
      service.enroll(student, course);
      service.completeEnrollment('s1', 'c1', 'A');
      expect(() => service.completeEnrollment('s1', 'c1', 'B')).toThrow('Enrollment not found');
    });
  });

  describe('getCourseEnrollments', () => {
    it('should return enrollments for a course', () => {
      service.enroll(student, course);
      const student2: Student = { ...student, id: 's2', name: 'Bob', email: 'bob@example.com' };
      service.enroll(student2, { ...course, currentStudents: 1 });
      expect(service.getCourseEnrollments('c1')).toHaveLength(2);
    });

    it('should return empty array for unknown course', () => {
      expect(service.getCourseEnrollments('unknown')).toHaveLength(0);
    });
  });

  describe('getActiveEnrollments', () => {
    it('should return only active enrollments', () => {
      service.enroll(student, course);
      const course2: Course = { ...course, id: 'c2', title: 'Science' };
      service.enroll(student, course2);
      service.completeEnrollment('s1', 'c1', 'A');
      expect(service.getActiveEnrollments('s1')).toHaveLength(1);
      expect(service.getActiveEnrollments('s1')[0].courseId).toBe('c2');
    });
  });

  describe('getCompletedEnrollments', () => {
    it('should return only completed enrollments', () => {
      service.enroll(student, course);
      const course2: Course = { ...course, id: 'c2', title: 'Science' };
      service.enroll(student, course2);
      service.completeEnrollment('s1', 'c1', 'B');
      expect(service.getCompletedEnrollments('s1')).toHaveLength(1);
      expect(service.getCompletedEnrollments('s1')[0].courseId).toBe('c1');
    });
  });

  describe('getAverageGrade', () => {
    it('should return null if no completed courses', () => {
      expect(service.getAverageGrade('s1')).toBeNull();
    });

    it('should calculate GPA for a single completed course', () => {
      service.enroll(student, course);
      service.completeEnrollment('s1', 'c1', 'A');
      expect(service.getAverageGrade('s1')).toBe(4.0);
    });

    it('should calculate average GPA across multiple courses', () => {
      service.enroll(student, course);
      const course2: Course = { ...course, id: 'c2', title: 'Science' };
      service.enroll(student, course2);
      service.completeEnrollment('s1', 'c1', 'A'); // 4.0
      service.completeEnrollment('s1', 'c2', 'C'); // 2.0
      expect(service.getAverageGrade('s1')).toBe(3.0);
    });
  });

  describe('isStudentEnrolled', () => {
    it('should return true for an active enrollment', () => {
      service.enroll(student, course);
      expect(service.isStudentEnrolled('s1', 'c1')).toBe(true);
    });

    it('should return false for a completed enrollment', () => {
      service.enroll(student, course);
      service.completeEnrollment('s1', 'c1', 'A');
      expect(service.isStudentEnrolled('s1', 'c1')).toBe(false);
    });

    it('should return false for no enrollment', () => {
      expect(service.isStudentEnrolled('s1', 'c1')).toBe(false);
    });
  });
});
