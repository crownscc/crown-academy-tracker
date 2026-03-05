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

    // NOTE: duplicate enrollment and full course scenarios are NOT tested
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

  // NOTE: unenroll, completeEnrollment, getCourseEnrollments,
  //       getActiveEnrollments, getCompletedEnrollments,
  //       getAverageGrade, isStudentEnrolled are NOT tested
});
