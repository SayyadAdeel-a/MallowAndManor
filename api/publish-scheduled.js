import connectDB from './_lib/db.js';
import Post from './_lib/models/Post.js';

export default async function handler(req, res) {
  try {
    await connectDB();

    const now = new Date();
    const result = await Post.updateMany(
      { published: false, scheduledAt: { $lte: now } },
      { $set: { published: true, scheduledAt: null } }
    );

    return res.json({
      published: result.modifiedCount,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
