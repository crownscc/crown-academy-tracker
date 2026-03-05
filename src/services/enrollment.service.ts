import { Student, Enrollment, Grade } from '../models/student';
import { Course, addStudentToCourse, removeStudentFromCourse, isCourseFull } from '../models/course';

export class EnrollmentService {
  private enrollments: Map<string, Enrollment> = new Map();

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

    const existingKey = this.getEnrollmentKey(student.id, course.id);
    const existing = this.enrollments.get(existingKey);
    if (existing && !existing.completedAt) {
      throw new Error('Student is already enrolled in this course');
    }

    const enrollment: Enrollment = {
      studentId: student.id,
      courseId: course.id,
      enrolledAt: new Date(),
    };

    this.enrollments.set(existingKey, enrollment);
    const updatedCourse = addStudentToCourse(course);

    return { enrollment, updatedCourse };
  }

  unenroll(studentId: string, courseId: string, course: Course): Course {
    const key = this.getEnrollmentKey(studentId, courseId);
    const enrollment = this.enrollments.get(key);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    if (enrollment.completedAt) {
      throw new Error('Cannot unenroll from a completed course');
    }

    this.enrollments.delete(key);
    return removeStudentFromCourse(course);
  }

  completeEnrollment(studentId: string, courseId: string, grade: Grade): Enrollment {
    const key = this.getEnrollmentKey(studentId, courseId);
    const enrollment = this.enrollments.get(key);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
    if (enrollment.completedAt) {
      throw new Error('Enrollment is already completed');
    }

    const completed: Enrollment = {
      ...enrollment,
      completedAt: new Date(),
      grade,
    };

    this.enrollments.set(key, completed);
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

    const gradeValues: Record<Grade, number> = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    };

    const total = completed.reduce((sum, e) => {
      return sum + (e.grade ? gradeValues[e.grade] : 0);
    }, 0);

    return total / completed.length;
  }

  isStudentEnrolled(studentId: string, courseId: string): boolean {
    const key = this.getEnrollmentKey(studentId, courseId);
    const enrollment = this.enrollments.get(key);
    return !!enrollment && !enrollment.completedAt;
  }

  private getEnrollmentKey(studentId: string, courseId: string): string {
    return `${studentId}:${courseId}`;
  }
}
