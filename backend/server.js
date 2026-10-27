const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const db = require("./db");
const { handleAuthRoutes } = require("./routes/auth");
const { handleCourseRoutes } = require("./routes/courses");
const { handleLearningRoutes } = require("./routes/learning");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  });
  res.end(body);
  return true;
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

async function requestHandler(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  try {
    // Health & Phase Status Endpoint
    if (pathname === "/api/health" && req.method === "GET") {
      return sendJson(res, 200, {
        status: "ok",
        service: "OpenLearn LMS Backend",
        database: "SQLite (node:sqlite WAL mode)",
        stats: db.getSchemaStats()
      });
    }

    // Phase 1: Authentication Routes (/api/auth/*)
    if (pathname.startsWith("/api/auth/")) {
      const handled = await handleAuthRoutes(req, res, pathname, parseBody, sendJson);
      if (handled !== false) return;
    }

    // Course, Lesson & Enrollment Routes (/api/courses/*, /api/lessons/*)
    if (pathname.startsWith("/api/courses") || pathname.startsWith("/api/lessons")) {
      const handled = await handleCourseRoutes(req, res, pathname, parseBody, sendJson);
      if (handled !== false) return;
    }

    // Learning, Dashboard, Certificates, Notes, Reviews, Discussions & Bookmarks Routes
    const handledLearning = await handleLearningRoutes(req, res, pathname, parseBody, sendJson);
    if (handledLearning !== false) return;

    // Unknown /api/* route
    if (pathname.startsWith("/api/")) {
      return sendJson(res, 404, { error: `API endpoint not found: ${req.method} ${pathname}` });
    }

    // Serve built Vite frontend from dist/ (if built)
    const distDir = path.join(PUBLIC_DIR, "dist");
    const serveRoot = fs.existsSync(distDir) ? distDir : PUBLIC_DIR;
    const safePath = pathname === "/" ? "/index.html" : pathname;
    const filePath = path.join(serveRoot, path.normalize(safePath));

    if (!filePath.startsWith(serveRoot) || filePath.includes(path.join(PUBLIC_DIR, "backend"))) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  } catch (err) {
    console.error("Server Error:", err);
    sendJson(res, 500, { error: "Internal server error", details: err.message });
  }
}

function createServer() {
  return http.createServer(requestHandler);
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`OpenLearn LMS Server running at http://localhost:${PORT}`);
  });
}

module.exports = { createServer };
