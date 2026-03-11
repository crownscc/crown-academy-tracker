import { Student, Enrollment, Grade } from '../models/student';
import { Course, addStudentToCourse, removeStudentFromCourse, isCourseFull } from '../models/course';
import { GRADE_VALUES } from '../constants';

export class EnrollmentService {
  private enrollments: Map<string, Enrollment> = new Map();
  private enrollmentCounter = 0;

  enroll(student: Student, course: Course): { enrollment: Enrollment; updatedCourse: Course } {
    if (!student.isActive) {
      throw new Error('Cannot enroll inactive student');
    }
    if (!course.isOpen) {
      throw new Error('Cannot enroll in a closed course');
    }
    if (isCourseFull(course)) {
      throw new Error('Course is full');
    }

    const activeEnrollment = this.findActiveEnrollment(student.id, course.id);
    if (activeEnrollment) {
      throw new Error('Student is already enrolled in this course');
    }

    const enrollment: Enrollment = {
      studentId: student.id,
      courseId: course.id,
      enrolledAt: new Date(),
    };

    const key = `${student.id}:${course.id}:${++this.enrollmentCounter}`;
    this.enrollments.set(key, enrollment);
    const updatedCourse = addStudentToCourse(course);

    return { enrollment, updatedCourse };
  }

  unenroll(studentId: string, courseId: string, course: Course): Course {
    const entry = this.findActiveEnrollmentEntry(studentId, courseId);

    if (!entry) {
      throw new Error('Enrollment not found');
    }
    if (entry.enrollment.completedAt) {
      throw new Error('Cannot unenroll from a completed course');
    }

    this.enrollments.delete(entry.key);
    return removeStudentFromCourse(course);
  }

  completeEnrollment(studentId: string, courseId: string, grade: Grade): Enrollment {
    const entry = this.findActiveEnrollmentEntry(studentId, courseId);

    if (!entry) {
      throw new Error('Enrollment not found');
    }
    if (entry.enrollment.completedAt) {
      throw new Error('Enrollment is already completed');
    }

    const completed: Enrollment = {
      ...entry.enrollment,
      completedAt: new Date(),
      grade,
    };

    this.enrollments.set(entry.key, completed);
    return completed;
  }

  getStudentEnrollments(studentId: string): Enrollment[] {
    const results: Enrollment[] = [];
    for (const enrollment of this.enrollments.values()) {
      if (enrollment.studentId === studentId) {
        results.push(enrollment);
      }
    }
    return results;
  }

  getCourseEnrollments(courseId: string): Enrollment[] {
    const results: Enrollment[] = [];
    for (const enrollment of this.enrollments.values()) {
      if (enrollment.courseId === courseId) {
        results.push(enrollment);
      }
    }
    return results;
  }

  getActiveEnrollments(studentId: string): Enrollment[] {
    return this.getStudentEnrollments(studentId).filter((e) => !e.completedAt);
  }

  getCompletedEnrollments(studentId: string): Enrollment[] {
    return this.getStudentEnrollments(studentId).filter((e) => e.completedAt);
  }

  getAverageGrade(studentId: string): number | null {
    const completed = this.getCompletedEnrollments(studentId);
    if (completed.length === 0) return null;

    const total = completed.reduce((sum, e) => {
      return sum + (e.grade ? GRADE_VALUES[e.grade] : 0);
    }, 0);

    return total / completed.length;
  }

  isStudentEnrolled(studentId: string, courseId: string): boolean {
    return !!this.findActiveEnrollment(studentId, courseId);
  }

  private findActiveEnrollment(studentId: string, courseId: string): Enrollment | undefined {
    for (const enrollment of this.enrollments.values()) {
      if (enrollment.studentId === studentId && enrollment.courseId === courseId && !enrollment.completedAt) {
        return enrollment;
      }
    }
    return undefined;
  }

  private findActiveEnrollmentEntry(studentId: string, courseId: string): { key: string; enrollment: Enrollment } | undefined {
    for (const [key, enrollment] of this.enrollments.entries()) {
      if (enrollment.studentId === studentId && enrollment.courseId === courseId && !enrollment.completedAt) {
        return { key, enrollment };
      }
    }
    return undefined;
  }
}
