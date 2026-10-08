import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { signTokens, validateRefresh, revokeRefreshTokens, verifyToken } from '../../shared/auth.js';
import { checkRateLimit } from '../../shared/rate-limit.js';
import { str, clientIp } from '../../shared/http.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (v) => str(v).toLowerCase().trim().slice(0, 254);

/**
 * Shared login handler for POST / and the legacy POST /login.
 *
 * Note the previous version passed `req.body.email` straight into
 * `User.findOne({ email })`. Express parses JSON, so `{"email":{"$ne":null}}`
 * became a working operator-injection probe. Types are validated first now.
 */
const login = async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {};

  const rl = checkRateLimit(req, 'login', 8, 15 * 60 * 1000);
  if (rl.blocked) {
    res.setHeader('Retry-After', String(rl.retryAfterSec || 900));
    return res.status(429).json({
      error: `Too many login attempts. Try again in ${rl.remainingMin} minute(s).`,
      retryAfter: rl.remainingMin * 60,
    });
  }

  const email = normalizeEmail(body.email);
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  const password = body.password;
  if (typeof password !== 'string' || password.length < 6 || password.length > 200) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    console.warn(`[auth] failed login for ${email} from ${clientIp(req)}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return res.json({
    ...signTokens(user),
    user: { id: user._id, email: user.email, role: user.role },
  });
};

// POST /api/auth - login | refresh | logout
router.post('/', async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    if (body.email !== undefined || body.password !== undefined) {
      return await login(req, res);
    }

    // Logout - revokes outstanding refresh tokens.
    // The access token is optional here: a client whose 15m access token has
    // already expired must still be able to log out, and revoking is what
    // actually matters (it kills the 7-day refresh token).
    if (body.logout === true) {
      const auth = req.user || verifyToken(req);
      if (auth?.userId) await revokeRefreshTokens(User, auth.userId);
      return res.json({ ok: true });
    }

    if (body.refreshToken !== undefined) {
      if (typeof body.refreshToken !== 'string' || body.refreshToken.length > 1000) {
        return res.status(400).json({ error: 'Invalid refresh token' });
      }
      const user = await validateRefresh(User, body.refreshToken);
      if (!user) return res.status(401).json({ error: 'Invalid or expired refresh token' });
      return res.json(signTokens(user));
    }

    return res.status(400).json({ error: 'Invalid auth request' });
  } catch (err) { next(err); }
});

// GET /api/auth - current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// --- legacy aliases (kept for backwards compatibility) ---------------------

router.post('/login', async (req, res, next) => {
  try {
    return await login(req, res);
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (typeof refreshToken !== 'string') return res.status(401).json({ error: 'No refresh token' });
    const user = await validateRefresh(User, refreshToken);
    if (!user) return res.status(401).json({ error: 'Invalid or expired refresh token' });
    res.json(signTokens(user));
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const auth = req.user || verifyToken(req);
    if (auth?.userId) await revokeRefreshTokens(User, auth.userId);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
