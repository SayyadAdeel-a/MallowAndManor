import jwt from 'jsonwebtoken';
import { str } from './http.js';

// ---------------------------------------------------------------------------
// Auth core, shared by the serverless (api/) and Express (server/) stacks.
//
// KEY SECURITY FIX: previously every "admin" gate was really just "is this any
// validly-signed token?". `role` was copied into the JWT but never read. Now
// requireAdmin() actually asserts the role.
// ---------------------------------------------------------------------------

export const ACCESS_TTL = '15m';
export const REFRESH_TTL = '7d';

// Pin HS256 on BOTH sides. On verify we pass an allowlist; on sign the option is
// singular `algorithm`. (Passing `algorithms` to jwt.sign throws
// '"algorithms" is not allowed in "options"'.)
const VERIFY_OPTS = { algorithms: ['HS256'] };
const SIGN_OPTS = { algorithm: 'HS256' };

/** Extract the bearer token from the Authorization header. */
export const bearerToken = (req) => {
  const raw = req?.headers?.authorization;
  if (typeof raw !== 'string') return '';
  if (!raw.startsWith('Bearer ')) return '';
  return raw.slice(7).trim();
};

/** Verify an access token. Returns the payload, or null. Never throws. */
export const verifyToken = (req) => {
  const token = bearerToken(req);
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null; // fail closed if the secret is missing
  try {
    return jwt.verify(token, secret, VERIFY_OPTS);
  } catch {
    return null;
  }
};

/** Verify a refresh token. Returns the payload, or null. Never throws. */
export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) return null;
  try {
    return jwt.verify(str(token), secret, VERIFY_OPTS);
  } catch {
    return null;
  }
};

export const isAdmin = (user) => !!user && user.role === 'admin';

/**
 * Require a signed-in ADMIN — SERVERLESS style.
 *
 * Writes the error response and returns null on failure:
 *   const user = authorizeAdmin(req, res);
 *   if (!user) return;
 *
 * NOTE THE NAME. This is deliberately NOT called `requireAdmin`. It is not
 * Express middleware: it never calls next(). Passing it to router.put() as
 * middleware makes every request hang until the socket times out — the exact
 * bug that shipped in server/routes/settings.js. The Express version is
 * `requireAdmin` in shared/express-auth.js.
 */
export const authorizeAdmin = (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  if (!isAdmin(user)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
};

/** Require any signed-in user (401 only) — serverless style. */
export const authorizeUser = (req, res) => {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
};

/** Issue an access + refresh pair, embedding the current tokenVersion. */
export const signTokens = (user) => {
  const tokenVersion = Number(user.tokenVersion) || 0;
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TTL, ...SIGN_OPTS },
  );
  const refreshToken = jwt.sign(
    { userId: user._id, tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TTL, ...SIGN_OPTS },
  );
  return { accessToken, refreshToken };
};

/**
 * Validate a refresh token against the user's current tokenVersion.
 * Returns the user, or null if the token is invalid, expired, or revoked.
 */
export const validateRefresh = async (User, token) => {
  const decoded = verifyRefreshToken(token);
  if (!decoded?.userId) return null;
  const user = await User.findById(decoded.userId);
  if (!user) return null;
  // Tokens minted before this field existed carry no version; treat as 0 so
  // existing sessions keep working until they naturally expire.
  const tokenVersion = Number(decoded.tokenVersion) || 0;
  if (tokenVersion !== (Number(user.tokenVersion) || 0)) return null;
  return user;
};

/** Revoke every outstanding refresh token for a user. Called on logout. */
export const revokeRefreshTokens = async (User, userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};
