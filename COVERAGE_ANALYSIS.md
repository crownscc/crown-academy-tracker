# Test Coverage Analysis — Crown Academy Tracker

## Current Coverage Summary

| Metric     | Covered | Total | Percentage |
|------------|---------|-------|------------|
| Statements | 89      | 321   | **27.72%** |
| Branches   | 31      | 116   | **26.72%** |
| Functions  | 19      | 84    | **22.61%** |
| Lines      | 88      | 292   | **30.13%** |

**Status:** Well below the 80% threshold configured in `jest.config.js`.

---

## Per-File Breakdown

| File                          | Stmts | Branch | Funcs | Lines | Status       |
|-------------------------------|-------|--------|-------|-------|--------------|
| `models/student.ts`           | 71%   | 60%    | 60%   | 71%   | Partial      |
| `models/course.ts`            | 58%   | 38%    | 57%   | 58%   | Partial      |
| `models/achievement.ts`       | 68%   | 58%    | 60%   | 68%   | Partial      |
| `services/enrollment.service.ts` | 36% | 24%   | 29%   | 38%   | Low          |
| `services/progress.service.ts`   | 0%  | 0%     | 0%    | 0%    | **No tests** |
| `services/notification.service.ts`| 0% | 0%     | 0%    | 0%    | **No tests** |
| `utils/validators.ts`         | 55%   | 47%    | 50%   | 57%   | Partial      |
| `utils/formatting.ts`         | 0%    | 0%     | 0%    | 0%    | **No tests** |

---

## Priority 1: Files with Zero Test Coverage

These files have **no tests at all** and represent the biggest risk:

### 1. `services/progress.service.ts` (163 lines, 0% coverage)

This is the most critical gap. The `ProgressService` contains core business logic:

- **`awardProgress()`** — Awards achievement progress to students. Involves map lookups, conditional creation, and incremental updates. Bugs here could silently corrupt student progress data.
- **`getStudentPoints()`** — Calculates total points by iterating earned achievements. An error would cascade into incorrect tier assignments and leaderboard rankings.
- **`determineTier()`** — Maps point thresholds to tier levels. Boundary conditions (e.g., exactly 200, 500, 1000 points) are untested.
- **`generateProgressReport()`** — Aggregates data from multiple sources into a report. This is a high-level function that combines enrollment data, achievements, and GPA.
- **`generateLeaderboard()`** — Sorts and ranks students with tie-handling logic. The ranking algorithm (where tied scores share a rank) is untested.

**Recommended tests:**
- Unit tests for `determineTier()` with exact boundary values (199, 200, 499, 500, 999, 1000)
- Integration-style tests for `awardProgress()` covering new achievement creation, incremental progress, and progress completion (reaching 100%)
- Tests for `generateLeaderboard()` with ties, single student, and empty input
- Tests for `generateProgressReport()` verifying correct aggregation

### 2. `services/notification.service.ts` (110 lines, 0% coverage)

The notification service handles all user-facing communications:

- **`send()`** — Creates and stores notifications. Validation of required fields is untested.
- **`markAsRead()` / `markAllAsRead()`** — State mutations with error handling for missing notifications and duplicate reads.
- **`getUnread()` / `getByType()`** — Filtering logic that could silently return wrong results.
- **`delete()` / `clearAll()`** — Destructive operations that modify stored data.

**Recommended tests:**
- Full CRUD cycle: send, read, mark-as-read, delete
- Error paths: missing recipient, double mark-as-read, delete nonexistent
- Filtering: `getByType()` with multiple notification types, `getUnread()` after marking some as read
- `clearAll()` returning correct count and emptying storage

### 3. `utils/formatting.ts` (66 lines, 0% coverage)

Contains display formatting logic used across the UI:

- **`formatDuration()`** — Converts minutes to human-readable strings. Edge cases like exactly 60 minutes, 0 remainder, etc.
- **`pluralize()`** — Handles singular/plural with optional custom plural form.
- **`formatDate()` / `formatDateTime()`** — Date formatting that could break across timezones.
- **`capitalize()`** — Edge case with empty strings.

**Recommended tests:**
- `formatDuration()`: values under 60, exactly 60, over 60, with and without remainder
- `pluralize()`: count=0, count=1, count=2, with/without custom plural
- `formatGradeDisplay()` for each grade value
- `capitalize()` with empty string, single char, already capitalized

---

## Priority 2: Files with Partial Coverage (Major Gaps)

### 4. `services/enrollment.service.ts` (36% statements, 29% functions)

**Untested functions:**
- **`unenroll()`** (lines 37-48) — Unenrollment flow including error handling for missing/completed enrollments
- **`completeEnrollment()`** (lines 50-65) — Grade assignment upon course completion, including already-completed check
- **`getCourseEnrollments()`** (line 83) — Query by course ID
- **`getActiveEnrollments()` / `getCompletedEnrollments()`** — Filtered views of enrollment data
- **`getAverageGrade()`** (lines 95-110) — GPA calculation with edge cases (no completed courses → null, mix of grades)
- **`isStudentEnrolled()`** — Active enrollment check

**Untested branches in `enroll()`:**
- Enrolling in a full course
- Duplicate active enrollment

**Recommended tests:**
- Full enrollment lifecycle: enroll → complete with grade → verify GPA
- Unenroll happy path + error cases (not found, already completed)
- `getAverageGrade()` with various grade mixes and empty case
- `isStudentEnrolled()` for active, completed, and nonexistent enrollments

### 5. `models/course.ts` (58% statements, 38% branches)

**Untested functions:**
- **`openCourse()`** — Reopening a closed course, including already-open error
- **`removeStudentFromCourse()`** — Decrementing student count, including zero-students error
- **`createLesson()`** (lines 103-112) — Full lesson creation with all validation (order < 1, duration < 1)

**Untested branches:**
- `createCourse()` with `maxStudents > 500`
- `addStudentToCourse()` when course is closed

**Recommended tests:**
- `openCourse()` on a closed course + error when already open
- `removeStudentFromCourse()` normal case + error when count is 0
- `createLesson()` happy path + all validation errors

### 6. `models/student.ts` (71% statements, 60% branches)

**Untested functions:**
- **`updateStudentName()`** (lines 52-55) — Name update with empty-name validation
- **`updateStudentEmail()`** (lines 62-65) — Email update with format validation

**Recommended tests:**
- `updateStudentName()` with valid name, empty name, whitespace-only name
- `updateStudentEmail()` with valid email, invalid email

### 7. `models/achievement.ts` (68% statements, 58% branches)

**Untested functions:**
- **`isAchievementEarned()`** (line 47) — Checks if progress >= 100
- **`updateProgress()`** (lines 56-67) — Progress update with clamping and automatic `earnedAt` timestamp

**Untested branches:**
- `createAchievement()` with negative `pointsRequired`

**Recommended tests:**
- `isAchievementEarned()` at boundaries: progress=99, 100, 101
- `updateProgress()` with normal increase, negative value error, clamping above 100
- `createAchievement()` with negative points

### 8. `utils/validators.ts` (55% statements, 47% branches)

**Untested functions:**
- **`truncate()`** — String truncation with ellipsis
- **`parseDate()`** — Date parsing with invalid input returning null
- **`isValidPercentage()`** — Range check 0-100
- **`formatGPA()`** — GPA formatting with out-of-range error
- **`generateId()`** — ID generation with prefix

**Recommended tests:**
- `truncate()` with string shorter than max, equal to max, longer than max
- `parseDate()` with valid ISO string, invalid string, edge cases
- `isValidPercentage()` at boundaries: -1, 0, 50, 100, 101, NaN, Infinity
- `formatGPA()` with valid values (0, 2.5, 4.0) and invalid values (-1, 5)
- `generateId()` verifying prefix format and uniqueness

---

## Priority 3: Structural & Architectural Test Gaps

### Missing Test Categories

1. **Integration tests** — No tests verify that services work together correctly (e.g., enrolling a student → completing a course → awarding an achievement → updating leaderboard).

2. **Edge case coverage in existing tests** — Many existing tests only cover the happy path and one error case. Boundary values, null/undefined inputs, and concurrent-like scenarios are absent.

3. **Error message verification** — Tests that check `toThrow()` should verify the specific error message string to catch regressions in error handling.

---

## Recommended Action Plan

| Priority | Action | Expected Impact |
|----------|--------|-----------------|
| P0 | Add tests for `ProgressService` | +~20% overall coverage; protects core business logic |
| P0 | Add tests for `NotificationService` | +~13% overall coverage; protects user-facing features |
| P1 | Add tests for `formatting.ts` | +~8% overall coverage |
| P1 | Complete `EnrollmentService` tests (unenroll, complete, GPA) | +~10% overall coverage |
| P2 | Fill gaps in model tests (course, student, achievement) | +~8% overall coverage |
| P2 | Fill gaps in `validators.ts` tests | +~5% overall coverage |
| P3 | Add integration tests for cross-service workflows | Catches interaction bugs |

Completing P0 and P1 items should bring overall coverage above the 80% threshold.
