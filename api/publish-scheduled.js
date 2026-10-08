import connectDB from './_lib/db.js';
import Post from './_lib/models/Post.js';

export default async function handler(req, res) {
  // Guarded by CRON_SECRET when set. Previously it was an open unauthenticated
  // write endpoint reachable by anyone, on any HTTP method.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = req.headers['x-cron-secret'];
    if (provided !== secret) return res.status(401).json({ error: 'Unauthorized' });
  } else if (process.env.NODE_ENV === 'production') {
    console.error('[api/publish-scheduled] CRON_SECRET is not set in production');
    return res.status(503).json({ error: 'Cron endpoint is not configured' });
  }

  try {
    await connectDB();

    const now = new Date();
    const result = await Post.updateMany(
      { published: false, scheduledAt: { $lte: now } },
      { $set: { published: true, scheduledAt: null } },
    );

    return res.json({ published: result.modifiedCount, timestamp: now.toISOString() });
  } catch (err) {
    console.error('[api/publish-scheduled]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
