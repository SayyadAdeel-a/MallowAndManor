import { verifyToken, isAdmin } from './auth.js';

// Express middleware wrappers around the shared auth core.
//
// CRITICAL: these have arity 3 and call next(). They are the ONLY auth exports
// that may be passed to router.get/post/put/delete(). The serverless guards in
// shared/auth.js (`authorizeAdmin` / `authorizeUser`) take (req, res), never
// call next(), and will hang the request if mistakenly used as middleware.
//
// This exact mistake shipped twice: once as `verifyAuth` in
// server/routes/settings.js, and once as a re-export of the serverless
// `requireAdmin`. Keeping the names distinct is deliberate.

// Require any signed-in user.
export const authenticate = (req, res, next) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  return next();
};

// Require a signed-in ADMIN. Asserts role === 'admin'.
export const requireAdmin = (req, res, next) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!isAdmin(user)) return res.status(403).json({ error: 'Forbidden' });
  req.user = user;
  return next();
};

// Read the authenticated user off a request inside a handler.
export const getUser = (req) => req.user || verifyToken(req) || null;
