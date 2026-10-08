import jwt from 'jsonwebtoken';

// Re-exports of the shared auth core for the Vercel functions.
//
// IMPORTANT: the serverless guard is `authorizeAdmin` (NOT middleware — it never
// calls next()). The Express middleware is `requireAdmin`, re-exported from
// shared/express-auth.js. Mixing those two up hangs the request, so they are
// given different names on purpose.
export {
  verifyToken,
  authorizeAdmin,
  authorizeUser,
  isAdmin,
  signTokens,
} from '../../shared/auth.js';

// Backwards-compatible alias: `requireAdmin` in api/ means the serverless guard.
export { authorizeAdmin as requireAdmin } from '../../shared/auth.js';

// Legacy helper kept for any caller that imported `authenticate` from here.
export const authenticate = (req, res) => {
  const raw = req?.headers?.authorization;
  if (typeof raw !== 'string' || !raw.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  try {
    return jwt.verify(raw.slice(7).trim(), secret, { algorithms: ['HS256'] });
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
};
