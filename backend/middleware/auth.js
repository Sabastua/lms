const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "openlearn-lms-secret-key-2026";
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Hash a password using Node's native scrypt with a random 16-byte salt
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

/**
 * Verify a plaintext password against a stored salt:hash string
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
}

/**
 * Sign a JWT token (HS256)
 */
function signToken(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_EXPIRY_SECONDS
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");

  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Verify and decode a JWT token (HS256)
 */
function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [base64Header, base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user from request Authorization header
 */
function authenticateRequest(req, db) {
  const authHeader = req.headers["authorization"] || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) return null;

  const user = db.findUserById(decoded.id);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authenticateRequest
};
