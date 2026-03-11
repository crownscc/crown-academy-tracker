# Code Audit Report — Crown Academy Tracker

---

## Executive Summary

This is a TypeScript domain-logic library (no HTTP layer, no frontend, no database) for tracking student progress, enrollments, achievements, and notifications in an academy context. The code compiles cleanly and all 36 existing tests pass. However, **test coverage is critically low at ~28%**, far below the configured 80% threshold. The most urgent issues are (1) a semantic bug in achievement progress initialization that incorrectly sets `earnedAt` before any progress is earned, (2) a data-loss bug where re-enrollment overwrites completed enrollment records, and (3) a broken sanitization function that produces corrupted output for legitimate input containing `&`.

---

## Phase 2 — Critical Issues (fix immediately)

### Bug: `earnedAt` set at creation time, not earn time

```
FILE: src/services/progress.service.ts
LINE(S): 48-53
SEVERITY: Critical
ISSUE: When a new StudentAchievement is created in awardProgress(), earnedAt is
       set to new Date() immediately — even though progress is 0. The earnedAt
       field should only be populated when the achievement is actually earned
       (progress >= 100). The updateProgress() function in achievement.ts:70
       does set earnedAt when clampedProgress >= 100, but the initial value is
       already a real Date, making it impossible to distinguish "earned" from
       "just created" by checking earnedAt alone.
FIX: Initialize earnedAt to a sentinel value (e.g., null, or use an optional
     field) and update the StudentAchievement interface to make earnedAt optional
     (earnedAt?: Date). Only set it when progress reaches 100.
```

### Bug: Re-enrollment overwrites completed enrollment record

```
FILE: src/services/enrollment.service.ts
LINE(S): 18-30
SEVERITY: Critical
ISSUE: getEnrollmentKey() returns `studentId:courseId`, and when a student who
       previously completed a course re-enrolls, the new enrollment is written
       to the same Map key (line 30), overwriting the completed enrollment
       record. This destroys the student's completion history and grade, which
       would corrupt GPA calculations and progress reports.
FIX: Either use a unique key per enrollment (e.g., include a timestamp or
     sequence number), or store enrollments in an array per student-course pair,
     or check that re-enrollment creates a new key rather than overwriting the
     completed one.
```

### Bug: `sanitizeString` produces double-encoded output

```
FILE: src/utils/validators.ts
LINE(S): 18-23
SEVERITY: High
ISSUE: The function strips < and > first, then encodes & as &amp;. This means
       legitimate input containing & (e.g., "Tom & Jerry") becomes "Tom &amp;
       Jerry" — which, if rendered in a context that also HTML-decodes, displays
       correctly, but if used in plain text or already-safe contexts, shows the
       literal "&amp;". More critically, the order of operations means any
       existing &amp; in input becomes &amp;amp; (double encoding). Also, the
       function doesn't handle quotes (" and ') which are XSS vectors in
       attribute contexts.
FIX: Either use a proper HTML entity encoding library, or at minimum encode &
     BEFORE stripping angle brackets, and also handle " and ' characters.
     Consider whether sanitization or escaping is the right approach for each
     usage context.
```

### Issue: Duplicated grade-to-GPA mapping

```
FILE: src/services/enrollment.service.ts LINE(S): 104-110
FILE: src/services/progress.service.ts LINE(S): 143-151
SEVERITY: High
ISSUE: The gradeValues Record<Grade, number> mapping is defined identically in
       two places. If one is updated without the other, GPA calculations will
       silently diverge between EnrollmentService and ProgressService.
FIX: Extract to a shared constant in models/student.ts or a dedicated
     constants file, and import it in both services.
```

### Issue: In-memory state with mutable arrays

```
FILE: src/services/notification.service.ts LINE(S): 57, 68
FILE: src/services/progress.service.ts LINE(S): 54, 61
SEVERITY: High
ISSUE: Both services store arrays in Maps and mutate the arrays in place (push,
       splice, index assignment). The notification service also spreads
       individual objects to avoid mutation (line 57: notifications[index] =
       { ...notifications[index], read: true }) but this is inconsistent — the
       array itself is still mutated. If any caller holds a reference to the
       returned array (e.g., from getAll()), it sees mutations made by later
       calls to send(), delete(), etc. This is a source of subtle bugs.
FIX: Either commit fully to mutation (document it, make it intentional) or
     commit fully to immutability (return copies of arrays from getters,
     replace arrays in the Map rather than mutating them). Pick one strategy
     and apply it consistently.
```

---

## Phase 2 — Code Quality Issues

### Medium Severity

```
FILE: src/services/progress.service.ts
LINE(S): 58
SEVERITY: Medium
ISSUE: awardProgress() uses existing.progress + progress to accumulate, but
       the progress parameter name is misleading — it's an increment, not an
       absolute value. If a caller passes 75 intending "set progress to 75%",
       the actual progress becomes current + 75.
FIX: Rename the parameter to progressIncrement, or add a separate
     setProgress() method for absolute values.
```

```
FILE: src/utils/validators.ts
LINE(S): 47-50
SEVERITY: Medium
ISSUE: generateId() uses Math.random() which is not cryptographically secure
       and does not guarantee uniqueness. In a concurrent environment or with
       rapid successive calls, collisions are theoretically possible.
FIX: Use crypto.randomUUID() (available in Node 19+) or import uuid. If
     this is a library that needs to support older Node, document the
     uniqueness limitations.
```

```
FILE: src/utils/formatting.ts
LINE(S): 44-46
SEVERITY: Medium
ISSUE: formatPercentage() takes a raw number and appends %. It's ambiguous
       whether the input should be 0-1 (ratio) or 0-100 (percentage).
       formatPercentage(0.5) returns "0.5%" which is likely wrong if the
       caller means 50%. No documentation clarifies this.
FIX: Either name it formatAsPercentage and document that it expects 0-100,
     or have it multiply by 100 if it expects a ratio. Add a JSDoc comment.
```

```
FILE: src/models/achievement.ts
LINE(S): 46-48
SEVERITY: Medium
ISSUE: getTierMultiplier() has a default case that returns 1, but
       AchievementTier is a union type covering all cases. The default case is
       dead code and masks potential type errors if a new tier is added —
       TypeScript's exhaustiveness checking would normally catch the missing
       case, but the default swallows it.
FIX: Remove the default case, or use a never-typed exhaustiveness check:
     default: const _exhaustive: never = tier; return _exhaustive;
```

```
FILE: src/services/enrollment.service.ts
LINE(S): 7-33
SEVERITY: Medium
ISSUE: enroll() checks isCourseFull(course) and also course.isOpen, but
       addStudentToCourse() on line 31 checks these same conditions again
       internally. This is redundant validation — the checks in enroll() will
       always pass before addStudentToCourse() is called, so the inner checks
       are dead code in this path. More concerning: if someone calls
       addStudentToCourse() directly without going through enroll(), they
       bypass the duplicate-enrollment check.
FIX: Either remove the redundant checks from enroll() and rely on
     addStudentToCourse(), or remove the checks from addStudentToCourse() and
     make it a "dumb" increment. Document which layer owns the validation.
```

```
FILE: src/models/student.ts
LINE(S): 40-41
SEVERITY: Medium
ISSUE: isValidEmail() uses a simple regex that accepts many invalid emails
       (e.g., "a@b.c", "user@.com") and rejects some valid ones (e.g., emails
       with + in the local part — actually the regex does allow +, but it
       doesn't enforce TLD length or catch other edge cases).
FIX: For production use, consider a more robust validation approach or
     document that this is intentionally permissive. At minimum, this is fine
     for a basic check, but note the limitations.
```

### Low Severity

```
FILE: src/services/notification.service.ts
LINE(S): 15
SEVERITY: Low
ISSUE: idCounter is an instance property that resets when the service is
       re-instantiated. In tests this is fine, but if multiple
       NotificationService instances exist, they produce conflicting IDs
       (notif-1 from instance A collides with notif-1 from instance B).
FIX: Use generateId() from validators.ts instead, or use a static counter,
     or inject an ID generator.
```

```
FILE: src/utils/formatting.ts
LINE(S): 61-63
SEVERITY: Low
ISSUE: formatDate() and formatDateTime() use toISOString() which always
       outputs in UTC. If the Date was created in a local timezone, the
       formatted output may show a different date than the user expects. This
       is a common source of off-by-one-day bugs (e.g., 11:00 PM EST Jan 5 →
       4:00 AM UTC Jan 6 → "2024-01-06").
FIX: Document that output is always UTC, or accept a timezone parameter, or
     use toLocaleDateString() with an explicit locale for display purposes.
```

```
FILE: src/utils/formatting.ts
LINE(S): 56-58
SEVERITY: Low
ISSUE: pluralize() defaults to appending 's' for plural, which is wrong for
       many English words (e.g., "quiz" → "quizs" instead of "quizzes",
       "category" → "categorys" instead of "categories").
FIX: Always require the plural form explicitly to avoid silent
       pluralization bugs, or document that the caller must provide the
       plural param for irregular words.
```

```
FILE: src/models/course.ts
LINE(S): 95-119
SEVERITY: Low
ISSUE: createLesson() accepts content as a required string but doesn't
       validate its length. A lesson with empty content (" " after trim → "")
       would be created silently.
FIX: Add a check for content being non-empty after trim, similar to title.
```

```
FILE: package.json
LINE(S): N/A
SEVERITY: Low
ISSUE: No "engines" field specifying required Node.js version. The code
       targets ES2020 which requires Node 14+, but this isn't enforced.
FIX: Add "engines": { "node": ">=14" } to package.json.
```

---

## Phase 3 — UI/UX Audit

**Not applicable.** This project is a pure TypeScript domain-logic library with no frontend, no HTTP layer, no UI components, and no web or mobile interfaces. There are no screens, components, or user-facing elements to audit.

---

## Phase 4 — Architecture & Structure

### Folder structure

The structure (models/, services/, utils/) is simple, clean, and appropriate for the current codebase size. It follows a layered architecture pattern. However, there is no barrel file (index.ts) exporting the public API, which means consumers would need to import from deep paths.

### Separation of concerns

Generally good. Models are pure functions/interfaces, services hold business logic with state, utilities are stateless. One violation: the grade-to-GPA mapping is duplicated across EnrollmentService and ProgressService rather than living in a shared location.

### No public API surface

There is no index.ts or entry point defined. The `main` field in package.json points to `dist/index.js` but that file doesn't exist. Anyone depending on this package would get an import error.

### No error handling strategy

All errors are thrown as plain `Error` with string messages. There are no custom error classes, no error codes, and no consistent error structure. This makes it impossible for consumers to programmatically distinguish between error types (e.g., "not found" vs "validation error" vs "already exists").

### No environment configuration

There are no environment variables, no .env files, no config files beyond tsconfig.json and jest.config.js. This is acceptable for a pure library, but if this is intended to be part of a larger SaaS app (as the description "full-stack SaaS" implies), the hosting, database, and API layers are entirely missing.

### Test coverage is critically low

- **27.72% statements** (threshold: 80%)
- **26.72% branches** (threshold: 80%)
- **22.61% functions** (threshold: 80%)
- **30.13% lines** (threshold: 80%)

Three files have **zero test coverage**: progress.service.ts, notification.service.ts, formatting.ts. The existing tests are well-structured but only cover happy paths and 1-2 error cases per function.

### Missing integration tests

No tests verify cross-service workflows (e.g., enroll → complete → award achievement → generate leaderboard). All tests are isolated unit tests.

### No linting or formatting configuration

No ESLint, Prettier, or any code style enforcement tool is configured. This will lead to style drift as the codebase grows.

---

## Recommended Priority Order

1. **Fix the `earnedAt` initialization bug** — Corrupts achievement tracking semantics; every new achievement falsely appears "earned"
2. **Fix the re-enrollment overwrite bug** — Destroys completed enrollment history, corrupts GPA calculations
3. **Fix `sanitizeString` encoding order** — Produces corrupted output; XSS-adjacent issue
4. **Extract shared grade-to-GPA constant** — Prevents silent divergence between services
5. **Add tests for ProgressService** — 0% coverage on the most critical business logic (163 lines)
6. **Add tests for NotificationService** — 0% coverage on all user-facing communication logic
7. **Add tests for formatting.ts** — 0% coverage on display logic
8. **Complete EnrollmentService tests** — Currently at 36%, missing unenroll/complete/GPA
9. **Fill remaining test gaps in models and validators** — Get all files above 80%
10. **Add barrel exports (index.ts) and fix package.json main entry** — Package is currently broken for consumers

---

## Phase 6 — Implementation Plan

### Guiding Principles

1. **Fix data corruption bugs before all else** — Bugs that silently produce wrong data are worse than missing features.
2. **Never break existing passing tests while refactoring** — Run the test suite after every change.
3. **One concern per commit** — Keep changes atomic so they can be reviewed and reverted independently.
4. **Tests before refactoring** — Add tests for current behavior before changing it, so you know if the refactor breaks something.
5. **Shared code over duplicated code** — Extract constants and utilities before they diverge further.

---

### MILESTONE 1: Fix Critical Bugs

**Goal:** Eliminate the three data-corruption and security bugs.
**Estimated effort:** M

**Tasks:**

1. **Fix `earnedAt` initialization (progress.service.ts:48-53):**
   - Update `StudentAchievement` interface in `models/achievement.ts` to make `earnedAt` optional (`earnedAt?: Date`)
   - In `progress.service.ts:48-53`, remove `earnedAt: new Date()` from the initial object (or set it to `undefined`)
   - Verify `updateProgress()` in `achievement.ts:70` correctly sets `earnedAt` only when `clampedProgress >= 100`
   - Update any code that reads `earnedAt` to handle the undefined case

2. **Fix re-enrollment overwrite (enrollment.service.ts:18-30):**
   - Change the enrollment storage strategy: use an array per student-course pair, or append a sequence number to the key
   - Simplest fix: change `getEnrollmentKey` to include a unique suffix, and add a `findActiveEnrollment()` helper method
   - Update `isStudentEnrolled()`, `unenroll()`, `completeEnrollment()` to work with the new storage
   - Ensure `getAverageGrade()` correctly aggregates across all completed enrollments for a student

3. **Fix `sanitizeString` (validators.ts:18-23):**
   - Reorder: encode `&` as `&amp;` FIRST, then strip or encode `<` and `>`
   - Also encode `"` as `&quot;` and `'` as `&#x27;` for attribute context safety
   - Or: replace the entire function with a well-tested encoding approach

**Definition of Done:**
- All three bugs are fixed
- All existing 36 tests still pass
- No new TypeScript compilation errors

---

### MILESTONE 2: Extract Shared Constants & Fix Code Quality Issues

**Goal:** Eliminate duplicated logic and fix medium-severity code quality issues.
**Estimated effort:** S

**Tasks:**

1. **Extract grade-to-GPA mapping:**
   - Create a `GRADE_VALUES` constant in `models/student.ts`: `export const GRADE_VALUES: Record<Grade, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };`
   - Import and use it in `enrollment.service.ts:104` and `progress.service.ts:144`
   - Remove the inline definitions from both services

2. **Remove dead default case in `getTierMultiplier` (achievement.ts:46-48):**
   - Replace with exhaustiveness check using `never` type

3. **Rename `progress` parameter in `awardProgress` (progress.service.ts:38):**
   - Rename to `progressIncrement` for clarity

4. **Fix `createLesson` content validation (course.ts:95-119):**
   - Add check: `if (!content || content.trim().length === 0) throw new Error('Lesson content is required')`

5. **Add `engines` field to package.json:**
   - Add `"engines": { "node": ">=14" }`

**Definition of Done:**
- Zero duplicated grade-to-GPA definitions
- All existing tests still pass
- TypeScript compiles cleanly

---

### MILESTONE 3: Achieve 80% Test Coverage — Services

**Goal:** Add comprehensive tests for the three untested/undertested services.
**Estimated effort:** L

**Tasks:**

1. **Create `src/services/progress.service.test.ts`:**
   - Test `registerAchievement()` — registers and can be retrieved
   - Test `awardProgress()` — new achievement creation, incremental progress, reaching 100%
   - Test `awardProgress()` errors — unknown achievement ID
   - Test `getStudentPoints()` — only earned achievements count, handles empty
   - Test `determineTier()` — boundary values: 0, 199, 200, 499, 500, 999, 1000
   - Test `generateProgressReport()` — correct aggregation of all fields
   - Test `generateLeaderboard()` — sorting, tie handling, single student, empty input
   - Test `calculateGradePoints()` — all five grade values
   - Test `getStudentAchievements()`, `getEarnedAchievements()`, `getInProgressAchievements()`

2. **Create `src/services/notification.service.test.ts`:**
   - Test `send()` — creates notification, returns correct structure, increments ID
   - Test `send()` errors — missing recipientId, missing title, missing message
   - Test `markAsRead()` — marks unread as read, returns updated notification
   - Test `markAsRead()` errors — no notifications for recipient, notification not found, already read
   - Test `markAllAsRead()` — marks all, returns count, handles already-read, handles no notifications
   - Test `getUnread()` — filters correctly, returns empty array for unknown recipient
   - Test `getByType()` — filters by type correctly
   - Test `delete()` — removes notification, returns true; returns false for nonexistent
   - Test `clearAll()` — returns count, empties storage; returns 0 for unknown
   - Test `getUnreadCount()` — reflects current unread state

3. **Complete `src/services/enrollment.service.test.ts`:**
   - Test `enroll()` — duplicate active enrollment error, course full error
   - Test `unenroll()` — happy path, enrollment not found, already completed
   - Test `completeEnrollment()` — happy path with grade, not found, already completed
   - Test `getCourseEnrollments()` — returns correct enrollments
   - Test `getActiveEnrollments()` — filters out completed
   - Test `getCompletedEnrollments()` — filters out active
   - Test `getAverageGrade()` — no completed courses (null), single grade, mixed grades
   - Test `isStudentEnrolled()` — active enrollment, completed enrollment, no enrollment

**Definition of Done:**
- All three service files have >80% line/branch/function coverage individually
- All tests pass

---

### MILESTONE 4: Achieve 80% Test Coverage — Models & Utils

**Goal:** Fill remaining test gaps to meet the 80% global threshold.
**Estimated effort:** M

**Tasks:**

1. **Extend `src/models/student.test.ts`:**
   - Test `updateStudentName()` — valid name, empty name, whitespace-only name
   - Test `updateStudentEmail()` — valid email, invalid email format

2. **Extend `src/models/course.test.ts`:**
   - Test `createCourse()` — maxStudents > 500
   - Test `openCourse()` — opens closed course, throws if already open
   - Test `removeStudentFromCourse()` — decrements count, throws if count is 0
   - Test `createLesson()` — happy path, missing id/courseId/title, order < 1, duration < 1
   - Test `addStudentToCourse()` — throws if course is closed

3. **Extend `src/models/achievement.test.ts`:**
   - Test `createAchievement()` — negative pointsRequired
   - Test `isAchievementEarned()` — progress 99 (false), 100 (true), 101 (true)
   - Test `updateProgress()` — normal increase, negative value error, clamping above 100, earnedAt set correctly

4. **Create `src/utils/formatting.test.ts`:**
   - Test `capitalize()` — empty string, single char, normal string, already capitalized
   - Test `formatStudentName()` — normal names, mixed case
   - Test `formatGradeDisplay()` — all five grades
   - Test `formatTierDisplay()` — all four tiers
   - Test `formatCourseLevelDisplay()` — all three levels
   - Test `formatPercentage()` — integer, decimal, 0, 100
   - Test `formatDuration()` — under 60, exactly 60, over 60 with remainder, over 60 with no remainder
   - Test `pluralize()` — count 0, 1, 2, with custom plural, without custom plural
   - Test `formatDate()` — known date
   - Test `formatDateTime()` — known date

5. **Extend `src/utils/validators.test.ts`:**
   - Test `truncate()` — shorter than max, equal to max, longer than max
   - Test `parseDate()` — valid ISO string, invalid string
   - Test `isValidPercentage()` — -1, 0, 50, 100, 101, NaN, Infinity
   - Test `formatGPA()` — valid values (0, 2.5, 4.0), invalid (-1, 5, NaN)
   - Test `generateId()` — has correct prefix, contains timestamp segment

**Definition of Done:**
- `npx jest --coverage` passes with all thresholds met (80% statements, branches, functions, lines)
- All tests pass

---

### MILESTONE 5: Add Public API Surface & Developer Experience

**Goal:** Make the package usable as a dependency and set up code quality tooling.
**Estimated effort:** S

**Tasks:**

1. **Create `src/index.ts` barrel file:**
   - Export all public types, interfaces, functions, and classes
   - Organize exports by domain (models, services, utils)

2. **Add ESLint configuration:**
   - Install `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`
   - Create `.eslintrc.json` with recommended rules
   - Add `"lint"` script to package.json

3. **Add Prettier configuration:**
   - Install prettier
   - Create `.prettierrc` with consistent style settings
   - Add `"format"` script to package.json

4. **Add custom error classes:**
   - Create `src/errors.ts` with `NotFoundError`, `ValidationError`, `DuplicateError`, `AlreadyCompletedError`
   - Migrate service error throws to use typed errors (this is a larger effort — can be deferred to a follow-up milestone if needed)

**Definition of Done:**
- `import { EnrollmentService, ProgressService, ... } from 'crown-academy-tracker'` works
- `npm run lint` runs without errors
- `npm run format` formats all files consistently

---

### Suggested Milestone Order

1. **Milestone 1 (Critical Bugs)** — Data corruption bugs must be fixed first; all other work depends on correct behavior.
2. **Milestone 4 (Model & Util Tests)** — Add tests for current behavior of models/utils before Milestone 2 changes them, so refactoring is safe.
3. **Milestone 2 (Code Quality)** — Now safe to refactor because tests cover the affected code.
4. **Milestone 3 (Service Tests)** — Services depend on models, so test models first. Service tests are the biggest block of work.
5. **Milestone 5 (API Surface & Tooling)** — Polish; depends on everything else being stable.

---

### Quick Wins (< 30 minutes each)

1. **Add `engines` field to package.json** — 2 minutes
2. **Remove dead `default` case in `getTierMultiplier()`** — 5 minutes
3. **Rename `progress` → `progressIncrement` in `awardProgress()`** — 5 minutes
4. **Add content validation to `createLesson()`** — 5 minutes
5. **Extract `GRADE_VALUES` constant** — 10 minutes
6. **Add missing `createCourse()` maxStudents > 500 test** — 5 minutes
7. **Add missing `addStudentToCourse()` closed-course test** — 5 minutes

---

### Risk Flags

| Change | Risk | Mitigation |
|--------|------|------------|
| Fix `earnedAt` initialization | Any code reading `earnedAt` will break if it doesn't handle `undefined`. May affect downstream consumers. | Search all usages of `earnedAt` before changing. Add null checks. Run full test suite. |
| Fix re-enrollment storage | Changes the internal data structure of EnrollmentService. Could break any code that depends on Map key format. | This is internal (private), so external impact is limited. Write tests for re-enrollment scenarios before and after the fix. |
| Fix `sanitizeString` | Any code relying on the current (buggy) output format will break. | Search for all callers of `sanitizeString`. Update tests to expect correct output. |
| Add custom error classes (Milestone 5) | Any consumer catching errors by message string will break. | Can be done as a non-breaking addition if old string messages are preserved in the error's `message` property. |
