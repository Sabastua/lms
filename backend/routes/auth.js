const db = require("../db");
const {
  hashPassword,
  verifyPassword,
  signToken,
  authenticateRequest
} = require("../middleware/auth");

/**
 * Handle Authentication API routes (/api/auth/*)
 */
async function handleAuthRoutes(req, res, pathname, parseBody, sendJson) {
  // POST /api/auth/register
  if (pathname === "/api/auth/register" && req.method === "POST") {
    const body = await parseBody(req);
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const role = body.role === "instructor" ? "instructor" : "learner";
    const bio = (body.bio || "").trim();

    if (!name || !email || !password) {
      return sendJson(res, 400, {
        error: "Name, email, and password are required."
      });
    }

    if (password.length < 6) {
      return sendJson(res, 400, {
        error: "Password must be at least 6 characters long."
      });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return sendJson(res, 409, {
        error: "An account with this email already exists."
      });
    }

    const passwordHash = hashPassword(password);
    const user = db.createUser({ name, email, passwordHash, role, bio });
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return sendJson(res, 201, {
      message: "Account registered successfully.",
      token,
      user
    });
  }

  // POST /api/auth/login
  if (pathname === "/api/auth/login" && req.method === "POST") {
    const body = await parseBody(req);
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return sendJson(res, 400, {
        error: "Email and password are required."
      });
    }

    const userRecord = db.findUserByEmail(email);
    if (!userRecord || !verifyPassword(password, userRecord.passwordHash)) {
      return sendJson(res, 401, {
        error: "Invalid email or password."
      });
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role,
      bio: userRecord.bio,
      createdAt: userRecord.createdAt
    };

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return sendJson(res, 200, {
      message: "Logged in successfully.",
      token,
      user
    });
  }

  // GET /api/auth/me
  if (pathname === "/api/auth/me" && req.method === "GET") {
    const authUser = authenticateRequest(req, db);
    if (!authUser) {
      return sendJson(res, 401, { error: "Unauthorized. Valid Bearer token required." });
    }
    const fullUser = db.findUserById(authUser.id);
    return sendJson(res, 200, { user: fullUser });
  }

  // PUT /api/auth/profile
  if (pathname === "/api/auth/profile" && req.method === "PUT") {
    const authUser = authenticateRequest(req, db);
    if (!authUser) {
      return sendJson(res, 401, { error: "Unauthorized. Valid Bearer token required." });
    }
    const body = await parseBody(req);
    const updated = db.updateUserProfile(authUser.id, {
      name: body.name ? String(body.name).trim() : undefined,
      bio: body.bio !== undefined ? String(body.bio).trim() : undefined
    });
    return sendJson(res, 200, {
      message: "Profile updated.",
      user: updated
    });
  }

  return false;
}

module.exports = { handleAuthRoutes };
