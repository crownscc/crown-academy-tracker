// Models
export {
  Student,
  Enrollment,
  Grade,
  createStudent,
  isValidEmail,
  deactivateStudent,
  updateStudentName,
  updateStudentEmail,
} from './models/student';

export {
  Course,
  Lesson,
  CourseLevel,
  CourseCategory,
  createCourse,
  closeCourse,
  openCourse,
  isCourseFull,
  addStudentToCourse,
  removeStudentFromCourse,
  createLesson,
} from './models/course';

export {
  Achievement,
  StudentAchievement,
  AchievementTier,
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
export { ProgressService, ProgressReport, LeaderboardEntry } from './services/progress.service';
export { NotificationService, Notification, NotificationType } from './services/notification.service';

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
