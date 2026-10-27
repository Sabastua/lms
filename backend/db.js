const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");
const { hashPassword } = require("./middleware/auth");
const { SEED_COURSES } = require("./data/coursesData");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "lms.sqlite");
const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for concurrency & speed
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");

/**
 * Initialize Relational Schema for OpenLearn LMS
 */
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'learner' CHECK(role IN ('learner', 'instructor')),
      bio TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'Beginner',
      institution TEXT NOT NULL DEFAULT 'Open University & OER',
      instructor_id TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL,
      lesson_type TEXT NOT NULL CHECK(lesson_type IN ('wikipedia', 'gutenberg', 'country', 'video', 'quiz', 'custom')),
      source_ref TEXT NOT NULL,
      content_body TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      enrolled_at TEXT NOT NULL,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT,
      category_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      attempted_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      title TEXT NOT NULL,
      source_ref TEXT NOT NULL,
      metadata_json TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      institution TEXT NOT NULL,
      course_title TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      verification_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lecture_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      timestamp_seconds INTEGER DEFAULT 0,
      timestamp_label TEXT DEFAULT '00:00',
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_discussions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec("ALTER TABLE courses ADD COLUMN institution TEXT DEFAULT 'Open University & OER';");
  } catch (err) {
    // Column already exists
  }
}

/**
 * Seed default Instructor & Learner accounts and initial OER courses
 */
function seedInitialData() {
  const now = new Date().toISOString();
  const instructorId = "usr-instructor-1";
  const learnerId = "usr-learner-1";

  // Ensure default Instructor exists
  const existingInstructor = db.prepare("SELECT id FROM users WHERE id = ?").get(instructorId);
  if (!existingInstructor) {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, bio, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      instructorId,
      "Dr. Sarah Chen (Instructor)",
      "instructor@openlearn.org",
      hashPassword("password123"),
      "instructor",
      "Curriculum Designer & Open Education Researcher",
      now
    );
  }

  // Ensure default Learner exists
  const existingLearner = db.prepare("SELECT id FROM users WHERE id = ?").get(learnerId);
  if (!existingLearner) {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, bio, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      learnerId,
      "Alex Rivera (Learner)",
      "learner@openlearn.org",
      hashPassword("password123"),
      "learner",
      "Computer Science & Humanities Student",
      now
    );
  }

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, category, description, difficulty, institution, instructor_id, published, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    ON CONFLICT(id) DO UPDATE SET
      institution = excluded.institution,
      title = excluded.title,
      category = excluded.category,
      description = excluded.description,
      difficulty = excluded.difficulty
  `);

  const insertLesson = db.prepare(`
    INSERT OR IGNORE INTO lessons (id, course_id, position, title, lesson_type, source_ref, content_body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of SEED_COURSES) {
    insertCourse.run(
      c.id,
      c.title,
      c.category,
      c.description,
      c.difficulty || "Beginner",
      c.institution || "Open University & OER",
      instructorId,
      now
    );
    for (const l of c.lessons) {
      insertLesson.run(l.id, c.id, l.position, l.title, l.lessonType, l.sourceRef, l.contentBody || "", now);
    }
  }

  // Auto-enroll the demo learner in the first three courses if not enrolled
  const insertEnrollment = db.prepare(`
    INSERT OR IGNORE INTO enrollments (id, user_id, course_id, enrolled_at)
    VALUES (?, ?, ?, ?)
  `);
  insertEnrollment.run("enr-demo-1", learnerId, "course-cs-foundations", now);
  insertEnrollment.run("enr-demo-2", learnerId, "course-astrophysics", now);
  insertEnrollment.run("enr-demo-3", learnerId, "course-calculus-analysis", now);
}

initSchema();
seedInitialData();

// ============================================================================
// Data Access Helper Methods
// ============================================================================
function createId(prefix = "id") {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function findUserByEmail(email) {
  const row = db
    .prepare("SELECT id, name, email, password_hash as passwordHash, role, bio, created_at as createdAt FROM users WHERE lower(email) = lower(?)")
    .get(email);
  return row || null;
}

function findUserById(id) {
  const row = db
    .prepare("SELECT id, name, email, role, bio, created_at as createdAt FROM users WHERE id = ?")
    .get(id);
  return row || null;
}

function createUser({ name, email, passwordHash, role = "learner", bio = "" }) {
  const id = createId("usr");
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, bio, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, email.toLowerCase().trim(), passwordHash, role, bio, createdAt);
  return findUserById(id);
}

function updateUserProfile(userId, { name, bio }) {
  db.prepare(`
    UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio) WHERE id = ?
  `).run(name || null, bio !== undefined ? bio : null, userId);
  return findUserById(userId);
}

function getSchemaStats() {
  const usersCount = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const coursesCount = db.prepare("SELECT COUNT(*) as c FROM courses").get().c;
  const lessonsCount = db.prepare("SELECT COUNT(*) as c FROM lessons").get().c;
  const enrollmentsCount = db.prepare("SELECT COUNT(*) as c FROM enrollments").get().c;
  return { usersCount, coursesCount, lessonsCount, enrollmentsCount, dbPath: DB_PATH };
}

// ============================================================================
// Phase 2: Courses, Lessons, Enrollments & Progress Operations
// ============================================================================
function listCourses(userId = null) {
  const courses = db.prepare(`
    SELECT
      c.id,
      c.title,
      c.category,
      c.description,
      c.difficulty,
      COALESCE(c.institution, 'Open University & OER') as institution,
      c.instructor_id as instructorId,
      u.name as instructorName,
      c.published,
      c.created_at as createdAt,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as totalLessons,
      (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as totalStudents
    FROM courses c
    LEFT JOIN users u ON u.id = c.instructor_id
    WHERE c.published = 1
    ORDER BY c.created_at DESC
  `).all();

  if (!userId) {
    return courses.map((c) => ({
      ...c,
      isEnrolled: false,
      completedLessons: 0,
      progressPercent: 0
    }));
  }

  const enrolledStmt = db.prepare("SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?");
  const completedStmt = db.prepare("SELECT COUNT(*) as cnt FROM lesson_progress WHERE user_id = ? AND course_id = ?");

  return courses.map((c) => {
    const isEnrolled = Boolean(enrolledStmt.get(userId, c.id));
    const completedLessons = completedStmt.get(userId, c.id)?.cnt || 0;
    const progressPercent = c.totalLessons > 0 ? Math.round((completedLessons / c.totalLessons) * 100) : 0;
    return {
      ...c,
      isEnrolled,
      completedLessons,
      progressPercent
    };
  });
}

function getCourseById(courseId, userId = null) {
  const course = db.prepare(`
    SELECT
      c.id,
      c.title,
      c.category,
      c.description,
      c.difficulty,
      COALESCE(c.institution, 'Open University & OER') as institution,
      c.instructor_id as instructorId,
      u.name as instructorName,
      c.published,
      c.created_at as createdAt
    FROM courses c
    LEFT JOIN users u ON u.id = c.instructor_id
    WHERE c.id = ?
  `).get(courseId);

  if (!course) return null;

  const lessons = db.prepare(`
    SELECT
      id,
      course_id as courseId,
      position,
      title,
      lesson_type as lessonType,
      source_ref as sourceRef,
      content_body as contentBody,
      created_at as createdAt
    FROM lessons
    WHERE course_id = ?
    ORDER BY position ASC, created_at ASC
  `).all(courseId);

  let isEnrolled = false;
  const completedSet = new Set();

  if (userId) {
    const enr = db.prepare("SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?").get(userId, courseId);
    isEnrolled = Boolean(enr);
    const progRows = db
      .prepare("SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ?")
      .all(userId, courseId);
    for (const r of progRows) completedSet.add(r.lesson_id);
  }

  const enrichedLessons = lessons.map((l) => ({
    ...l,
    completed: completedSet.has(l.id)
  }));

  const totalLessons = enrichedLessons.length;
  const completedLessons = completedSet.size;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    ...course,
    isEnrolled,
    totalLessons,
    completedLessons,
    progressPercent,
    lessons: enrichedLessons
  };
}

function createCourse({ title, category, description, difficulty = "Beginner", institution = "Open University & OER", instructorId, lessons = [] }) {
  const courseId = createId("course");
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO courses (id, title, category, description, difficulty, institution, instructor_id, published, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(courseId, title, category, description, difficulty, institution, instructorId, now);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (id, course_id, position, title, lesson_type, source_ref, content_body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  lessons.forEach((l, idx) => {
    const lessonId = createId("lesson");
    insertLesson.run(
      lessonId,
      courseId,
      l.position || idx + 1,
      l.title,
      l.lessonType || l.lesson_type || "wikipedia",
      String(l.sourceRef || l.source_ref || ""),
      l.contentBody || l.content_body || "",
      now
    );
  });

  return getCourseById(courseId, instructorId);
}

function addLessonToCourse(courseId, { title, lessonType = "wikipedia", sourceRef, contentBody = "" }) {
  const maxPosRow = db.prepare("SELECT COALESCE(MAX(position), 0) as maxPos FROM lessons WHERE course_id = ?").get(courseId);
  const nextPosition = (maxPosRow?.maxPos || 0) + 1;
  const lessonId = createId("lesson");
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO lessons (id, course_id, position, title, lesson_type, source_ref, content_body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(lessonId, courseId, nextPosition, title, lessonType, String(sourceRef), contentBody, now);

  return db.prepare(`
    SELECT id, course_id as courseId, position, title, lesson_type as lessonType, source_ref as sourceRef, content_body as contentBody, created_at as createdAt
    FROM lessons WHERE id = ?
  `).get(lessonId);
}

function deleteCourse(courseId) {
  const res = db.prepare("DELETE FROM courses WHERE id = ?").run(courseId);
  return res.changes > 0;
}

function enrollUser(userId, courseId) {
  const existing = db.prepare("SELECT id, enrolled_at as enrolledAt FROM enrollments WHERE user_id = ? AND course_id = ?").get(userId, courseId);
  if (existing) return existing;

  const id = createId("enr");
  const now = new Date().toISOString();
  db.prepare("INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES (?, ?, ?, ?)").run(id, userId, courseId, now);
  return { id, userId, courseId, enrolledAt: now };
}

function toggleLessonComplete(userId, lessonId) {
  const lesson = db.prepare("SELECT id, course_id as courseId, title FROM lessons WHERE id = ?").get(lessonId);
  if (!lesson) return null;

  // Ensure learner is enrolled in the course automatically
  enrollUser(userId, lesson.courseId);

  const existing = db
    .prepare("SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?")
    .get(userId, lessonId);

  let completed = false;
  if (existing) {
    db.prepare("DELETE FROM lesson_progress WHERE id = ?").run(existing.id);
    completed = false;
  } else {
    const id = createId("prog");
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO lesson_progress (id, user_id, course_id, lesson_id, completed_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, lesson.courseId, lessonId, now);
    completed = true;
  }

  const courseState = getCourseById(lesson.courseId, userId);
  return {
    lessonId,
    courseId: lesson.courseId,
    completed,
    completedLessons: courseState.completedLessons,
    totalLessons: courseState.totalLessons,
    progressPercent: courseState.progressPercent
  };
}

// ============================================================================
// Phase 2: Quiz Attempts, Bookmarks & Dashboard Summary
// ============================================================================
function recordQuizAttempt({ userId, courseId = null, categoryName, score, totalQuestions }) {
  const id = createId("quiz");
  const attemptedAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO quiz_attempts (id, user_id, course_id, category_name, score, total_questions, attempted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, courseId, categoryName, Number(score), Number(totalQuestions), attemptedAt);

  return { id, userId, courseId, categoryName, score: Number(score), totalQuestions: Number(totalQuestions), attemptedAt };
}

function listQuizAttempts(userId) {
  return db.prepare(`
    SELECT id, course_id as courseId, category_name as categoryName, score, total_questions as totalQuestions, attempted_at as attemptedAt
    FROM quiz_attempts
    WHERE user_id = ?
    ORDER BY attempted_at DESC
    LIMIT 20
  `).all(userId);
}

function addBookmark({ userId, resourceType, title, sourceRef, metadata = {} }) {
  const id = createId("bmk");
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO bookmarks (id, user_id, resource_type, title, source_ref, metadata_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, resourceType, title, String(sourceRef), JSON.stringify(metadata || {}), createdAt);

  return { id, userId, resourceType, title, sourceRef: String(sourceRef), metadata, createdAt };
}

function listBookmarks(userId) {
  const rows = db.prepare(`
    SELECT id, resource_type as resourceType, title, source_ref as sourceRef, metadata_json as metadataJson, created_at as createdAt
    FROM bookmarks
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);

  return rows.map((r) => ({
    id: r.id,
    resourceType: r.resourceType,
    title: r.title,
    sourceRef: r.sourceRef,
    metadata: JSON.parse(r.metadataJson || "{}"),
    createdAt: r.createdAt
  }));
}

function deleteBookmark(userId, bookmarkId) {
  const res = db.prepare("DELETE FROM bookmarks WHERE id = ? AND user_id = ?").run(bookmarkId, userId);
  return res.changes > 0;
}

function getDashboardSummary(user) {
  const allCourses = listCourses(user.id);
  const enrolledCourses = allCourses.filter((c) => c.isEnrolled);
  const completedLessonsTotal = db
    .prepare("SELECT COUNT(*) as c FROM lesson_progress WHERE user_id = ?")
    .get(user.id).c;

  const quizAttempts = listQuizAttempts(user.id);
  let averageQuizPercent = 0;
  if (quizAttempts.length > 0) {
    const sumPct = quizAttempts.reduce((acc, q) => acc + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0), 0);
    averageQuizPercent = Math.round(sumPct / quizAttempts.length);
  }

  const bookmarks = listBookmarks(user.id);
  const certificates = listUserCertificates(user.id);

  let instructorStats = null;
  if (user.role === "instructor") {
    const authoredCourses = allCourses.filter((c) => c.instructorId === user.id);
    const totalStudentEnrollments = authoredCourses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
    instructorStats = {
      authoredCoursesCount: authoredCourses.length,
      totalStudentEnrollments,
      authoredCourses
    };
  }

  return {
    user,
    stats: {
      enrolledCoursesCount: enrolledCourses.length,
      completedLessonsTotal,
      quizzesTakenCount: quizAttempts.length,
      averageQuizPercent,
      bookmarksCount: bookmarks.length,
      certificatesCount: certificates.length
    },
    enrolledCourses,
    recentQuizAttempts: quizAttempts.slice(0, 5),
    bookmarks,
    certificates,
    instructorStats
  };
}

function issueCertificate(userId, courseId) {
  const existing = db.prepare(`
    SELECT * FROM certificates WHERE user_id = ? AND course_id = ?
  `).get(userId, courseId);
  if (existing) {
    return {
      id: existing.id,
      userId: existing.user_id,
      courseId: existing.course_id,
      institution: existing.institution,
      courseTitle: existing.course_title,
      recipientName: existing.recipient_name,
      issueDate: existing.issue_date,
      verificationHash: existing.verification_hash,
      createdAt: existing.created_at
    };
  }

  const course = getCourseById(courseId, userId);
  if (!course) throw new Error("Course not found.");
  if (course.totalLessons > 0 && course.completedLessons < course.totalLessons) {
    throw new Error(`Course not completed yet (${course.completedLessons}/${course.totalLessons} lessons done).`);
  }

  const user = findUserById(userId);
  if (!user) throw new Error("User not found.");

  const certId = "cert-" + crypto.randomUUID();
  const issueDate = new Date().toISOString().split("T")[0];
  const payloadToHash = `${certId}:${userId}:${courseId}:${course.institution}:${issueDate}`;
  const verificationHash = crypto.createHash("sha256").update(payloadToHash).digest("hex").slice(0, 16).toUpperCase();

  db.prepare(`
    INSERT INTO certificates (id, user_id, course_id, institution, course_title, recipient_name, issue_date, verification_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    certId,
    userId,
    courseId,
    course.institution || "OpenLearn Academic Consortium",
    course.title,
    user.name,
    issueDate,
    verificationHash
  );

  return {
    id: certId,
    userId,
    courseId,
    institution: course.institution || "OpenLearn Academic Consortium",
    courseTitle: course.title,
    recipientName: user.name,
    issueDate,
    verificationHash
  };
}

function getCertificateById(certId) {
  const r = db.prepare("SELECT * FROM certificates WHERE id = ?").get(certId);
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    courseId: r.course_id,
    institution: r.institution,
    courseTitle: r.course_title,
    recipientName: r.recipient_name,
    issueDate: r.issue_date,
    verificationHash: r.verification_hash,
    createdAt: r.created_at
  };
}

function listUserCertificates(userId) {
  const rows = db.prepare("SELECT * FROM certificates WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    courseId: r.course_id,
    institution: r.institution,
    courseTitle: r.course_title,
    recipientName: r.recipient_name,
    issueDate: r.issue_date,
    verificationHash: r.verification_hash,
    createdAt: r.created_at
  }));
}

function addLectureNote(userId, courseId, lessonId, timestampSeconds, timestampLabel, content) {
  const noteId = "note-" + crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO lecture_notes (id, user_id, course_id, lesson_id, timestamp_seconds, timestamp_label, content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(noteId, userId, courseId, lessonId, timestampSeconds || 0, timestampLabel || "00:00", content, now, now);
  return { id: noteId, userId, courseId, lessonId, timestampSeconds, timestampLabel, content, createdAt: now };
}

function listLectureNotes(userId, lessonId) {
  const rows = db.prepare(`
    SELECT * FROM lecture_notes WHERE user_id = ? AND lesson_id = ? ORDER BY timestamp_seconds ASC, created_at ASC
  `).all(userId, lessonId);
  return rows.map((r) => ({
    id: r.id,
    courseId: r.course_id,
    lessonId: r.lesson_id,
    timestampSeconds: r.timestamp_seconds,
    timestampLabel: r.timestamp_label,
    content: r.content,
    createdAt: r.created_at
  }));
}

function deleteLectureNote(userId, noteId) {
  const res = db.prepare("DELETE FROM lecture_notes WHERE id = ? AND user_id = ?").run(noteId, userId);
  return res.changes > 0;
}

function addCourseReview(userId, courseId, rating, comment) {
  const existing = db.prepare("SELECT id FROM course_reviews WHERE user_id = ? AND course_id = ?").get(userId, courseId);
  const id = existing ? existing.id : "rev-" + crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO course_reviews (id, user_id, course_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, course_id) DO UPDATE SET rating=excluded.rating, comment=excluded.comment, created_at=excluded.created_at
  `).run(id, userId, courseId, rating, comment, now);
  return { id, userId, courseId, rating, comment, createdAt: now };
}

function listCourseReviews(courseId) {
  const rows = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.role as reviewer_role
    FROM course_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.course_id = ?
    ORDER BY r.created_at DESC
  `).all(courseId);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    reviewerName: r.reviewer_name,
    reviewerRole: r.reviewer_role,
    courseId: r.course_id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  }));
}

function addLessonDiscussion(userId, courseId, lessonId, content) {
  const id = "disc-" + crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO lesson_discussions (id, user_id, course_id, lesson_id, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, courseId, lessonId, content, now);
  return { id, userId, courseId, lessonId, content, createdAt: now };
}

function listLessonDiscussions(lessonId) {
  const rows = db.prepare(`
    SELECT d.*, u.name as author_name, u.role as author_role
    FROM lesson_discussions d
    JOIN users u ON d.user_id = u.id
    WHERE d.lesson_id = ?
    ORDER BY d.created_at ASC
  `).all(lessonId);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    authorName: r.author_name,
    authorRole: r.author_role,
    courseId: r.course_id,
    lessonId: r.lesson_id,
    content: r.content,
    createdAt: r.created_at
  }));
}

module.exports = {
  rawDb: db,
  createId,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  getSchemaStats,
  listCourses,
  getCourseById,
  createCourse,
  addLessonToCourse,
  deleteCourse,
  enrollUser,
  toggleLessonComplete,
  recordQuizAttempt,
  listQuizAttempts,
  addBookmark,
  listBookmarks,
  deleteBookmark,
  getDashboardSummary,
  issueCertificate,
  getCertificateById,
  listUserCertificates,
  addLectureNote,
  listLectureNotes,
  deleteLectureNote,
  addCourseReview,
  listCourseReviews,
  addLessonDiscussion,
  listLessonDiscussions
};

