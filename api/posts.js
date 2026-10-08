import connectDB from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';
import { handleCors } from './_lib/cors.js';
import Post from './_lib/models/Post.js';
import { pickPostFields } from '../shared/validators.js';
import { str, shortStr, toObjectId } from '../shared/http.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  try {
    await connectDB();

    // ---------------------------------------------------------------- GET --
    if (req.method === 'GET') {
      // Admin list — must be checked before the public slug branch.
      if (str(req.query?.admin) === 'true') {
        if (!requireAdmin(req, res)) return;
        return res.json(await Post.find().sort({ createdAt: -1 }));
      }

      const slug = shortStr(req.query?.slug, 300);
      if (slug) {
        const post = await Post.findOne({ slug, published: true });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        return res.json(post);
      }

      // Published posts list, without the heavy content field.
      const posts = await Post.find({ published: true })
        .select('-content')
        .sort({ createdAt: -1 });
      return res.json(posts);
    }

    // --------------------------------------------------------------- POST --
    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const clean = pickPostFields(req.body);
      if (!clean.title) return res.status(400).json({ error: 'Post title is required' });
      if (!clean.slug) return res.status(400).json({ error: 'Post slug is required' });
      return res.status(201).json(await Post.create(clean));
    }

    // ---------------------------------------------------------------- PUT --
    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      const id = toObjectId(req.body?.id);
      if (!id) return res.status(400).json({ error: 'Invalid or missing id' });

      // Same allowlist as create — previously this spread the raw body, letting
      // a caller overwrite createdAt/updatedAt and other non-editable fields.
      const clean = pickPostFields(req.body);
      const post = await Post.findByIdAndUpdate(id, clean, { new: true, runValidators: true });
      if (!post) return res.status(404).json({ error: 'Not found' });
      return res.json(post);
    }

    // ------------------------------------------------------------- DELETE --
    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return;
      const id = toObjectId(req.body?.id);
      if (!id) return res.status(400).json({ error: 'Invalid or missing id' });
      const deleted = await Post.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Not found' });
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/posts]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
