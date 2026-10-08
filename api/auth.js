import connectDB from './_lib/db.js';
import bcrypt from 'bcryptjs';
import { verifyToken, authorizeUser, signTokens, validateRefresh, revokeRefreshTokens } from '../shared/auth.js';
import { checkRateLimit } from './_lib/rateLimit.js';
import { handleCors } from './_lib/cors.js';
import User from './_lib/models/User.js';
import { str, clientIp } from '../shared/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (v) => str(v).toLowerCase().trim().slice(0, 254);

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // --------------------------------------------------------------- POST --
    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : {};

      // ---- login ------------------------------------------------------
      if (body.email !== undefined || body.password !== undefined) {
        const email = normalizeEmail(body.email);

        // Rate limit BEFORE the bcrypt comparison so a wrong password still
        // costs the attacker a full bcrypt round, but the counter is keyed on
        // IP only — a malformed body can't be used to lock out a real user.
        const rl = checkRateLimit(req, 'login', 8, 15 * 60 * 1000);
        if (rl.blocked) {
          res.setHeader('Retry-After', String(rl.retryAfterSec || 900));
          return res.status(429).json({
            error: `Too many login attempts. Try again in ${rl.remainingMin} minute(s).`,
            retryAfter: rl.remainingMin * 60,
          });
        }

        // Validate types. Previously `email` flowed into findOne() unchecked,
        // so `{"email": {"$ne": null}}` was a working operator-injection probe.
        if (!email || !EMAIL_RE.test(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        const password = body.password;
        if (typeof password !== 'string' || password.length < 6 || password.length > 200) {
          return res.status(400).json({ error: 'Invalid password' });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          console.warn(`[api/auth] failed login for ${email} from ${clientIp(req)}`);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        return res.json({
          ...signTokens(user),
          user: { id: user._id, email: user.email, role: user.role },
        });
      }

      // ---- logout -----------------------------------------------------
      // Previously this checked req.url for '/logout', which is never true on
      // Vercel, and it never invalidated anything. Now it bumps tokenVersion so
      // every outstanding refresh token dies.
      //
      // The access token is optional: a client whose 15m token already expired
      // must still be able to log out, and revocation is what matters.
      if (body.logout === true) {
        const auth = verifyToken(req);
        if (auth?.userId) await revokeRefreshTokens(User, auth.userId);
        return res.json({ ok: true });
      }

      // ---- refresh ----------------------------------------------------
      if (body.refreshToken !== undefined) {
        if (typeof body.refreshToken !== 'string' || body.refreshToken.length > 1000) {
          return res.status(400).json({ error: 'Invalid refresh token' });
        }
        const user = await validateRefresh(User, body.refreshToken);
        if (!user) return res.status(401).json({ error: 'Invalid or expired refresh token' });
        return res.json(signTokens(user));
      }

      return res.status(400).json({ error: 'Invalid auth request' });
    }

    // ----------------------------------------------------------------- GET --
    if (req.method === 'GET') {
      const session = authorizeUser(req, res);
      if (!session) return;
      const dbUser = await User.findById(session.userId).select('_id email role');
      if (!dbUser) return res.status(404).json({ error: 'User not found' });
      return res.json({ _id: dbUser._id, email: dbUser.email, role: dbUser.role });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/auth]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
