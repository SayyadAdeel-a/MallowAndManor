import jwt from 'jsonwebtoken';

// Express middleware wrappers. The implementations live in
// shared/express-auth.js so there is exactly one copy.
//
// TWO SHAPES, DO NOT MIX THEM UP:
//
//   middleware  (req, res, next) -> must call next()
//     export const authenticate = (req, res, next) => {...}
//     Use at ROUTE level:  router.put('/', requireAdmin, handler)
//
//   handler     (req, res) -> returns the user, or null after responding
//     export const authorizeAdmin = (req, res) => {...}
//     Use INSIDE a handler:  const user = authorizeAdmin(req, res); if (!user) return;
//
// Passing a handler as middleware throws "next is not a function". Passing
// middleware as a handler means next() is undefined and the request hangs.
// This has shipped twice, so eslint.config.js rejects the ambiguous arity.

export { authenticate, requireAdmin, getUser } from '../../shared/express-auth.js';
export { authorizeAdmin, authorizeUser } from '../../shared/auth.js';

// Backwards-compatible alias for the old return-value helper. Call it INSIDE a
// handler, never as route middleware.
export const verifyAuth = (req) => {
  const raw = req?.headers?.authorization;
  if (typeof raw !== 'string' || !raw.startsWith('Bearer ')) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    return jwt.verify(raw.slice(7).trim(), secret, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
};