import { Router } from 'express';
import Post from '../models/Post.js';

const router = Router();

// GET /api/publish-scheduled - publishes any posts whose scheduledAt has passed
//
// Guarded by CRON_SECRET when set, matching api/publish-scheduled.js. This was
// previously an open, unauthenticated write endpoint.
router.get('/', async (req, res, next) => {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const provided = req.headers['x-cron-secret'];
      if (provided !== secret) return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date();
    const result = await Post.updateMany(
      { published: false, scheduledAt: { $lte: now } },
      { $set: { published: true, scheduledAt: null } },
    );
    res.json({ published: result.modifiedCount, timestamp: now.toISOString() });
  } catch (err) { next(err); }
});

export default router;
