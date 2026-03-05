export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: Date;
  isActive: boolean;
}

export interface Enrollment {
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  grade?: Grade;
}

export function createStudent(
  id: string,
  name: string,
  email: string,
): Student {
  if (!id || !name || !email) {
    throw new Error('Student id, name, and email are required');
  }
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  return {
    id,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    enrolledAt: new Date(),
    isActive: true,
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function deactivateStudent(student: Student): Student {
  if (!student.isActive) {
    throw new Error('Student is already inactive');
  }
  return { ...student, isActive: false };
}

export function updateStudentName(student: Student, newName: string): Student {
  if (!newName || newName.trim().length === 0) {
    throw new Error('Name cannot be empty');
  }
  return { ...student, name: newName.trim() };
}

export function updateStudentEmail(
  student: Student,
  newEmail: string,
): Student {
  if (!isValidEmail(newEmail)) {
    throw new Error('Invalid email format');
  }
  return { ...student, email: newEmail.toLowerCase().trim() };
}
