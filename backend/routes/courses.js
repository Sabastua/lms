const db = require("../db");
const { authenticateRequest } = require("../middleware/auth");

/**
 * Handle Course, Lesson, Enrollment & Progress API routes
 * - GET    /api/courses
 * - POST   /api/courses                   (Instructor only)
 * - GET    /api/courses/:id
 * - DELETE /api/courses/:id               (Instructor only)
 * - POST   /api/courses/:id/enroll        (Authenticated user)
 * - POST   /api/courses/:id/lessons       (Instructor only)
 * - POST   /api/lessons/:id/toggle-complete (Authenticated user)
 */
async function handleCourseRoutes(req, res, pathname, parseBody, sendJson) {
  const authUser = authenticateRequest(req, db);

  // GET /api/courses
  if (pathname === "/api/courses" && req.method === "GET") {
    const courses = db.listCourses(authUser ? authUser.id : null);
    return sendJson(res, 200, { courses });
  }

  // POST /api/courses (Instructor creates a new course)
  if (pathname === "/api/courses" && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    if (authUser.role !== "instructor") {
      return sendJson(res, 403, { error: "Only instructors can create courses." });
    }

    const body = await parseBody(req);
    const title = (body.title || "").trim();
    const category = (body.category || "").trim();
    const description = (body.description || "").trim();
    const difficulty = (body.difficulty || "Beginner").trim();
    const institution = (body.institution || "Open University & OER").trim();
    const lessons = Array.isArray(body.lessons) ? body.lessons : [];

    if (!title || !category || !description) {
      return sendJson(res, 400, { error: "Course title, category, and description are required." });
    }

    const course = db.createCourse({
      title,
      category,
      description,
      difficulty,
      institution,
      instructorId: authUser.id,
      lessons
    });

    return sendJson(res, 201, {
      message: "Course published successfully.",
      course
    });
  }

  // Match /api/courses/:id/enroll
  const enrollMatch = pathname.match(/^\/api\/courses\/([^/]+)\/enroll$/);
  if (enrollMatch && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required to enroll in a course." });
    }
    const courseId = decodeURIComponent(enrollMatch[1]);
    const course = db.getCourseById(courseId, authUser.id);
    if (!course) {
      return sendJson(res, 404, { error: "Course not found." });
    }
    const enrollment = db.enrollUser(authUser.id, courseId);
    const updatedCourse = db.getCourseById(courseId, authUser.id);
    return sendJson(res, 200, {
      message: "Enrolled in course successfully.",
      enrollment,
      course: updatedCourse
    });
  }

  // Match /api/courses/:id/lessons
  const addLessonMatch = pathname.match(/^\/api\/courses\/([^/]+)\/lessons$/);
  if (addLessonMatch && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    if (authUser.role !== "instructor") {
      return sendJson(res, 403, { error: "Only instructors can add lessons to a course." });
    }

    const courseId = decodeURIComponent(addLessonMatch[1]);
    const course = db.getCourseById(courseId, authUser.id);
    if (!course) {
      return sendJson(res, 404, { error: "Course not found." });
    }

    const body = await parseBody(req);
    const title = (body.title || "").trim();
    const lessonType = (body.lessonType || "wikipedia").trim();
    const sourceRef = String(body.sourceRef || "").trim();
    const contentBody = (body.contentBody || "").trim();

    if (!title || !sourceRef) {
      return sendJson(res, 400, { error: "Lesson title and sourceRef are required." });
    }

    const lesson = db.addLessonToCourse(courseId, {
      title,
      lessonType,
      sourceRef,
      contentBody
    });

    return sendJson(res, 201, {
      message: "Lesson added to course.",
      lesson,
      course: db.getCourseById(courseId, authUser.id)
    });
  }

  // Match /api/courses/:id
  const courseIdMatch = pathname.match(/^\/api\/courses\/([^/]+)$/);
  if (courseIdMatch) {
    const courseId = decodeURIComponent(courseIdMatch[1]);

    if (req.method === "GET") {
      const course = db.getCourseById(courseId, authUser ? authUser.id : null);
      if (!course) {
        return sendJson(res, 404, { error: "Course not found." });
      }
      return sendJson(res, 200, { course });
    }

    if (req.method === "DELETE") {
      if (!authUser || authUser.role !== "instructor") {
        return sendJson(res, 403, { error: "Only instructors can delete courses." });
      }
      const deleted = db.deleteCourse(courseId);
      if (!deleted) {
        return sendJson(res, 404, { error: "Course not found." });
      }
      return sendJson(res, 200, { message: "Course deleted." });
    }
  }

  // Match /api/lessons/:id/toggle-complete
  const lessonToggleMatch = pathname.match(/^\/api\/lessons\/([^/]+)\/toggle-complete$/);
  if (lessonToggleMatch && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required to track lesson progress." });
    }
    const lessonId = decodeURIComponent(lessonToggleMatch[1]);
    const progress = db.toggleLessonComplete(authUser.id, lessonId);
    if (!progress) {
      return sendJson(res, 404, { error: "Lesson not found." });
    }
    return sendJson(res, 200, {
      message: progress.completed ? "Lesson marked as completed." : "Lesson marked as incomplete.",
      progress
    });
  }

  return false;
}

module.exports = { handleCourseRoutes };
