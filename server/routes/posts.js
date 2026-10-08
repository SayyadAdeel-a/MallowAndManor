import { Router } from 'express';
import Post from '../models/Post.js';
import { requireAdmin, authorizeAdmin } from '../middleware/auth.js';
import { pickPostFields } from '../../shared/validators.js';
import { str, shortStr, toObjectId } from '../../shared/http.js';

const router = Router();

// GET /api/posts — public (?slug= for one post, ?admin=true for the full list)
router.get('/', async (req, res, next) => {
  try {
    const { admin } = req.query;

    // Admin list must be checked before the public slug branch.
    // NOTE: `requireAdmin` here is the HANDLER form (req, res) -> user|null.
    // The middleware form (req, res, next) is only for router-level mounting.
    if (str(admin) === 'true') {
      const user = authorizeAdmin(req, res);
      if (!user) return;
      return res.json(await Post.find().sort({ createdAt: -1 }));
    }

    const slug = shortStr(req.query.slug, 300);
    if (slug) {
      const post = await Post.findOne({ slug, published: true });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      return res.json(post);
    }

    const posts = await Post.find({ published: true }).select('-content').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) { next(err); }
});

// POST /api/posts — admin (create)
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const clean = pickPostFields(req.body);
    if (!clean.title) return res.status(400).json({ error: 'Post title is required' });
    if (!clean.slug) return res.status(400).json({ error: 'Post slug is required' });
    res.status(201).json(await Post.create(clean));
  } catch (err) { next(err); }
});

// PUT /api/posts — admin (update)
router.put('/', requireAdmin, async (req, res, next) => {
  try {
    const id = toObjectId(req.body?.id);
    if (!id) return res.status(400).json({ error: 'Invalid or missing id' });
    // Same allowlist as create; previously the raw body was spread in.
    const post = await Post.findByIdAndUpdate(id, pickPostFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json({ error: 'Not found' });
    res.json(post);
  } catch (err) { next(err); }
});

// DELETE /api/posts — admin
router.delete('/', requireAdmin, async (req, res, next) => {
  try {
    const id = toObjectId(req.body?.id);
    if (!id) return res.status(400).json({ error: 'Invalid or missing id' });
    const deleted = await Post.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
