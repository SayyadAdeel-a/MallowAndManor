import connectDB from './_lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyToken } from './_lib/auth.js';
import { checkRateLimit, resetRateLimit } from './_lib/rateLimit.js';
import { handleCors } from './_lib/cors.js';
import User from './_lib/models/User.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    if (req.method === 'POST') {
      const { refreshToken } = req.body;

      // POST /api/auth/login
      if (req.body?.email && req.body?.password) {
        // Rate limiting
        const rateLimit = checkRateLimit(req);
        if (rateLimit.blocked) {
          return res.status(429).json({
            error: `Too many login attempts. Try again in ${rateLimit.remainingMin} minutes.`,
            retryAfter: rateLimit.remainingMin * 60,
          });
        }

        const { email, password } = req.body;

        // Input validation
        if (!email || typeof email !== 'string' || email.length > 254) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Sanitize email
        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          console.log(`Failed login attempt for ${cleanEmail} from IP: ${rateLimit.ip}`);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Successful login - reset rate limit
        resetRateLimit(rateLimit.ip);

        const accessToken = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );
        const newRefreshToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({ accessToken, refreshToken: newRefreshToken, user: { id: user._id, email: user.email, role: user.role } });
      }

      // POST /api/auth/refresh
      if (refreshToken) {
        if (typeof refreshToken !== 'string' || refreshToken.length > 1000) {
          return res.status(400).json({ error: 'Invalid refresh token' });
        }

        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          const user = await User.findById(decoded.userId);
          if (!user) return res.status(401).json({ error: 'User not found' });

          const accessToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
          );
          const newRefreshToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
          );

          return res.json({ accessToken, refreshToken: newRefreshToken });
        } catch {
          return res.status(401).json({ error: 'Invalid refresh token' });
        }
      }

      // POST /api/auth/logout
      if (req.url?.includes('/logout') || req.body?.logout) {
        return res.json({ ok: true });
      }

      return res.status(400).json({ error: 'Invalid auth request' });
    }

    if (req.method === 'GET') {
      // GET /api/auth/me
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const dbUser = await User.findById(user.userId);
      if (!dbUser) return res.status(404).json({ error: 'User not found' });

      return res.json({ _id: dbUser._id, email: dbUser.email, role: dbUser.role });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
