import { Router } from 'express';
import Post from '../models/Post.js';

const router = Router();

// GET /api/publish-scheduled — publishes any posts whose scheduledAt has passed
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const result = await Post.updateMany(
      { published: false, scheduledAt: { $lte: now } },
      { $set: { published: true, scheduledAt: null } }
    );
    res.json({ published: result.modifiedCount, timestamp: now.toISOString() });
  } catch (err) { next(err); }
});

export default router;
