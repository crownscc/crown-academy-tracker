import express from 'express';
import cors from 'cors';
import path from 'path';
import { createStudent, Student } from './models/student';
import { createCourse, Course, CourseLevel, CourseCategory } from './models/course';
import { createAchievement, Achievement, AchievementTier } from './models/achievement';
import { EnrollmentService } from './services/enrollment.service';
import { ProgressService } from './services/progress.service';
import { NotificationService } from './services/notification.service';
import { generateId } from './utils/validators';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// In-memory stores
const students = new Map<string, Student>();
const courses = new Map<string, Course>();
const achievements = new Map<string, Achievement>();
const enrollmentService = new EnrollmentService();
const progressService = new ProgressService();
const notificationService = new NotificationService();

// Seed demo data
function seedData() {
  const demoStudents = [
    createStudent(generateId('stu'), 'Alice Johnson', 'alice@crown.academy'),
    createStudent(generateId('stu'), 'Bob Martinez', 'bob@crown.academy'),
    createStudent(generateId('stu'), 'Clara Chen', 'clara@crown.academy'),
    createStudent(generateId('stu'), 'David Kim', 'david@crown.academy'),
    createStudent(generateId('stu'), 'Eva Williams', 'eva@crown.academy'),
  ];
  demoStudents.forEach((s) => students.set(s.id, s));

  const demoCourses = [
    createCourse(generateId('crs'), 'Algebra Fundamentals', 'Master the basics of algebraic expressions and equations', 'beginner', 'mathematics', 30),
    createCourse(generateId('crs'), 'Introduction to Physics', 'Explore mechanics, thermodynamics, and waves', 'beginner', 'science', 25),
    createCourse(generateId('crs'), 'Creative Writing', 'Develop your storytelling and composition skills', 'intermediate', 'language', 20),
    createCourse(generateId('crs'), 'Digital Art & Design', 'Learn digital illustration and graphic design', 'beginner', 'arts', 15),
    createCourse(generateId('crs'), 'Python Programming', 'Build applications with Python from scratch', 'beginner', 'technology', 35),
    createCourse(generateId('crs'), 'Advanced Calculus', 'Dive deep into differential and integral calculus', 'advanced', 'mathematics', 20),
    createCourse(generateId('crs'), 'Web Development', 'Full-stack web development with modern frameworks', 'intermediate', 'technology', 30),
  ];
  demoCourses.forEach((c) => courses.set(c.id, c));

  const demoAchievements = [
    createAchievement(generateId('ach'), 'First Steps', 'Complete your first course', 'bronze', 50, ''),
    createAchievement(generateId('ach'), 'Honor Roll', 'Achieve a GPA of 3.5 or higher', 'silver', 100, ''),
    createAchievement(generateId('ach'), 'Course Champion', 'Complete 5 courses', 'gold', 200, ''),
    createAchievement(generateId('ach'), 'Academy Legend', 'Earn 1000 total points', 'platinum', 500, ''),
    createAchievement(generateId('ach'), 'Science Star', 'Complete 3 science courses', 'silver', 150, ''),
    createAchievement(generateId('ach'), 'Tech Wizard', 'Complete all technology courses', 'gold', 250, ''),
  ];
  demoAchievements.forEach((a) => {
    achievements.set(a.id, a);
    progressService.registerAchievement(a);
  });

  // Enroll some students and simulate progress
  const studentArr = Array.from(students.values());
  const courseArr = Array.from(courses.values());

  // Alice: enrolled in 3 courses, completed 2
  const e1 = enrollmentService.enroll(studentArr[0], courseArr[0]);
  courses.set(courseArr[0].id, e1.updatedCourse);
  enrollmentService.completeEnrollment(studentArr[0].id, courseArr[0].id, 'A');
  const e2 = enrollmentService.enroll(studentArr[0], courseArr[4]);
  courses.set(courseArr[4].id, e2.updatedCourse);
  enrollmentService.completeEnrollment(studentArr[0].id, courseArr[4].id, 'A');
  const e3 = enrollmentService.enroll(studentArr[0], courseArr[5]);
  courses.set(courseArr[5].id, e3.updatedCourse);

  // Bob: enrolled in 2 courses, completed 1
  const e4 = enrollmentService.enroll(studentArr[1], courseArr[1]);
  courses.set(courseArr[1].id, e4.updatedCourse);
  enrollmentService.completeEnrollment(studentArr[1].id, courseArr[1].id, 'B');
  const e5 = enrollmentService.enroll(studentArr[1], courseArr[2]);
  courses.set(courseArr[2].id, e5.updatedCourse);

  // Clara: enrolled in 2, completed both
  const e6 = enrollmentService.enroll(studentArr[2], courseArr[4]);
  courses.set(courseArr[4].id, e6.updatedCourse);
  enrollmentService.completeEnrollment(studentArr[2].id, courseArr[4].id, 'A');
  const e7 = enrollmentService.enroll(studentArr[2], courseArr[6]);
  courses.set(courseArr[6].id, e7.updatedCourse);
  enrollmentService.completeEnrollment(studentArr[2].id, courseArr[6].id, 'B');

  // Award achievements
  const achArr = Array.from(achievements.values());
  progressService.awardProgress(studentArr[0].id, achArr[0].id, 100); // First Steps
  progressService.awardProgress(studentArr[0].id, achArr[1].id, 100); // Honor Roll
  progressService.awardProgress(studentArr[0].id, achArr[2].id, 40);  // Course Champion in progress
  progressService.awardProgress(studentArr[2].id, achArr[0].id, 100); // First Steps
  progressService.awardProgress(studentArr[2].id, achArr[5].id, 50);  // Tech Wizard in progress
  progressService.awardProgress(studentArr[1].id, achArr[0].id, 100); // First Steps

  // Send some notifications
  notificationService.send(studentArr[0].id, 'achievement', 'Achievement Unlocked!', 'You earned "First Steps" - congratulations!');
  notificationService.send(studentArr[0].id, 'achievement', 'Achievement Unlocked!', 'You earned "Honor Roll" - outstanding work!');
  notificationService.send(studentArr[0].id, 'enrollment', 'New Enrollment', 'You have been enrolled in Advanced Calculus');
  notificationService.send(studentArr[1].id, 'completion', 'Course Completed', 'Congratulations on completing Introduction to Physics!');
  notificationService.send(studentArr[2].id, 'achievement', 'Achievement Unlocked!', 'You earned "First Steps"!');
}

seedData();

// --- API Routes ---

// Students
app.get('/api/students', (_req, res) => {
  res.json(Array.from(students.values()));
});

app.get('/api/students/:id', (req, res) => {
  const student = students.get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.post('/api/students', (req, res) => {
  try {
    const { name, email } = req.body;
    const student = createStudent(generateId('stu'), name, email);
    students.set(student.id, student);
    res.status(201).json(student);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Courses
app.get('/api/courses', (_req, res) => {
  res.json(Array.from(courses.values()));
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

app.post('/api/courses', (req, res) => {
  try {
    const { title, description, level, category, maxStudents } = req.body;
    const course = createCourse(generateId('crs'), title, description, level, category, maxStudents);
    courses.set(course.id, course);
    res.status(201).json(course);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Enrollments
app.post('/api/enrollments', (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    const student = students.get(studentId);
    const course = courses.get(courseId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const result = enrollmentService.enroll(student, course);
    courses.set(courseId, result.updatedCourse);
    notificationService.send(studentId, 'enrollment', 'New Enrollment', `You have been enrolled in ${course.title}`);
    res.status(201).json(result.enrollment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/enrollments/student/:studentId', (req, res) => {
  const enrollments = enrollmentService.getStudentEnrollments(req.params.studentId);
  res.json(enrollments);
});

// Achievements
app.get('/api/achievements', (_req, res) => {
  res.json(Array.from(achievements.values()));
});

app.get('/api/achievements/student/:studentId', (req, res) => {
  const studentAchievements = progressService.getStudentAchievements(req.params.studentId);
  res.json(studentAchievements);
});

// Progress & Leaderboard
app.get('/api/progress/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const enrollments = enrollmentService.getStudentEnrollments(studentId);
  const gpa = enrollmentService.getAverageGrade(studentId);
  const report = progressService.generateProgressReport(studentId, enrollments, gpa);
  res.json(report);
});

app.get('/api/leaderboard', (_req, res) => {
  const studentData = Array.from(students.values()).map((s) => ({ id: s.id, name: s.name }));
  const leaderboard = progressService.generateLeaderboard(studentData);
  res.json(leaderboard);
});

// Notifications
app.get('/api/notifications/:recipientId', (req, res) => {
  const notifications = notificationService.getAll(req.params.recipientId);
  res.json(notifications);
});

app.get('/api/notifications/:recipientId/unread', (req, res) => {
  const count = notificationService.getUnreadCount(req.params.recipientId);
  res.json({ count });
});

// Dashboard stats
app.get('/api/stats', (_req, res) => {
  const studentData = Array.from(students.values()).map((s) => ({ id: s.id, name: s.name }));
  const leaderboard = progressService.generateLeaderboard(studentData);

  res.json({
    totalStudents: students.size,
    totalCourses: courses.size,
    totalAchievements: achievements.size,
    topPerformers: leaderboard.slice(0, 5),
    coursesByCategory: getCoursesByCategory(),
    recentActivity: getRecentActivity(),
  });
});

function getCoursesByCategory() {
  const categories: Record<string, number> = {};
  for (const course of courses.values()) {
    categories[course.category] = (categories[course.category] || 0) + 1;
  }
  return categories;
}

function getRecentActivity() {
  const allStudents = Array.from(students.values());
  const activities: Array<{ type: string; description: string; time: string }> = [];

  for (const student of allStudents) {
    const enrollments = enrollmentService.getStudentEnrollments(student.id);
    for (const e of enrollments) {
      if (e.completedAt) {
        const course = courses.get(e.courseId);
        activities.push({
          type: 'completion',
          description: `${student.name} completed ${course?.title || 'a course'} with grade ${e.grade}`,
          time: e.completedAt.toISOString(),
        });
      }
    }
  }

  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
}

// SPA fallback
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Crown Academy Tracker running at http://localhost:${PORT}`);
});

export default app;
