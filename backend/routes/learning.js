const db = require("../db");
const { authenticateRequest } = require("../middleware/auth");

/**
 * Handle Learner Dashboard, Quiz Attempts, and Saved OER Bookmarks
 * - GET    /api/dashboard
 * - GET    /api/quizzes/attempts
 * - POST   /api/quizzes/attempts
 * - GET    /api/bookmarks
 * - POST   /api/bookmarks
 * - DELETE /api/bookmarks/:id
 */
async function handleLearningRoutes(req, res, pathname, parseBody, sendJson) {
  const authUser = authenticateRequest(req, db);

  // GET /api/dashboard
  if (pathname === "/api/dashboard" && req.method === "GET") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required to load dashboard." });
    }
    const summary = db.getDashboardSummary(authUser);
    return sendJson(res, 200, summary);
  }

  // GET /api/quizzes/attempts
  if (pathname === "/api/quizzes/attempts" && req.method === "GET") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const attempts = db.listQuizAttempts(authUser.id);
    return sendJson(res, 200, { attempts });
  }

  // POST /api/quizzes/attempts
  if (pathname === "/api/quizzes/attempts" && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required to save quiz results." });
    }
    const body = await parseBody(req);
    const categoryName = (body.categoryName || "General Quiz").trim();
    const score = Number(body.score ?? 0);
    const totalQuestions = Number(body.totalQuestions ?? 5);
    const courseId = body.courseId || null;

    const attempt = db.recordQuizAttempt({
      userId: authUser.id,
      courseId,
      categoryName,
      score,
      totalQuestions
    });

    return sendJson(res, 201, {
      message: "Quiz score recorded.",
      attempt
    });
  }

  // GET /api/bookmarks
  if (pathname === "/api/bookmarks" && req.method === "GET") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const bookmarks = db.listBookmarks(authUser.id);
    return sendJson(res, 200, { bookmarks });
  }

  // POST /api/bookmarks
  if (pathname === "/api/bookmarks" && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required to bookmark OER items." });
    }
    const body = await parseBody(req);
    const resourceType = (body.resourceType || "wikipedia").trim();
    const title = (body.title || "").trim();
    const sourceRef = String(body.sourceRef || "").trim();
    const metadata = body.metadata || {};

    if (!title || !sourceRef) {
      return sendJson(res, 400, { error: "Title and sourceRef are required to save a bookmark." });
    }

    const bookmark = db.addBookmark({
      userId: authUser.id,
      resourceType,
      title,
      sourceRef,
      metadata
    });

    return sendJson(res, 201, {
      message: "Resource bookmarked.",
      bookmark
    });
  }

  // DELETE /api/bookmarks/:id
  const bookmarkDelMatch = pathname.match(/^\/api\/bookmarks\/([^/]+)$/);
  if (bookmarkDelMatch && req.method === "DELETE") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const bookmarkId = decodeURIComponent(bookmarkDelMatch[1]);
    const deleted = db.deleteBookmark(authUser.id, bookmarkId);
    if (!deleted) {
      return sendJson(res, 404, { error: "Bookmark not found." });
    }
    return sendJson(res, 200, { message: "Bookmark removed." });
  }

  // --- CERTIFICATES ---

  // POST /api/courses/:id/certificate (Claim/issue certificate for completed course)
  const certClaimMatch = pathname.match(/^\/api\/courses\/([^/]+)\/certificate$/);
  if (certClaimMatch && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required to claim certificate." });
    }
    const courseId = decodeURIComponent(certClaimMatch[1]);
    try {
      const certificate = db.issueCertificate(authUser.id, courseId);
      return sendJson(res, 200, {
        message: "Certificate generated successfully!",
        certificate
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // GET /api/user/certificates (List authenticated user's certificates)
  if (pathname === "/api/user/certificates" && req.method === "GET") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const certificates = db.listUserCertificates(authUser.id);
    return sendJson(res, 200, { certificates });
  }

  // GET /api/certificates/:id (Public verification endpoint)
  const certVerifyMatch = pathname.match(/^\/api\/certificates\/([^/]+)$/);
  if (certVerifyMatch && req.method === "GET") {
    const certId = decodeURIComponent(certVerifyMatch[1]);
    const cert = db.getCertificateById(certId);
    if (!cert) {
      return sendJson(res, 404, { error: "Certificate not found or invalid ID." });
    }
    return sendJson(res, 200, {
      valid: true,
      certificate: cert
    });
  }

  // --- LECTURE NOTES ---

  // GET /api/lessons/:id/notes
  const notesListMatch = pathname.match(/^\/api\/lessons\/([^/]+)\/notes$/);
  if (notesListMatch && req.method === "GET") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const lessonId = decodeURIComponent(notesListMatch[1]);
    const notes = db.listLectureNotes(authUser.id, lessonId);
    return sendJson(res, 200, { notes });
  }

  // POST /api/lessons/:id/notes
  if (notesListMatch && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const lessonId = decodeURIComponent(notesListMatch[1]);
    const body = await parseBody(req);
    const content = (body.content || "").trim();
    if (!content) {
      return sendJson(res, 400, { error: "Note content cannot be empty." });
    }
    const courseId = body.courseId || "";
    const timestampSeconds = Math.max(0, parseInt(body.timestampSeconds, 10) || 0);
    const timestampLabel = (body.timestampLabel || "00:00").trim();

    const note = db.addLectureNote(
      authUser.id,
      courseId,
      lessonId,
      timestampSeconds,
      timestampLabel,
      content
    );
    return sendJson(res, 201, { message: "Note saved.", note });
  }

  // DELETE /api/notes/:id
  const noteDelMatch = pathname.match(/^\/api\/notes\/([^/]+)$/);
  if (noteDelMatch && req.method === "DELETE") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const noteId = decodeURIComponent(noteDelMatch[1]);
    const deleted = db.deleteLectureNote(authUser.id, noteId);
    if (!deleted) {
      return sendJson(res, 404, { error: "Note not found." });
    }
    return sendJson(res, 200, { message: "Note deleted." });
  }

  // --- COURSE REVIEWS ---

  // GET /api/courses/:id/reviews
  const reviewsMatch = pathname.match(/^\/api\/courses\/([^/]+)\/reviews$/);
  if (reviewsMatch && req.method === "GET") {
    const courseId = decodeURIComponent(reviewsMatch[1]);
    const reviews = db.listCourseReviews(courseId);
    return sendJson(res, 200, { reviews });
  }

  // POST /api/courses/:id/reviews
  if (reviewsMatch && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const courseId = decodeURIComponent(reviewsMatch[1]);
    const body = await parseBody(req);
    const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5));
    const comment = (body.comment || "").trim();
    if (!comment) {
      return sendJson(res, 400, { error: "Review comment cannot be empty." });
    }
    const review = db.addCourseReview(authUser.id, courseId, rating, comment);
    return sendJson(res, 201, { message: "Review posted.", review });
  }

  // --- LESSON DISCUSSIONS ---

  // GET /api/lessons/:id/discussions
  const discMatch = pathname.match(/^\/api\/lessons\/([^/]+)\/discussions$/);
  if (discMatch && req.method === "GET") {
    const lessonId = decodeURIComponent(discMatch[1]);
    const discussions = db.listLessonDiscussions(lessonId);
    return sendJson(res, 200, { discussions });
  }

  // POST /api/lessons/:id/discussions
  if (discMatch && req.method === "POST") {
    if (!authUser) {
      return sendJson(res, 401, { error: "Authentication required." });
    }
    const lessonId = decodeURIComponent(discMatch[1]);
    const body = await parseBody(req);
    const courseId = body.courseId || "";
    const content = (body.content || "").trim();
    if (!content) {
      return sendJson(res, 400, { error: "Discussion message cannot be empty." });
    }
    const discussion = db.addLessonDiscussion(authUser.id, courseId, lessonId, content);
    return sendJson(res, 201, { message: "Message posted.", discussion });
  }

  return false;
}

module.exports = { handleLearningRoutes };
