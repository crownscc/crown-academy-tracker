// Models
export type {
  Student,
  Enrollment,
  Grade,
} from './models/student';

export {
  createStudent,
  isValidEmail,
  deactivateStudent,
  updateStudentName,
  updateStudentEmail,
} from './models/student';

export type {
  Course,
  Lesson,
  CourseLevel,
  CourseCategory,
} from './models/course';

export {
  createCourse,
  closeCourse,
  openCourse,
  isCourseFull,
  addStudentToCourse,
  removeStudentFromCourse,
  createLesson,
} from './models/course';

export type {
  Achievement,
  StudentAchievement,
  AchievementTier,
} from './models/achievement';

export {
  createAchievement,
  getTierMultiplier,
  calculateAchievementScore,
  isAchievementEarned,
  updateProgress,
} from './models/achievement';

// Constants
export { GRADE_VALUES } from './constants';

// Services
export { EnrollmentService } from './services/enrollment.service';
export { ProgressService } from './services/progress.service';
export type { ProgressReport, LeaderboardEntry } from './services/progress.service';
export { NotificationService } from './services/notification.service';
export type { Notification, NotificationType } from './services/notification.service';

// Utils
export {
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
} from './utils/validators';

export {
  capitalize,
  formatStudentName,
  formatGradeDisplay,
  formatTierDisplay,
  formatCourseLevelDisplay,
  formatPercentage,
  formatDuration,
  pluralize,
  formatDate,
  formatDateTime,
} from './utils/formatting';
